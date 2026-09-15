from pydantic import BaseModel, ConfigDict


class DistrictResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    state_id: int
    name: str


class StateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    is_union_territory: bool


class DistrictListResponse(BaseModel):
    state: StateResponse
    districts: list[DistrictResponse]