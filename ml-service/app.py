"""NeuroFixia ML service - one Flask app hosting every model used by the platform.

Replaces the four separate Flask apps that used to live in python-api/, python-api/sensory,
backend/SocialBackend/Ml_models and backend/cognitive/ML (ports 5001/5002/5021/5031).

Endpoints (all JSON responses):
  GET  /health
  POST /behavioral/analyze   multipart: video (webm/mp4, optional), scanpath (png, optional),
                             expressions (JSON list of 4 answers, optional)
  POST /cognitive/predict    {"features": {...9 named features...}} or {"features": [9 numbers]}
  POST /social/analyze       {"answers": ["yes"/"no" x8], "q9": str, "q10": str}
  POST /sensory/predict      multipart: file (video)
"""
import json
import logging
import os
import tempfile
import threading

import numpy as np

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
from flask import Flask, jsonify, request  # noqa: E402

import preprocessing as pp  # noqa: E402

BASE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(BASE, "models")
log = logging.getLogger("ml-service")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 300 * 1024 * 1024


# --------------------------------------------------------------------------- lazy model registry
class Registry:
    """Loads each model the first time it is needed (keeps start-up fast, saves RAM)."""

    def __init__(self):
        self._lock = threading.Lock()
        self._cache = {}

    def get(self, name, loader):
        if name not in self._cache:
            with self._lock:
                if name not in self._cache:
                    log.info("loading model %s", name)
                    self._cache[name] = loader()
        return self._cache[name]


models = Registry()


def _keras(path):
    import tensorflow as tf
    return tf.keras.models.load_model(os.path.join(MODELS, path), compile=False)


def _joblib(path):
    import joblib
    return joblib.load(os.path.join(MODELS, path))


def _pose():
    import mediapipe as mp
    return mp.solutions.pose.Pose(static_image_mode=False, model_complexity=1,
                                  min_detection_confidence=0.5, min_tracking_confidence=0.5)


_pose_lock = threading.Lock()  # MediaPipe graphs are not thread-safe


def iter_video_frames(path, target_fps=10.0, max_frames=900):
    """Yield BGR frames sampled at ~target_fps (webm from MediaRecorder often reports fps=0/1000)."""
    import cv2
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0 or fps > 120:
        fps = 30.0
    step = max(1, int(round(fps / target_fps)))
    idx = kept = 0
    while kept < max_frames:
        ok, frame = cap.read()
        if not ok:
            break
        if idx % step == 0:
            kept += 1
            yield frame
        idx += 1
    cap.release()


def pose_landmarks_sequence(path, target_fps=10.0):
    """Returns list of (33,4) arrays [x, y, z, visibility] for frames where a person was found."""
    import cv2
    out = []
    with _pose_lock:
        pose = models.get("pose", _pose)
        for frame in iter_video_frames(path, target_fps):
            h, w = frame.shape[:2]
            if max(h, w) > 960:  # speed: pose does not need full-HD
                s = 960 / max(h, w)
                frame = cv2.resize(frame, (int(w * s), int(h * s)))
            res = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if res.pose_landmarks:
                out.append(np.array([[l.x, l.y, l.z, l.visibility] for l in res.pose_landmarks.landmark],
                                    dtype="float32"))
    return out


def save_upload(fs, suffix):
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    fs.save(path)
    return path


# --------------------------------------------------------------------------- behavioural module
BEHAVIOR_SEQ_LEN = 30  # autism_behavior_model_v3.h5 expects (30, 99): 30 frames x 33 landmarks x xyz


def behavior_prob_asd(video_path):
    """P(ASD) from body-movement model, or (None, reason)."""
    seq = pose_landmarks_sequence(video_path, target_fps=10.0)
    if len(seq) < BEHAVIOR_SEQ_LEN:
        return None, f"Only {len(seq)} frames with a visible child were found; need {BEHAVIOR_SEQ_LEN}+ (~3 s)."
    kp = np.stack([s[:, :3].ravel() for s in seq])  # (n, 99)
    windows = np.stack([kp[i:i + BEHAVIOR_SEQ_LEN]
                        for i in range(0, len(kp) - BEHAVIOR_SEQ_LEN + 1, 5)])
    model = models.get("behavior", lambda: _keras("autism_behavior_model_v3.h5"))
    probs = model.predict(windows, verbose=0).mean(axis=0)  # class 0 = ASD, 1 = non-ASD
    return float(probs[0]), None


