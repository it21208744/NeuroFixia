"""Run: cd ml-service && python -m pytest -q tests   (needs requirements.txt installed)"""
import io
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["ML_WARMUP"] = "0"
import preprocessing as pp  # noqa: E402
from app import app  # noqa: E402

client = app.test_client()


def _pose(hand_on_ear: bool, nose_x=0.5):
    lm = np.zeros((33, 4), dtype="float32")
    lm[:, 3] = 1.0
    lm[pp.NOSE, :2] = [nose_x, 0.30]
    lm[pp.L_EAR, :2] = [0.55, 0.30]
    lm[pp.R_EAR, :2] = [0.45, 0.30]
    lm[pp.L_SH, :2] = [0.62, 0.45]
    lm[pp.R_SH, :2] = [0.38, 0.45]
    if hand_on_ear:
        lm[pp.L_WRIST, :2] = lm[pp.L_INDEX, :2] = [0.56, 0.31]
        lm[pp.R_WRIST, :2] = lm[pp.R_INDEX, :2] = [0.44, 0.31]
    else:
        lm[pp.L_WRIST, :2] = lm[pp.L_INDEX, :2] = [0.65, 0.75]
        lm[pp.R_WRIST, :2] = lm[pp.R_INDEX, :2] = [0.35, 0.75]
    return lm


def test_sensory_scorer_reacts_to_ear_covering():
    calm = pp.auditory_reaction_score([_pose(False) for _ in range(50)])
    cover = pp.auditory_reaction_score([_pose(i > 10) for i in range(50)])
    assert calm["probability"] < 0.3
    assert cover["probability"] > 0.7
    assert cover["features"]["longest_covering_seconds"] > 3


def test_expression_normalisation():
    assert pp.normalize_expression("sad") == "Sad"
    assert pp.normalize_expression("no answer") == "No answer"
    assert pp.normalize_expression("") == "No answer"
    assert pp.expression_features(["Sad", "Angry", "Happy", "Surprised"])[-1] == 4


def test_yes_no_multilingual():
    assert pp.normalize_yes_no("ඔව්") == 0 and pp.normalize_yes_no("இல்லை") == 1 and pp.normalize_yes_no("Yes") == 0


def test_cognitive_endpoint():
    r = client.post("/cognitive/predict", json={"features": [1.2, 10, 85, 85, 50, 75, 60, 1, 85]})
    assert r.status_code == 200 and r.json["prediction"] == 0
    r = client.post("/cognitive/predict", json={"features": [15, 22, 30, 30, 150, 40, 140, 9, 25]})
    assert r.json["prediction"] == 1


def test_social_endpoint():
    good = {"answers": ["yes"] * 8, "q9": "She turns and smiles at me straight away", "q10": "Good eye contact"}
    bad = {"answers": ["no"] * 8, "q9": "He ignores me and does not respond", "q10": "He avoids eye contact"}
    assert client.post("/social/analyze", json=good).json["risk_prediction"] == 0
    assert client.post("/social/analyze", json=bad).json["risk_prediction"] == 1


def test_behavioral_expressions_only_and_bad_input():
    r = client.post("/behavioral/analyze", data={"expressions": '["Sad","Angry","Happy","Surprised"]'})
    assert r.status_code == 200 and r.json["final_prediction"] == "non-autism"
    r = client.post("/behavioral/analyze", data={"expressions": '["No answer","","x","No answer"]'})
    assert r.status_code == 200 and r.json["final_prediction"] == "autism"
    assert client.post("/behavioral/analyze", data={}).status_code == 400


def test_scanpath_empty_image_is_rejected_gracefully():
    import cv2
    ok, buf = cv2.imencode(".png", np.zeros((480, 640, 3), np.uint8))
    r = client.post("/behavioral/analyze", data={"scanpath": (io.BytesIO(buf.tobytes()), "s.png")},
                    content_type="multipart/form-data")
    assert r.status_code == 400
