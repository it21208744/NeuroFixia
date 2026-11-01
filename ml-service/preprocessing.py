"""Pre-processing shared by training scripts and the inference service (keeps them in sync)."""
import cv2
import numpy as np

SCANPATH_SIZE = 224


def preprocess_scanpath(img_bgr: np.ndarray) -> np.ndarray:
    """Scanpath image (any size, BGR uint8) -> float32 RGB (224,224,3) in [0,1].

    The strokes in scanpath plots are 1px wide and very dark; dilating before an area
    resize keeps them visible at 224px, and per-image max normalisation removes brightness
    differences between rendering tools (dataset plots vs. the in-browser canvas).
    """
    if img_bgr is None:
        raise ValueError("Could not decode scanpath image")
    if img_bgr.ndim == 2:
        img_bgr = cv2.cvtColor(img_bgr, cv2.COLOR_GRAY2BGR)
    if img_bgr.shape[2] == 4:
        img_bgr = cv2.cvtColor(img_bgr, cv2.COLOR_BGRA2BGR)
    img = cv2.resize(img_bgr, (640, 480), interpolation=cv2.INTER_AREA)
    img = cv2.dilate(img, np.ones((3, 3), np.uint8), iterations=1)
    img = cv2.resize(img, (SCANPATH_SIZE, SCANPATH_SIZE), interpolation=cv2.INTER_AREA)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype("float32")
    mx = img.max()
    if mx > 0:
        img = img / mx
    return img


# ---------------------------------------------------------------- facial-expression questionnaire
EXPRESSION_CHOICES = ["Happy", "Sad", "Angry", "Surprised", "Scared", "No answer"]
# The four stimulus clips are shown in this order (frontend VideoPlayer): sad, angry, happy, surprised
EXPECTED_EXPRESSIONS = ["Sad", "Angry", "Happy", "Surprised"]


def normalize_expression(value) -> str:
    """Map free/odd-cased answers ('sad', 'no answer', '', None, 'Fear') onto EXPRESSION_CHOICES."""
    v = str(value or "").strip().lower()
    aliases = {"fear": "Scared", "afraid": "Scared", "scared": "Scared", "surprise": "Surprised"}
    if v in aliases:
        return aliases[v]
    for c in EXPRESSION_CHOICES:
        if v == c.lower():
            return c
    return "No answer"


def expression_features(answers) -> np.ndarray:
    """4 answers -> one-hot (4x6) + per-question correctness (4) + #no-answer + #correct = 30 features."""
    answers = [normalize_expression(a) for a in list(answers)[:4]]
    answers += ["No answer"] * (4 - len(answers))
    onehot = np.zeros((4, len(EXPRESSION_CHOICES)), dtype="float32")
    for i, a in enumerate(answers):
        onehot[i, EXPRESSION_CHOICES.index(a)] = 1
    correct = np.array([a == e for a, e in zip(answers, EXPECTED_EXPRESSIONS)], dtype="float32")
    no_ans = sum(a == "No answer" for a in answers)
    return np.concatenate([onehot.ravel(), correct, [no_ans, correct.sum()]]).astype("float32")


# ---------------------------------------------------------------- social questionnaire (NLP)
import re as _re
import string as _string

_YES = {"yes", "y", "true", "1", "ඔව්", "ඔව", "ஆம்"}
_NO = {"no", "n", "false", "0", "නැත", "නැහැ", "இல்லை"}


def normalize_yes_no(value):
    """Return 0 for yes, 1 for no (training encoding), None if unrecognised."""
    v = str(value).strip().lower()
    if v in _YES:
        return 0
    if v in _NO:
        return 1
    return None


def detect_script(text: str) -> str:
    if any("඀" <= ch <= "෿" for ch in text):
        return "si"
    if any("஀" <= ch <= "௿" for ch in text):
        return "ta"
    return "en"


def translate_to_english(text: str, timeout: float = 8.0) -> str:
    """Sinhala/Tamil free-text -> English via the free MyMemory API (same service the original
    `translate` package used), with a timeout so a slow translator can never hang a request."""
    text = (text or "").strip()
    lang = detect_script(text)
    if not text or lang == "en":
        return text
    try:
        import requests
        r = requests.get("https://api.mymemory.translated.net/get",
                         params={"q": text[:480], "langpair": f"{lang}|en"}, timeout=timeout)
        out = r.json().get("responseData", {}).get("translatedText")
        return out or text
    except Exception:
        return text


