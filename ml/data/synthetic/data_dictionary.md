# LAPREDICT Synthetic Dataset — Data Dictionary

## Purpose

This dataset is artificial demonstration data created for prototyping
and testing the LAPREDICT predictive analytics system.

It is NOT official government data and must NOT be presented as
validated real-world statistics.

The relationships used to generate the `delay_status` target are
prototype assumptions designed to demonstrate the machine-learning
workflow.

---

## Dataset Information

- Number of records: 2,500
- Target variable: `delay_status`
- Target type: Binary classification
- Random seed: 42
- Dataset format: CSV
- File: `land_acquisition_synthetic.csv`

---

## Columns

| Column | Type | Description |
|---|---|---|
| project_id | String | Unique artificial project identifier |
| project_type | Categorical | Type of infrastructure project |
| state | Categorical | Artificial project state category |
| district | Categorical | District associated with the artificial project |
| land_area_hectares | Numeric | Total land required in hectares |
| affected_families | Integer | Number of families affected by the acquisition |
| documentation_completeness | Numeric | Percentage completeness of required documentation |
| approval_progress | Numeric | Percentage progress of required approvals |
| compensation_progress | Numeric | Percentage progress of compensation activities |
| legal_dispute_count | Integer | Number of active legal disputes |
| pending_notifications | Integer | Number of pending acquisition-related notifications |
| ownership_conflict_count | Integer | Number of ownership conflicts |
| rehabilitation_progress | Numeric | Percentage progress of rehabilitation activities |
| stakeholder_responsiveness | Numeric | Artificial score representing stakeholder responsiveness |
| department_coordination_score | Numeric | Artificial score representing inter-department coordination |
| possession_progress | Numeric | Percentage progress toward land possession |
| current_stage | Categorical | Current stage of the acquisition process |
| days_elapsed | Integer | Number of days elapsed since acquisition started |
| target_duration_days | Integer | Artificial expected duration for the project |
| delay_status | Binary | Target variable: 1 = delayed, 0 = not delayed |

---

## Target Variable

### delay_status

This is the target variable used for classification.

```text
1 = Delayed
0 = Not delayed
