from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator

from ml.inference.predict import predict_project

MODEL_VERSION = "lapredict-random-forest-v1"


app = FastAPI(
    title="LAPREDICT ML API",
    description="Predictive Analysis System for Early Detection of Land Acquisition Delays",
    version="1.0.0",
)


class ProjectData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_id: str = Field(..., min_length=1)
    project_type: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    district: str = Field(..., min_length=1)
    land_area_hectares: float = Field(ge=0)
    affected_families: int = Field(ge=0)
    documentation_completeness: float = Field(ge=0, le=100)
    approval_progress: float = Field(ge=0, le=100)
    compensation_progress: float = Field(ge=0, le=100)
    legal_dispute_count: int = Field(ge=0)
    pending_notifications: int = Field(ge=0)
    ownership_conflict_count: int = Field(ge=0)
    rehabilitation_progress: float = Field(ge=0, le=100)
    stakeholder_responsiveness: float = Field(ge=0, le=100)
    department_coordination_score: float = Field(ge=0, le=100)
    possession_progress: float = Field(ge=0, le=100)
    current_stage: str = Field(..., min_length=1)
    days_elapsed: int = Field(gt=0)
    target_duration_days: int = Field(gt=0)

    @field_validator(
        "land_area_hectares",
        "documentation_completeness",
        "approval_progress",
        "compensation_progress",
        "rehabilitation_progress",
        "stakeholder_responsiveness",
        "department_coordination_score",
        "possession_progress",
        mode="after",
    )
    @classmethod
    def validate_non_negative_percentage(cls, value: float, info: Any) -> float:
        field_name = info.field_name
        if value < 0:
            raise ValueError(f"{field_name} must be non-negative")
        if field_name in {
            "documentation_completeness",
            "approval_progress",
            "compensation_progress",
            "rehabilitation_progress",
            "stakeholder_responsiveness",
            "department_coordination_score",
            "possession_progress",
        } and value > 100:
            raise ValueError(f"{field_name} must be between 0 and 100")
        return value


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Invalid request data.", "errors": exc.errors()},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error."},
    )


@app.get("/")
def root():
    return {
        "service": "LAPREDICT ML API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": MODEL_VERSION,
    }


@app.post("/predict")
def predict(data: ProjectData):
    try:
        return predict_project(data.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except TypeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to generate prediction.") from exc