def scanpath_prob_asd(image_path):
    import cv2
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is not None and img.ndim == 3 and img.shape[2] == 4:  # transparent canvas -> black bg
        alpha = img[:, :, 3:4].astype("float32") / 255.0
        img = (img[:, :, :3].astype("float32") * alpha).astype("uint8")
    x = pp.preprocess_scanpath(img)
    if x.max() == 0:
        return None, "The gaze path image is empty - eye tracking did not record any points."
    model = models.get("scanpath", lambda: _keras("scanpath_asd_model.keras"))
    return float(model.predict(x[None], verbose=0)[0, 0]), None


def expressions_prob_asd(answers):
    bundle = models.get("expression", lambda: _joblib("expression_model.joblib"))
    x = pp.expression_features(answers)[None]
    return float(bundle["model"].predict_proba(x)[0, 1])


def label(p):
    return "ASD traits" if p >= 0.5 else "Typical"


@app.post("/behavioral/analyze")
def behavioral_analyze():
    tmp = []
    try:
        details, notes = {}, []
        weights = {"behavior": 0.4, "heatmap": 0.4, "facial_expressions_recognition": 0.2}

        if "video" in request.files and request.files["video"].filename:
            path = save_upload(request.files["video"], ".webm")
            tmp.append(path)
            p, why = behavior_prob_asd(path)
            details["behavior"] = {"prediction": label(p) if p is not None else None,
                                   "confidence": p, "note": why}
            if why:
                notes.append(why)
        else:
            details["behavior"] = {"prediction": None, "confidence": None, "note": "No video uploaded."}

        image_fs = request.files.get("scanpath") or request.files.get("image")
        if image_fs and image_fs.filename:
            path = save_upload(image_fs, ".png")
            tmp.append(path)
            p, why = scanpath_prob_asd(path)
            details["heatmap"] = {"prediction": label(p) if p is not None else None,
                                  "confidence": p, "note": why}
            if why:
                notes.append(why)
        else:
            details["heatmap"] = {"prediction": None, "confidence": None, "note": "No gaze image uploaded."}

        raw = request.form.get("expressions")
        answers = json.loads(raw) if raw else None
        if answers:
            p = expressions_prob_asd(answers)
            details["facial_expressions_recognition"] = {"prediction": label(p), "confidence": p,
                                                         "answers": [pp.normalize_expression(a) for a in answers]}
        else:
            details["facial_expressions_recognition"] = {"prediction": None, "confidence": None,
                                                         "note": "No expression answers given."}

        avail = {k: v["confidence"] for k, v in details.items() if v.get("confidence") is not None}
        if not avail:
            return jsonify({"error": "No usable inputs. " + " ".join(notes)}), 400
        total_w = sum(weights[k] for k in avail)
        combined = sum(weights[k] * p for k, p in avail.items()) / total_w
        return jsonify({
            "final_prediction": "autism" if combined >= 0.5 else "non-autism",
            "combined_confidence": combined,  # probability of ASD traits, 0..1
            "modalities_used": list(avail),
            "details": details,
            "notes": notes,
        })
    except Exception as e:  # pragma: no cover
        log.exception("behavioral analyze failed")
        return jsonify({"error": str(e)}), 500
    finally:
        for p in tmp:
            try:
                os.remove(p)
            except OSError:
                pass


# --------------------------------------------------------------------------- cognitive module
@app.post("/cognitive/predict")
def cognitive_predict():
    try:
        bundle = models.get("cognitive", lambda: _joblib("cognitive_model.joblib"))
        feats = request.get_json(force=True).get("features")
        names = bundle["features"]
        if isinstance(feats, dict):
            row = [float(feats.get(n, 0) or 0) for n in names]
        else:
            row = [float(v or 0) for v in feats]
        if len(row) != len(names):
            return jsonify({"error": f"Expected {len(names)} features: {names}"}), 400
        import pandas as pd
        X = pd.DataFrame([row], columns=names)
        proba = bundle["model"].predict_proba(X)[0]
        p_asd = float(proba[1])
        return jsonify({
            "prediction": int(p_asd >= 0.5),
            "probability_autism": round(p_asd * 100, 2),
            "probability_td": round((1 - p_asd) * 100, 2),
            "confidence_score": round(max(p_asd, 1 - p_asd) * 100, 2),
            "model": bundle["name"],
        })
    except Exception as e:
        log.exception("cognitive predict failed")
        return jsonify({"error": str(e)}), 400


