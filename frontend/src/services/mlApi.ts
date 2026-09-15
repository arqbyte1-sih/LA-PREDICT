export const ML_API_URL = import.meta.env.VITE_ML_API_URL || "http://127.0.0.1:8000";

export type MlPredictionRequest = {
  project_id: string;
  project_type: string;
  state: string;
  district: string;
  land_area_hectares: number;
  affected_families: number;
  documentation_completeness: number;
  approval_progress: number;
  compensation_progress: number;
  legal_dispute_count: number;
  pending_notifications: number;
  ownership_conflict_count: number;
  rehabilitation_progress: number;
  stakeholder_responsiveness: number;
  department_coordination_score: number;
  possession_progress: number;
  current_stage: string;
  days_elapsed: number;
  target_duration_days: number;
};

export type MlRiskFactor = {
  factor: string;
  importance: number;
};

export type MlPredictionResponse = {
  project_id: string;
  risk_score: number;
  risk_category: "Low" | "Medium" | "High";
  delay_probability: number;
  predicted_delay: number;
  top_risk_factors: MlRiskFactor[];
  recommendations: string[];
  model_version: string;
};

type FrontendProjectLike = {
  id: string;
  name: string;
  state: string;
  district: string;
  department: string;
  stage: string;
  progress: number;
  type: string;
  riskTone: "high" | "medium" | "low";
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const projectToMlPredictionRequest = (
  project: FrontendProjectLike,
): MlPredictionRequest => {
  const projectProgress = clamp(project.progress, 0, 100);
  const riskToneBonus = project.riskTone === "high" ? 2 : project.riskTone === "medium" ? 1 : 0;

  const targetDurationDays = Math.max(180, Math.round((projectProgress / 100) * 540 + 180));
  const daysElapsed = Math.round(targetDurationDays * (projectProgress / 100));

  return {
    project_id: project.id,
    project_type: project.type || "Highway",
    state: project.state || "Demo State",
    district: project.district || "Demo District",
    land_area_hectares: Number((12.5 + projectProgress * 0.25).toFixed(2)),
    affected_families: 40 + riskToneBonus * 25 + Math.round(projectProgress * 0.35),
    documentation_completeness: clamp(Math.round(projectProgress * 0.9), 0, 100),
    approval_progress: clamp(Math.round(projectProgress * 0.82), 0, 100),
    compensation_progress: clamp(Math.round(projectProgress * 0.76), 0, 100),
    legal_dispute_count: project.riskTone === "high" ? 4 : project.riskTone === "medium" ? 2 : 1,
    pending_notifications: project.riskTone === "high" ? 5 : project.riskTone === "medium" ? 3 : 1,
    ownership_conflict_count: project.riskTone === "high" ? 3 : project.riskTone === "medium" ? 2 : 1,
    rehabilitation_progress: clamp(Math.round(projectProgress * 0.7), 0, 100),
    stakeholder_responsiveness: clamp(Math.round(100 - projectProgress * 0.45), 0, 100),
    department_coordination_score: clamp(Math.round(100 - projectProgress * 0.38), 0, 100),
    possession_progress: clamp(Math.round(projectProgress * 0.8), 0, 100),
    current_stage: project.stage || "Compensation",
    days_elapsed: daysElapsed,
    target_duration_days: targetDurationDays,
  };
};

export const predictLandAcquisitionRisk = async (
  data: MlPredictionRequest,
): Promise<MlPredictionResponse> => {
  const response = await fetch(`${ML_API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = "ML prediction service is unavailable. Start the LAPREDICT ML API to view predictive risk analysis.";

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === "string") {
        message = errorBody.detail;
      } else if (Array.isArray(errorBody?.detail)) {
        message = errorBody.detail.map((item: { msg?: string }) => item.msg || "Invalid data").join("; ");
      }
    } catch {
      // Fall back to the default user-friendly message.
    }

    throw new Error(message);
  }

  return (await response.json()) as MlPredictionResponse;
};
