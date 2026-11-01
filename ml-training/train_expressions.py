"""Retrain the facial-expression-recognition questionnaire model.

Data: data/facial_expression_dataset.csv (100 children, 50 ASD / 50 non-ASD, answers to the 4
emotion clips).

Why retrained: the original Conv1D (asd_prediction_model.h5) depended on a OneHotEncoder with
handle_unknown='error' and case-sensitive categories, while the CSV mixes 'sad'/'Sad',
'No answer'/'no answer'. Any unexpected value (e.g. skipping a clip -> '') crashed the endpoint,
and its sigmoid output was P(non-ASD) but was combined as if it were P(ASD). The new model uses
case-normalised answers + correctness features and outputs P(ASD) directly.
"""
import json, os, sys
import joblib, numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import RepeatedStratifiedKFold, cross_validate

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ml-service"))
from preprocessing import expression_features  # noqa: E402

out_dir = sys.argv[1] if len(sys.argv) > 1 else "../ml-service/models"
df = pd.read_csv(os.path.join(os.path.dirname(__file__), "data", "facial_expression_dataset.csv"))
X = np.stack([expression_features(r) for r in df[["Q1 Answer", "Q2 Answer", "Q3 Answer", "Q4 Answer"]].values])
y = (df["ASD Status"].str.strip().str.lower() == "asd").astype(int).values

cands = {"logreg": LogisticRegression(C=0.5, max_iter=2000),
         "random_forest": RandomForestClassifier(300, min_samples_leaf=2, random_state=0)}
cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=0)
res = {}
for n, m in cands.items():
    s = cross_validate(m, X, y, cv=cv, scoring=["accuracy", "roc_auc", "f1"])
    res[n] = {k: round(float(s[f"test_{k}"].mean()), 4) for k in ["accuracy", "roc_auc", "f1"]}
    print(n, res[n])
best = max(res, key=lambda n: (res[n]["roc_auc"], n == "logreg"))
model = cands[best].fit(X, y)
os.makedirs(out_dir, exist_ok=True)
joblib.dump({"model": model, "name": best}, os.path.join(out_dir, "expression_model.joblib"))
json.dump({"selected": best, "cv": "5x10 repeated stratified k-fold", "results": res},
          open(os.path.join(out_dir, "expression_metrics.json"), "w"), indent=2)
print("selected", best)
