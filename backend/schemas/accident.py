import enum
from datetime import date
from pydantic import BaseModel, Field


class AccidentType(str, enum.Enum):
    pedestrian = "Наезд на пешехода"
    obstacle = "Наезд на препятствие"
    collision = "Столкновение"
    rollover = "Опрокидывание"
    off_road = "Съезд с дороги"
    cyclist = "Наезд на велосипедиста"
    other = "Прочее"


class AccidentCause(str, enum.Enum):
    oncoming = "Выезд на полосу встречного движения"
    driver_state = "Состояние водителя"
    car_fault = "Неисправность автомобиля"
    rule_violation = "Нарушение ПДД"
    speeding = "Превышение скорости"
    road_conditions = "Плохие дорожные условия"
    other = "Прочее"


class AccidentBase(BaseModel):
    department_name: str = Field(..., max_length=255)
    act_number: str = Field(..., max_length=64)
    driver_id: int
    car_reg_number: str | None = Field(None, max_length=32)
    accident_date: date
    location: str = Field(..., max_length=512)
    latitude: float | None = None
    longitude: float | None = None
    victims_count: int = Field(0, ge=0)
    accident_type: AccidentType
    accident_cause: AccidentCause


class AccidentCreate(AccidentBase):
    pass


class AccidentUpdate(BaseModel):
    department_name: str | None = None
    act_number: str | None = None
    driver_id: int | None = None
    car_reg_number: str | None = None
    accident_date: date | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    victims_count: int | None = Field(None, ge=0)
    accident_type: AccidentType | None = None
    accident_cause: AccidentCause | None = None


class AccidentResponse(AccidentBase):
    id: int
    model_config = {"from_attributes": True}
