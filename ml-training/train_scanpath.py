"""Retrain the eye-tracking scanpath (heat-map) ASD classifier.

Dataset: "Visualization of Eye-Tracking Scanpaths in Autism Spectrum Disorder: Image Dataset"
(Carette et al., 2019) - https://figshare.com/articles/7073087  (547 images, TS = ASD, TC = non-ASD)

Why retrained: the original heatMap_prediction.h5 scored AUC 0.54 on this dataset (it labelled
almost every image non-ASD), so it carried no signal.

Approach: shared preprocessing (dilate thin scanpath strokes, area-resize to 224, normalise
brightness) -> frozen ImageNet MobileNetV2 embedding -> L2-regularised logistic head.
Evaluated with participant-grouped 5-fold CV so the same child never appears in train and test.

Usage: python train_scanpath.py <path-to-extracted-Images-folder> <output-dir>
"""
import glob, json, os, re, sys
import numpy as np
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import cv2
import tensorflow as tf
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.metrics import roc_auc_score, accuracy_score, f1_score

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ml-service"))
from preprocessing import preprocess_scanpath  # noqa: E402  (shared with inference)

img_dir, out_dir = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(img_dir, "*", "*.png")))
y = np.array([1 if os.path.basename(f).startswith("TS") else 0 for f in files])
groups = np.array([("TS" if l else "TC") + re.search(r"_(\d+)\.png$", f).group(1) for f, l in zip(files, y)])
print(f"{len(files)} images, {y.sum()} ASD, {len(set(groups))} participants")

backbone = tf.keras.applications.MobileNetV2(include_top=False, weights="imagenet",
                                             input_shape=(224, 224, 3), pooling="avg")
def embed(batch):
    return backbone.predict(tf.keras.applications.mobilenet_v2.preprocess_input(batch * 255.0), verbose=0)

X_img = np.stack([preprocess_scanpath(cv2.imread(f)) for f in files])
# light augmentation: horizontal flip doubles training views (scanpaths are left/right symmetric tasks)
E = embed(X_img); E_flip = embed(X_img[:, :, ::-1, :])

aucs, accs, f1s = [], [], []
cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
for tr, te in cv.split(E, y, groups):
    clf = LogisticRegression(C=0.5, max_iter=5000, class_weight="balanced")
    clf.fit(np.vstack([E[tr], E_flip[tr]]), np.concatenate([y[tr], y[tr]]))
    p = (clf.predict_proba(E[te])[:, 1] + clf.predict_proba(E_flip[te])[:, 1]) / 2
    aucs.append(roc_auc_score(y[te], p)); accs.append(accuracy_score(y[te], p > 0.5)); f1s.append(f1_score(y[te], p > 0.5))
metrics = {"cv": "5-fold StratifiedGroupKFold by participant",
           "auc_mean": float(np.mean(aucs)), "auc_std": float(np.std(aucs)),
           "accuracy_mean": float(np.mean(accs)), "f1_mean": float(np.mean(f1s))}
print(json.dumps(metrics, indent=2))

clf = LogisticRegression(C=0.5, max_iter=5000, class_weight="balanced")
clf.fit(np.vstack([E, E_flip]), np.concatenate([y, y]))
# Export a single Keras model: MobileNetV2 + dense head with the logistic weights -> outputs P(ASD)
inp = tf.keras.Input((224, 224, 3))
# [0,1] -> [-1,1]  (identical to mobilenet_v2.preprocess_input on 0-255 input)
x = tf.keras.layers.Rescaling(2.0, offset=-1.0)(inp)
x = backbone(x)
out = tf.keras.layers.Dense(1, activation="sigmoid", name="asd_prob")(x)
model = tf.keras.Model(inp, out)
model.get_layer("asd_prob").set_weights([clf.coef_.T.astype("float32"), clf.intercept_.astype("float32")])
# sanity: exported model reproduces sklearn head
chk = model.predict(X_img[:16], verbose=0).ravel(); ref = clf.predict_proba(E[:16])[:, 1]
assert np.allclose(chk, ref, atol=1e-3), (chk, ref)
os.makedirs(out_dir, exist_ok=True)
model.save(os.path.join(out_dir, "scanpath_asd_model.keras"))
json.dump(metrics, open(os.path.join(out_dir, "scanpath_asd_metrics.json"), "w"), indent=2)
print("saved")
