"""Retrain the cognitive-games ASD screening model.

Data: data/cognitive_games_dataset.csv - the 175 labelled game sessions that the original
knn_model2.pkl was fitted on (recovered from the pickled KNN's stored training set).

Why retrained: the original KNN used raw, unscaled features, so distance was dominated by
Response_Time (seconds, up to 4426) and Logical_Task_Completion_Time, effectively ignoring
accuracy/score features. We compare scaled models with stratified 5x repeated CV and keep the best.
"""
import json, os, sys
import joblib, numpy as np, pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, FunctionTransformer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import RepeatedStratifiedKFold, cross_validate

FEATURES = ["Fixation_Duration", "Gaze_Shift_Count", "Attention_Score", "Memory_Recall_Accuracy",
            "Response_Time", "Memory_Score", "Logical_Task_Completion_Time", "Logical_Task_Errors", "Logical_Score"]
out_dir = sys.argv[1] if len(sys.argv) > 1 else "../ml-service/models"
df = pd.read_csv(os.path.join(os.path.dirname(__file__), "data", "cognitive_games_dataset.csv"))
X, y = df[FEATURES], df["AUTISM_LABEL"]

clip = FunctionTransformer(np.log1p, feature_names_out="one-to-one")  # all features are >= 0
candidates = {
    "original_knn_unscaled": KNeighborsClassifier(5),
    "knn_scaled": make_pipeline(clip, StandardScaler(), KNeighborsClassifier(7, weights="distance")),
    "logreg": make_pipeline(clip, StandardScaler(), LogisticRegression(C=1.0, max_iter=2000)),
    "random_forest": RandomForestClassifier(300, min_samples_leaf=2, random_state=0),
    "grad_boost": GradientBoostingClassifier(random_state=0),
}
cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=5, random_state=0)
results = {}
for name, est in candidates.items():
    s = cross_validate(est, X, y, cv=cv, scoring=["accuracy", "roc_auc", "f1"])
    results[name] = {k: round(float(s[f"test_{k}"].mean()), 4) for k in ["accuracy", "roc_auc", "f1"]}
    print(f"{name:24s} {results[name]}")

best = max((n for n in results if n != "original_knn_unscaled"), key=lambda n: results[n]["roc_auc"])
model = candidates[best].fit(X, y)
os.makedirs(out_dir, exist_ok=True)
joblib.dump({"model": model, "features": FEATURES, "name": best}, os.path.join(out_dir, "cognitive_model.joblib"))
json.dump({"selected": best, "cv": "5x5 repeated stratified k-fold", "results": results},
          open(os.path.join(out_dir, "cognitive_metrics.json"), "w"), indent=2)
print("selected", best)
