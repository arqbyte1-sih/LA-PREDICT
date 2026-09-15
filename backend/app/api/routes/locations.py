from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.district import District
from app.models.state import State
from app.schemas.location import DistrictListResponse, StateResponse

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/states", response_model=list[StateResponse])
def list_states(db: Session = Depends(get_db)) -> list[State]:
    return list(db.scalars(select(State).order_by(State.name)).all())


@router.get("/states/{state_id}/districts", response_model=DistrictListResponse)
def list_districts(state_id: int, db: Session = Depends(get_db)) -> DistrictListResponse:
    state = db.get(State, state_id)
    if state is None:
        raise HTTPException(status_code=404, detail="State or Union Territory not found")

    districts = list(
        db.scalars(select(District).where(District.state_id == state_id).order_by(District.name)).all()
    )
    return DistrictListResponse(state=state, districts=districts)