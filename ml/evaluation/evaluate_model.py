import json
import os
import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)


MODEL_PATH = "ml/artifacts/lapredict_random_forest.joblib"
TEST_X = "ml/data/processed/X_test.csv"
TEST_Y = "ml/data/processed/y_test.csv"
OUTPUT_PATH = "ml/evaluation/metrics.json"


model = joblib.load(MODEL_PATH)

X_test = pd.read_csv(TEST_X)
y_test = pd.read_csv(TEST_Y).squeeze("columns")

# project_id is an identifier, not a predictive feature.
X_test = X_test.drop(columns=["project_id"])

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]

metrics = {
    "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
    "precision": round(float(precision_score(y_test, predictions, zero_division=0)), 4),
    "recall": round(float(recall_score(y_test, predictions, zero_division=0)), 4),
    "f1_score": round(float(f1_score(y_test, predictions, zero_division=0)), 4),
    "roc_auc": round(float(roc_auc_score(y_test, probabilities)), 4),
    "confusion_matrix": confusion_matrix(y_test, predictions).tolist(),
    "dataset": "synthetic demonstration data",
    "model": "Random Forest",
}

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

with open(OUTPUT_PATH, "w") as file:
    json.dump(metrics, file, indent=2)

print("Evaluation results saved to:", OUTPUT_PATH)
print(json.dumps(metrics, indent=2))
