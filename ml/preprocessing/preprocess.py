import pandas as pd
from sklearn.model_selection import train_test_split

INPUT_PATH = "ml/data/synthetic/land_acquisition_synthetic.csv"
TARGET = "delay_status"

df = pd.read_csv(INPUT_PATH)

# Remove duplicate records
df = df.drop_duplicates()

# Remove invalid negative values
non_negative_columns = [
    "land_area_hectares",
    "affected_families",
    "legal_dispute_count",
    "pending_notifications",
    "ownership_conflict_count",
    "days_elapsed",
    "target_duration_days",
]

for column in non_negative_columns:
    df = df[df[column] >= 0]

X = df.drop(columns=[TARGET])
y = df[TARGET]

# Stratified 80/20 split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

X_train.to_csv("ml/data/processed/X_train.csv", index=False)
X_test.to_csv("ml/data/processed/X_test.csv", index=False)
y_train.to_csv("ml/data/processed/y_train.csv", index=False)
y_test.to_csv("ml/data/processed/y_test.csv", index=False)

print("Preprocessing complete.")
print("Total records:", len(df))
print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print("Training delay rate:", round(y_train.mean(), 3))
print("Testing delay rate:", round(y_test.mean(), 3))