_stemmer = None


def clean_text(text: str, stopwords) -> str:
    """Identical cleaning to the notebook used for training the sentiment models."""
    global _stemmer
    if _stemmer is None:
        from nltk.stem import PorterStemmer
        _stemmer = PorterStemmer()
    words = [w.lower() for w in str(text).split()]
    words = [_re.sub(r"^https?:\/\/.*[\r\n]*", "", w, flags=_re.MULTILINE) for w in words]
    s = " ".join(words)
    for p in _string.punctuation:
        s = s.replace(p, "")
    s = _re.sub(r"\d+", "", s)
    sw = set(stopwords)
    return " ".join(_stemmer.stem(w) for w in s.split() if w not in sw)


def bag_of_words(sentence: str, vocabulary) -> np.ndarray:
    tokens = set(sentence.split())
    return np.array([[1.0 if v in tokens else 0.0 for v in vocabulary]], dtype=np.float32)


# ---------------------------------------------------------------- sensory: auditory reaction
# MediaPipe pose landmark indices
NOSE, L_EAR, R_EAR, L_SH, R_SH = 0, 7, 8, 11, 12
L_WRIST, R_WRIST, L_INDEX, R_INDEX = 15, 16, 19, 20


def auditory_reaction_frame_features(lm: np.ndarray):
    """lm: (33,4). Returns (left_hand_to_ear, right_hand_to_ear, head_x, head_y, shoulder_width).
    Distances are normalised by shoulder width so they do not depend on camera distance."""
    sw = float(np.linalg.norm(lm[L_SH, :2] - lm[R_SH, :2])) or 1e-3
    def hand_ear(w, i, ear):
        return min(np.linalg.norm(lm[w, :2] - lm[ear, :2]), np.linalg.norm(lm[i, :2] - lm[ear, :2])) / sw
    # visibility gating: a hand MediaPipe cannot see is treated as far away
    dl = hand_ear(L_WRIST, L_INDEX, L_EAR) if lm[L_WRIST, 3] > 0.3 or lm[L_INDEX, 3] > 0.3 else 9.0
    dr = hand_ear(R_WRIST, R_INDEX, R_EAR) if lm[R_WRIST, 3] > 0.3 or lm[R_INDEX, 3] > 0.3 else 9.0
    return dl, dr, float(lm[NOSE, 0]), float(lm[NOSE, 1]), sw


def auditory_reaction_score(seq, fps=10.0, near=0.55):
    """Explainable detector for aversive reactions to sound: covering one/both ears, how long it
    lasts, and head/body agitation (turning away, shaking). Returns probability + features.

    The original CNN-LSTM was found to ignore the hand-to-ear distances entirely (its output only
    tracked the raw elbow-angle in degrees) and the extractor used the same hand for left and
    right. No public labelled dataset of auditory-hypersensitivity reactions exists, so this
    transparent scorer is used; ml-training/train_sensory.py can learn a model from your own
    labelled videos using exactly these features.
    """
    f = np.array([auditory_reaction_frame_features(lm) for lm in seq])
    dl, dr, hx, hy, sw = f.T
    any_near = (np.minimum(dl, dr) < near)
    both_near = (np.maximum(dl, dr) < near)
    # longest continuous ear-covering run (seconds)
    run = best = 0
    for v in any_near:
        run = run + 1 if v else 0
        best = max(best, run)
    longest = best / fps
    # head agitation: mean frame-to-frame nose displacement in shoulder widths per second
    move = np.hypot(np.diff(hx), np.diff(hy)) / np.maximum(sw[1:], 1e-3) * fps if len(f) > 1 else np.zeros(1)
    agitation = float(np.clip(np.median(move) / 1.5, 0, 1))
    frac_any, frac_both = float(any_near.mean()), float(both_near.mean())
    z = 6.0 * frac_any + 4.0 * frac_both + 0.6 * min(longest / 2.0, 1.0) + 1.5 * agitation - 2.2
    prob = float(1 / (1 + np.exp(-z)))
    return {"probability": prob, "features": {
        "fraction_time_hand_on_ear": round(frac_any, 3),
        "fraction_time_both_ears_covered": round(frac_both, 3),
        "longest_covering_seconds": round(longest, 2),
        "head_agitation": round(agitation, 3),
    }}
