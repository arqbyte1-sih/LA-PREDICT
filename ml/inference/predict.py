from functools import lru_cache
from typing import Any

import joblib
import pandas as pd

from ml.recommendations.recommend import generate_recommendations


MODEL_PATH = "ml/artifacts/lapredict_random_forest.joblib"
MODEL_VERSION = "lapredict-random-forest-v1"


@lru_cache(maxsize=1)
def load_model():
    return joblib.load(MODEL_PATH)


def get_risk_category(risk_score):
    if risk_score <= 33:
        return "Low"
    if risk_score <= 66:
        return "Medium"
    return "High"


def predict_project(project: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(project, dict):
        raise TypeError("project must be a dictionary")

    project_id = str(project.get("project_id", "UNKNOWN"))
    input_df = pd.DataFrame([project])

    if "project_id" in input_df.columns:
        model_input = input_df.drop(columns=["project_id"])
    else:
        model_input = input_df

    if model_input.empty:
        raise ValueError("project input is empty")

    model = load_model()
    probability = float(model.predict_proba(model_input)[0][1])
    predicted_delay = int(model.predict(model_input)[0])

    risk_score = round(probability * 100, 2)
    risk_category = get_risk_category(risk_score)

    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["model"]
    feature_names = preprocessor.get_feature_names_out()
    importances = classifier.feature_importances_

    factor_data = sorted(
        zip(feature_names, importances),
        key=lambda item: item[1],
        reverse=True,
    )[:5]

    risk_factors = [
        {
            "factor": factor,
            "importance": round(float(importance), 4),
        }
        for factor, importance in factor_data
    ]

    recommendations = generate_recommendations(risk_factors)

    return {
        "project_id": project_id,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "delay_probability": round(probability, 4),
        "predicted_delay": predicted_delay,
        "top_risk_factors": risk_factors,
        "recommendations": recommendations,
        "model_version": MODEL_VERSION,
    }


if __name__ == "__main__":
    sample_project = {
        "project_id": "LA-DEMO-001",
        "project_type": "Highway",
        "state": "Gujarat",
        "district": "Rajkot",
        "land_area_hectares": 125,
        "affected_families": 85,
        "documentation_completeness": 68,
        "approval_progress": 55,
        "compensation_progress": 42,
        "legal_dispute_count": 4,
        "pending_notifications": 3,
        "ownership_conflict_count": 5,
        "rehabilitation_progress": 35,
        "stakeholder_responsiveness": 48,
        "department_coordination_score": 52,
        "possession_progress": 30,
        "current_stage": "Compensation",
        "days_elapsed": 420,
        "target_duration_days": 360,
    }

    result = predict_project(sample_project)

    print("\n===== LAPREDICT PREDICTION =====")
    print(f"Project ID: {result['project_id']}")
    print(f"Risk Score: {result['risk_score']}")
    print(f"Risk Category: {result['risk_category']}")
    print(f"Delay Probability: {result['delay_probability']}")
    print(f"Predicted Delay: {result['predicted_delay']}")
    print(f"Model Version: {result['model_version']}")

    print("\n===== TOP RISK FACTORS =====")
    for factor in result["top_risk_factors"]:
        print(f"{factor['factor']}: {factor['importance']}")

    print("\n===== RECOMMENDATIONS =====")
    for i, recommendation in enumerate(result["recommendations"], start=1):
        print(f"{i}. {recommendation}")
