from pydantic import BaseModel, Field


class CarBase(BaseModel):
    brand_company: str = Field(..., max_length=128)
    brand_model: str = Field(..., max_length=128)
    body_type: str = Field(..., max_length=64)
    reg_number: str = Field(..., max_length=32)


class CarCreate(CarBase):
    pass


class CarUpdate(BaseModel):
    brand_company: str | None = None
    brand_model: str | None = None
    body_type: str | None = None
    reg_number: str | None = None


class CarResponse(CarBase):
    id: int
    model_config = {"from_attributes": True}
