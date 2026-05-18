from datetime import date
from pydantic import BaseModel, Field


class DriverBase(BaseModel):
    full_name: str = Field(..., max_length=255)
    experience: int = Field(0, ge=0, le=80)
    car_reg_number: str | None = Field(None, max_length=32)
    license_number: str = Field(..., max_length=64)
    license_date: date
    act_number: str | None = Field(None, max_length=64)


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    full_name: str | None = None
    experience: int | None = Field(None, ge=0, le=80)
    car_reg_number: str | None = None
    license_number: str | None = None
    license_date: date | None = None
    act_number: str | None = None


class DriverResponse(DriverBase):
    id: int
    model_config = {"from_attributes": True}