# --------------------------------------------------------------------------- social module
SOCIAL_DIR = "social"


def _social_bundle():
    import joblib
    import pandas as pd
    d = os.path.join(MODELS, SOCIAL_DIR)
    return {
        "q9": joblib.load(os.path.join(d, "q1_new_risk.pkl")),
        "q10": joblib.load(os.path.join(d, "q3_new_risk.pkl")),
        "risk": joblib.load(os.path.join(d, "randomforest_model_secondtry_v2.pkl")),
        "tok9": pd.read_csv(os.path.join(d, "vocabq1.txt"), header=None)[0].astype(str).tolist(),
        "tok10": pd.read_csv(os.path.join(d, "vocabq3.txt"), header=None)[0].astype(str).tolist(),
        "sw": open(os.path.join(d, "stopwords_english.txt"), encoding="utf-8").read().splitlines(),
    }


QUESTION_LABELS = {
    "q1": "Pointing to ask for things", "q2": "Comforting others", "q3": "Communicating needs",
    "q4": "Following simple instructions", "q5": "Joint attention (follows your gaze)",
    "q6": "Playing with other children", "q7": "Coping in crowded places", "q8": "Using gestures",
    "q9": "Responding to own name", "q10": "Eye contact in conversation",
}


@app.post("/social/analyze")
def social_analyze():
    try:
        import pandas as pd
        b = models.get("social", _social_bundle)
        data = request.get_json(force=True)
        answers = data.get("answers") or [data.get(f"q{i}") for i in range(1, 9)]
        if len(answers) != 8:
            return jsonify({"error": "Exactly 8 yes/no answers are required."}), 400
        yn = []
        for a in answers:
            v = pp.normalize_yes_no(a)
            if v is None:
                return jsonify({"error": f"Unrecognised yes/no answer: {a!r}"}), 400
            yn.append(v)  # yes -> 0 (typical), no -> 1 (concern), as in training

        q9_en = pp.translate_to_english(data.get("q9", ""))
        q10_en = pp.translate_to_english(data.get("q10", ""))
        v9 = pp.bag_of_words(pp.clean_text(q9_en, b["sw"]), b["tok9"])
        v10 = pp.bag_of_words(pp.clean_text(q10_en, b["sw"]), b["tok10"])
        s9 = int(b["q9"].predict(v9)[0])
        s10 = int(b["q10"].predict(v10)[0])

        cols = [f"A{i}" for i in range(1, 11)]
        row = yn + [s9, s10]
        X = pd.DataFrame([row], columns=cols)
        risk_model = b["risk"]
        p_risk = float(risk_model.predict_proba(X)[0, 1])
        risk = int(p_risk >= 0.5)

        imp = risk_model.feature_importances_
        flagged = sorted([(f"q{i + 1}", float(imp[i])) for i in range(10) if row[i] == 1],
                         key=lambda t: t[1], reverse=True)
        resp = {
            "risk_prediction": risk,
            "risk_probability": p_risk,
            "sentiment_q9": s9,
            "sentiment_q10": s10,
            "translated": {"q9": q9_en, "q10": q10_en},
            "important_negative_responses": [n for n, _ in flagged],
            "importance_scores": {f"q{i + 1}": round(float(imp[i]) * 100, 2) for i in range(10)},
            "top_3_features": [{"feature": n, "label": QUESTION_LABELS[n], "score_percent": round(s * 100, 2)}
                               for n, s in flagged[:3]],
        }
        return jsonify(resp)
    except Exception as e:
        log.exception("social analyze failed")
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------------------------------- sensory module
_face_lock = threading.Lock()


def _emotion():
    import cv2
    model = _keras("fer_emotion_model.hdf5")
    cascade = cv2.CascadeClassifier(os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml"))
    return model, cascade


EMOTIONS = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]


