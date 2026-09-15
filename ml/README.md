# LAPREDICT ML

## Overview

LAPREDICT ML is the machine-learning layer for a land acquisition delay-risk monitoring prototype. It uses synthetic demonstration data to estimate whether a project is likely to be delayed and to highlight the most influential risk drivers. The goal is to support early intervention planning in a demo environment, not to make official government decisions.

## Problem statement

Land acquisition projects often face delays due to documentation gaps, compensation issues, legal disputes, stakeholder coordination problems, and incomplete possession or rehabilitation progress. This ML module provides a quick risk-screening workflow that can flag projects requiring attention before delays worsen.

## Synthetic dataset disclaimer

The dataset used in this repository is synthetic demonstration data created for prototyping and testing. It is not official government data, not validated against historical project outcomes, and should not be described as production-validated public-sector forecasting.

## Dataset structure

The synthetic dataset is stored in `ml/data/synthetic/land_acquisition_synthetic.csv` and described in `ml/data/synthetic/data_dictionary.md`.

Key fields include:

- project_id
- project_type
- state
- district
- land_area_hectares
- affected_families
- documentation_completeness
- approval_progress
- compensation_progress
- legal_dispute_count
- pending_notifications
- ownership_conflict_count
- rehabilitation_progress
- stakeholder_responsiveness
- department_coordination_score
- possession_progress
- current_stage
- days_elapsed
- target_duration_days
- delay_status

## Preprocessing

The preprocessing pipeline is implemented in `ml/preprocessing/preprocess.py`. It prepares the feature matrix by dropping the non-predictive identifier (`project_id`) and handling numeric and categorical fields with a pipeline-based scikit-learn setup.

## Random Forest model

The trained model is a scikit-learn `Pipeline` with the following steps:

- `preprocessor`
- `model`

The model artifact is stored in `ml/artifacts/lapredict_random_forest.joblib`.

## Evaluation metrics

The evaluation metrics currently obtained from the synthetic demo dataset are:

- Accuracy: 0.6560
- Precision: 0.6000
- Recall: 0.4200
- F1: 0.4941
- ROC-AUC: 0.6891
- Confusion matrix: [[244, 56], [116, 84]]

These metrics are from synthetic demonstration data and are not production validation.

## Inference flow

The inference flow works as follows:

1. A project dictionary is passed to `ml/inference/predict.py`.
2. The model is loaded once and kept in memory for reuse.
3. The feature vector is built from the project fields.
4. The model predicts the probability of delay and the binary delay outcome.
5. Risk categories are computed from the delay probability.
6. Important features are extracted from the trained model's feature importances.
7. Recommendations are generated from the top risk factors.
8. The API returns the final JSON payload.

## Risk score/category logic

The risk score is computed as the probability of delay multiplied by 100, rounded to two decimals.

Categories are assigned as:

- `Low`: risk_score <= 33
- `Medium`: 33 < risk_score <= 66
- `High`: risk_score > 66

## Explainability

The explainability flow in `ml/explainability/explain.py` surfaces the most influential features using the trained model feature importances. These values are passed into the recommendation engine and returned under `top_risk_factors`.

## Recommendation engine

`ml/recommendations/recommend.py` converts the leading risk factors into plain-language recommendations for project teams. It maps individual features such as documentation completeness, compensation progress, possession progress, and legal dispute counts to specific follow-up actions.

## FastAPI endpoints

The API is defined in `ml/api.py` and exposes:

- `GET /` — root status
- `GET /health` — liveness/health check
- `POST /predict` — project risk prediction

## How to start the API

From the repository root:

```bash
cd /Users/vedantchitroda/Documents/LA-PREDICT
. ml/.venv/bin/activate
PYTHONPATH=. python -m uvicorn ml.api:app --host 127.0.0.1 --port 8000
```

## Example request

```json
{
  "project_id": "TEST-001",
  "project_type": "Highway",
  "state": "Gujarat",
  "district": "Rajkot",
  "land_area_hectares": 12.5,
  "affected_families": 80,
  "documentation_completeness": 68.1,
  "approval_progress": 55.0,
  "compensation_progress": 42.0,
  "legal_dispute_count": 2,
  "pending_notifications": 3,
  "ownership_conflict_count": 1,
  "rehabilitation_progress": 35.0,
  "stakeholder_responsiveness": 48.0,
  "department_coordination_score": 52.0,
  "possession_progress": 30.0,
  "current_stage": "Compensation",
  "days_elapsed": 420,
  "target_duration_days": 360
}
```

## Example response

```json
{
  "project_id": "TEST-001",
  "risk_score": 62.35,
  "risk_category": "Medium",
  "delay_probability": 0.6235,
  "predicted_delay": 1,
  "top_risk_factors": [
    {"factor": "numeric__compensation_progress", "importance": 0.1321},
    {"factor": "numeric__documentation_completeness", "importance": 0.1242}
  ],
  "recommendations": [
    "Review pending compensation cases, verify beneficiary documentation, and accelerate eligible disbursements."
  ],
  "model_version": "lapredict-random-forest-v1"
}
```

## How to run tests

From the repository root:

```bash
cd /Users/vedantchitroda/Documents/LA-PREDICT
. ml/.venv/bin/activate
PYTHONPATH=. python -m pytest ml/tests/test_api.py -q
```

## Model limitations

- This is a synthetic demo model, not a production system.
- The data reflects prototype assumptions rather than real acquisition outcomes.
- The model is intended for demonstration and scenario testing only.
- Performance values should be treated as illustrative rather than validated government predictions.

## Frontend / backend integration

The frontend or another backend service can call the ML endpoint at:

```text
http://127.0.0.1:8000/predict
```

The request should send a JSON object matching the `ProjectData` schema. The response contains the prediction fields required by downstream display or workflow components.
