import os
import random
import numpy as np
import pandas as pd


# ============================================================
# LAPREDICT - Synthetic Land Acquisition Dataset Generator
# ============================================================
#
# IMPORTANT:
# This dataset is artificial demonstration data created for
# prototyping and testing.
#
# It is NOT official government data and must NOT be presented
# as validated real-world statistics.
#
# The relationships used to generate delay_status are prototype
# assumptions designed to demonstrate the ML workflow.
# ============================================================


RANDOM_SEED = 42
NUM_RECORDS = 2500

random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


PROJECT_TYPES = [
    "Highway",
    "Railway",
    "Irrigation",
    "Industrial",
    "Urban Development",
    "Power",
]

STATES = [
    "Gujarat",
    "Maharashtra",
    "Rajasthan",
    "Madhya Pradesh",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "Uttar Pradesh",
]

DISTRICTS = {
    "Gujarat": ["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Kutch"],
    "Maharashtra": ["Pune", "Nashik", "Nagpur", "Aurangabad", "Thane"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Ajmer"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Belagavi", "Mangaluru"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj"],
}

STAGES = [
    "Notification",
    "Valuation",
    "Compensation",
    "Rehabilitation",
    "Possession",
]


def bounded_normal(mean, std, minimum=0, maximum=100):
    """Generate a normally distributed value bounded within a range."""
    value = np.random.normal(mean, std)
    return round(float(np.clip(value, minimum, maximum)), 2)


def generate_record(index):
    project_type = random.choice(PROJECT_TYPES)
    state = random.choice(STATES)
    district = random.choice(DISTRICTS[state])
    current_stage = random.choice(STAGES)

    # Project scale
    land_area_hectares = round(
        float(np.random.lognormal(mean=2.0, sigma=0.8)),
        2,
    )
    land_area_hectares = min(max(land_area_hectares, 5), 500)

    affected_families = max(
        1,
        int(
            np.random.normal(
                70 + land_area_hectares * 1.2,
                45,
            )
        ),
    )

    # Administrative progress
    documentation_completeness = bounded_normal(78, 17)
    approval_progress = bounded_normal(70, 20)
    compensation_progress = bounded_normal(64, 22)
    rehabilitation_progress = bounded_normal(60, 24)

    # Risk-related counts
    legal_dispute_count = max(
        0,
        int(np.random.poisson(lam=max(0.5, affected_families / 45))),
    )

    pending_notifications = max(
        0,
        int(np.random.poisson(lam=2.5)),
    )

    ownership_conflict_count = max(
        0,
        int(np.random.poisson(lam=max(0.5, affected_families / 55))),
    )

    # Coordination / responsiveness
    stakeholder_responsiveness = bounded_normal(68, 20)
    department_coordination_score = bounded_normal(70, 18)

    # Possession generally follows other acquisition progress
    possession_base = (
        documentation_completeness * 0.15
        + approval_progress * 0.25
        + compensation_progress * 0.30
        + rehabilitation_progress * 0.15
        + department_coordination_score * 0.15
    )

    possession_progress = round(
        float(
            np.clip(
                possession_base + np.random.normal(0, 8),
                0,
                100,
            )
        ),
        2,
    )

    # Project duration
    complexity_factor = (
        1.0
        + land_area_hectares / 500
        + affected_families / 1000
        + legal_dispute_count / 30
    )

    target_duration_days = int(
        np.clip(
            np.random.normal(
                450 * complexity_factor,
                60,
            ),
            180,
            1000,
        )
    )

    # Days elapsed is influenced by project progress and complexity
    expected_elapsed = target_duration_days * (
        0.55
        + (100 - possession_progress) / 180
    )

    days_elapsed = int(
        np.clip(
            np.random.normal(expected_elapsed, 90),
            30,
            1400,
        )
    )

    # ========================================================
    # Prototype delay-risk generation formula
    # ========================================================
    #
    # These weights are NOT learned from government data.
    # They are artificial assumptions used only to create
    # demonstration labels for the prototype.
    # ========================================================

    risk_score = 0.0

    # Higher values increase delay tendency
    risk_score += legal_dispute_count * 3.5
    risk_score += ownership_conflict_count * 3.0
    risk_score += pending_notifications * 2.0

    # Lower progress increases delay tendency
    risk_score += (100 - documentation_completeness) * 0.35
    risk_score += (100 - compensation_progress) * 0.30
    risk_score += (100 - rehabilitation_progress) * 0.22
    risk_score += (100 - stakeholder_responsiveness) * 0.18
    risk_score += (100 - department_coordination_score) * 0.20
    risk_score += (100 - approval_progress) * 0.18
    risk_score += (100 - possession_progress) * 0.22

    # Project scale adds complexity
    risk_score += min(affected_families / 15, 25)
    risk_score += min(land_area_hectares / 25, 20)

    # Current elapsed duration relative to target
    duration_ratio = days_elapsed / max(target_duration_days, 1)

    if duration_ratio > 1:
        risk_score += (duration_ratio - 1) * 45

    # Add controlled random noise
    risk_score += np.random.normal(0, 12)

    # Convert artificial risk tendency to probability
    probability = 1 / (1 + np.exp(-(risk_score - 85) / 18))

    # Add a small amount of randomness to prevent deterministic labels
    probability = float(
        np.clip(
            probability + np.random.normal(0, 0.04),
            0.01,
            0.99,
        )
    )

    delay_status = int(np.random.random() < probability)

    project_id = f"LA-{index:05d}"

    return {
        "project_id": project_id,
        "project_type": project_type,
        "state": state,
        "district": district,
        "land_area_hectares": land_area_hectares,
        "affected_families": affected_families,
        "documentation_completeness": documentation_completeness,
        "approval_progress": approval_progress,
        "compensation_progress": compensation_progress,
        "legal_dispute_count": legal_dispute_count,
        "pending_notifications": pending_notifications,
        "ownership_conflict_count": ownership_conflict_count,
        "rehabilitation_progress": rehabilitation_progress,
        "stakeholder_responsiveness": stakeholder_responsiveness,
        "department_coordination_score": department_coordination_score,
        "possession_progress": possession_progress,
        "current_stage": current_stage,
        "days_elapsed": days_elapsed,
        "target_duration_days": target_duration_days,
        "delay_status": delay_status,
    }


def generate_dataset():
    """Generate and save the complete synthetic dataset."""

    records = [
        generate_record(index)
        for index in range(1, NUM_RECORDS + 1)
    ]

    df = pd.DataFrame(records)

    output_directory = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(
        output_directory,
        "land_acquisition_synthetic.csv",
    )

    df.to_csv(output_path, index=False)

    print("=" * 60)
    print("LAPREDICT SYNTHETIC DATASET GENERATED")
    print("=" * 60)
    print(f"Records generated : {len(df)}")
    print(f"Columns           : {len(df.columns)}")
    print(f"Delayed projects  : {df['delay_status'].sum()}")
    print(
        f"Not delayed       : {(df['delay_status'] == 0).sum()}"
    )
    print(
        f"Delay percentage  : "
        f"{df['delay_status'].mean() * 100:.2f}%"
    )
    print(f"Saved to          : {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    generate_dataset()
