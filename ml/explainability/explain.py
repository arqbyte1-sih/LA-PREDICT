import joblib
import pandas as pd


MODEL_PATH = "ml/artifacts/lapredict_random_forest.joblib"


def explain_prediction(project_data, top_n=5):
    model = joblib.load(MODEL_PATH)

    input_data = pd.DataFrame([project_data])
    input_data = input_data.drop(columns=["project_id"])

    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["model"]

    transformed = preprocessor.transform(input_data)

    feature_names = preprocessor.get_feature_names_out()
    importances = classifier.feature_importances_

    explanation = pd.DataFrame(
        {
            "feature": feature_names,
            "importance": importances,
        }
    ).sort_values("importance", ascending=False)

    top_factors = []

    for _, row in explanation.head(top_n).iterrows():
        feature = row["feature"]
        importance = float(row["importance"])

        top_factors.append(
            {
                "factor": feature,
                "importance": round(importance, 4),
            }
        )

    return top_factors


if __name__ == "__main__":
    sample_project = {
        "project_id": "LA-DEMO-001",
        "project_type": "Highway",
        "state": "Gujarat",
        "district": "Rajkot",
        "land_area_hectares": 125.0,
        "affected_families": 85,
        "documentation_completeness": 68.0,
        "approval_progress": 55.0,
        "compensation_progress": 42.0,
        "legal_dispute_count": 4,
        "pending_notifications": 3,
        "ownership_conflict_count": 5,
        "rehabilitation_progress": 35.0,
        "stakeholder_responsiveness": 48.0,
        "department_coordination_score": 52.0,
        "possession_progress": 30.0,
        "current_stage": "Compensation",
        "days_elapsed": 420,
        "target_duration_days": 360,
    }

    factors = explain_prediction(sample_project)

    print("\n===== TOP CONTRIBUTING FACTORS =====")

    for factor in factors:
        print(
            f"{factor['factor']}: "
            f"{factor['importance']}"
        )
