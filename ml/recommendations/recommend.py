def generate_recommendations(risk_factors):
    recommendations = []

    factor_actions = {
        "possession_progress": (
            "Prioritize pending land possession activities and resolve "
            "field-level bottlenecks to improve possession progress."
        ),
        "compensation_progress": (
            "Review pending compensation cases, verify beneficiary "
            "documentation, and accelerate eligible disbursements."
        ),
        "rehabilitation_progress": (
            "Track pending rehabilitation and resettlement activities "
            "and coordinate with responsible departments for faster completion."
        ),
        "affected_families": (
            "Identify high-impact family cases and strengthen "
            "stakeholder coordination to reduce rehabilitation and settlement delays."
        ),
        "legal_dispute_count": (
            "Prioritize unresolved legal disputes and coordinate with "
            "the concerned legal and administrative authorities."
        ),
        "ownership_conflict_count": (
            "Verify ownership records and resolve ownership conflicts "
            "through coordinated documentation and verification."
        ),
        "pending_notifications": (
            "Review pending notifications and complete required "
            "administrative approvals promptly."
        ),
        "documentation_completeness": (
            "Complete missing land and beneficiary documentation "
            "before progressing to dependent acquisition activities."
        ),
        "approval_progress": (
            "Escalate pending approvals and improve coordination "
            "between departments responsible for the acquisition process."
        ),
        "stakeholder_responsiveness": (
            "Increase stakeholder follow-ups and establish regular "
            "communication to resolve pending issues."
        ),
        "department_coordination_score": (
            "Strengthen inter-departmental coordination through "
            "regular progress reviews and issue escalation."
        ),
        "days_elapsed": (
            "Review the project timeline and prioritize activities "
            "that are approaching or exceeding the planned duration."
        ),
    }

    for factor in risk_factors:
        factor_name = factor["factor"]

        # Remove preprocessing prefixes such as numeric__ and categorical__
        clean_name = factor_name.split("__")[-1]

        if clean_name in factor_actions:
            recommendations.append(factor_actions[clean_name])

    # Remove duplicates while preserving order
    recommendations = list(dict.fromkeys(recommendations))

    if not recommendations:
        recommendations.append(
            "Continue monitoring the project and review major acquisition "
            "milestones regularly for emerging delay risks."
        )

    return recommendations


if __name__ == "__main__":
    sample_factors = [
        {"factor": "numeric__possession_progress", "importance": 0.0991},
        {"factor": "numeric__compensation_progress", "importance": 0.0866},
        {"factor": "numeric__rehabilitation_progress", "importance": 0.0713},
        {"factor": "numeric__affected_families", "importance": 0.0600},
    ]

    recommendations = generate_recommendations(sample_factors)

    print("\n===== RECOMMENDATIONS =====")

    for i, recommendation in enumerate(recommendations, start=1):
        print(f"{i}. {recommendation}")
