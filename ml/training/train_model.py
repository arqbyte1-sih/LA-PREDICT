import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


TRAIN_X = "ml/data/processed/X_train.csv"
TEST_X = "ml/data/processed/X_test.csv"
TRAIN_Y = "ml/data/processed/y_train.csv"
TEST_Y = "ml/data/processed/y_test.csv"

MODEL_PATH = "ml/artifacts/lapredict_random_forest.joblib"


X_train = pd.read_csv(TRAIN_X)
X_test = pd.read_csv(TEST_X)
y_train = pd.read_csv(TRAIN_Y).squeeze("columns")
y_test = pd.read_csv(TEST_Y).squeeze("columns")


categorical_features = [
    "project_type",
    "state",
    "district",
    "current_stage",
]

# Identifier is not used as a predictive feature.
X_train = X_train.drop(columns=["project_id"])
X_test = X_test.drop(columns=["project_id"])

numeric_features = [
    column
    for column in X_train.columns
    if column not in categorical_features
]


numeric_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", numeric_pipeline, numeric_features),
        ("categorical", categorical_pipeline, categorical_features),
    ]
)


model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1,
)


pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model),
    ]
)


pipeline.fit(X_train, y_train)

predictions = pipeline.predict(X_test)
probabilities = pipeline.predict_proba(X_test)[:, 1]


accuracy = accuracy_score(y_test, predictions)
precision = precision_score(y_test, predictions, zero_division=0)
recall = recall_score(y_test, predictions, zero_division=0)
f1 = f1_score(y_test, predictions, zero_division=0)
roc_auc = roc_auc_score(y_test, probabilities)

print("\n===== LAPREDICT MODEL EVALUATION =====")
print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

print("\nClassification Report:")
print(classification_report(y_test, predictions, zero_division=0))


os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(pipeline, MODEL_PATH)

print(f"\nModel saved to: {MODEL_PATH}")
