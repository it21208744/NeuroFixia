"""Optional: learn the auditory-hypersensitivity classifier from your own labelled videos.

The production service uses the transparent scorer in ml-service/preprocessing.py
(auditory_reaction_score) because no public labelled dataset of children's reactions to
noise exists. If you have recordings, arrange them as

    videos/hypersensitive/*.webm|mp4
    videos/typical/*.webm|mp4

and run:  python train_sensory.py videos ../ml-service/models
It extracts the same clip-level features, reports cross-validated metrics and saves
sensory_model.joblib; the service automatically prefers that file when it exists.
"""
import glob, json, os, sys
import joblib, numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ml-service"))
import preprocessing as pp  # noqa: E402
os.environ["ML_WARMUP"] = "0"
from app import pose_landmarks_sequence  # noqa: E402

root, out_dir = sys.argv[1], sys.argv[2]
FEATS = ["fraction_time_hand_on_ear", "fraction_time_both_ears_covered", "longest_covering_seconds", "head_agitation"]
X, y = [], []
for label, sub in [(1, "hypersensitive"), (0, "typical")]:
    for f in glob.glob(os.path.join(root, sub, "*")):
        seq = pose_landmarks_sequence(f)
        if len(seq) < 10:
            print("skip (no person)", f); continue
        feats = pp.auditory_reaction_score(seq)["features"]
        X.append([feats[k] for k in FEATS]); y.append(label)
X, y = np.array(X), np.array(y)
model = make_pipeline(StandardScaler(), LogisticRegression(class_weight="balanced"))
k = min(5, np.bincount(y).min())
auc = cross_val_score(model, X, y, cv=StratifiedKFold(k, shuffle=True, random_state=0), scoring="roc_auc")
print("CV AUC", auc.mean())
model.fit(X, y)
joblib.dump({"model": model, "features": FEATS}, os.path.join(out_dir, "sensory_model.joblib"))
json.dump({"cv_auc": float(auc.mean()), "n": int(len(y))}, open(os.path.join(out_dir, "sensory_metrics.json"), "w"))