def video_emotions(path, samples=12):
    """Average facial-emotion probabilities over evenly spaced frames (mini-Xception, FER2013)."""
    import cv2
    model, cascade = models.get("emotion", _emotion)
    frames = list(iter_video_frames(path, target_fps=2.0, max_frames=120))
    if not frames:
        return None, 0
    pick = np.linspace(0, len(frames) - 1, min(samples, len(frames))).astype(int)
    faces = []
    with _face_lock:
        for i in pick:
            gray = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
            found = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
            if len(found) == 0:
                continue
            x, y, w, h = max(found, key=lambda r: r[2] * r[3])
            pad = int(0.1 * w)
            crop = gray[max(0, y - pad):y + h + pad, max(0, x - pad):x + w + pad]
            crop = cv2.resize(crop, (64, 64)).astype("float32") / 255.0
            faces.append((crop - 0.5) * 2.0)
    if not faces:
        return None, 0
    probs = model.predict(np.array(faces)[..., None], verbose=0).mean(axis=0)
    return {e: float(p) for e, p in zip(EMOTIONS, probs)}, len(faces)


@app.post("/sensory/predict")
def sensory_predict():
    f = request.files.get("file") or request.files.get("video")
    if not f or not f.filename:
        return jsonify({"error": "No video uploaded (field 'file')."}), 400
    path = save_upload(f, os.path.splitext(f.filename)[1] or ".webm")
    try:
        seq = pose_landmarks_sequence(path, target_fps=10.0)
        if len(seq) < 10:
            return jsonify({"error": "Could not see the child clearly in the video. Make sure the head, "
                                     "shoulders and hands are visible and record at least 5 seconds."}), 400
        reaction = pp.auditory_reaction_score(seq, fps=10.0)
        custom = os.path.join(MODELS, "sensory_model.joblib")
        if os.path.exists(custom):  # learned model from ml-training/train_sensory.py, if provided
            b = models.get("sensory_custom", lambda: _joblib("sensory_model.joblib"))
            row = [[reaction["features"][k] for k in b["features"]]]
            reaction["probability"] = float(b["model"].predict_proba(row)[0, 1])
        emotions, n_faces = video_emotions(path)
        distress = None
        dominant = "No face detected"
        if emotions:
            dominant = max(emotions, key=emotions.get)
            distress = emotions["fear"] + emotions["angry"] + emotions["sad"] + emotions["disgust"]

        pose_hyper = reaction["probability"] >= 0.5
        # Emotion supports hypersensitivity when distress is visible; if no face is visible we rely on pose.
        emotion_aligned = bool(distress is None or distress >= 0.35 or dominant in ("fear", "angry", "sad", "disgust"))
        final = "Hypersensitivity" if pose_hyper and emotion_aligned else "Not Hypersensitivity"
        return jsonify({
            "final_prediction": final,
            "pose_prediction": "Hypersensitivity" if pose_hyper else "Not Hypersensitivity",
            "confidence_hypersensitivity": reaction["probability"],
            "confidence_not_hypersensitivity": 1 - reaction["probability"],
            "dominant_emotion": dominant,
            "emotion_probabilities": emotions,
            "distress_level": distress,
            "faces_analysed": n_faces,
            "emotion_alignment_with_hypersensitivity": emotion_aligned,
            "reaction_features": reaction["features"],
            "frames_analysed": len(seq),
        })
    except Exception as e:
        log.exception("sensory predict failed")
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


# --------------------------------------------------------------------------- misc
@app.get("/health")
def health():
    files = sorted(os.listdir(MODELS))
    return jsonify({"status": "ok", "models": files, "loaded": sorted(models._cache)})


def warmup():
    """Pre-load the light models so the first request is fast."""
    for name, fn in [("cognitive", lambda: _joblib("cognitive_model.joblib")),
                     ("expression", lambda: _joblib("expression_model.joblib")),
                     ("social", _social_bundle)]:
        try:
            models.get(name, fn)
        except Exception:  # pragma: no cover
            log.exception("warm-up failed for %s", name)


if os.environ.get("ML_WARMUP", "1") == "1":
    threading.Thread(target=warmup, daemon=True).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("ML_PORT", 5001)))
