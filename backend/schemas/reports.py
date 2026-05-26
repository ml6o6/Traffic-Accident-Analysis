from datetime import date
from pydantic import BaseModel

#Отчёт 1: водители, попавшие в более чем одно ДТП
class MultiAccidentDriver(BaseModel):
    driver_id: int
    full_name: str
    license_number: str
    accident_count: int

#Общая строка для отчётов 2 и 3 - данные о водителе и ДТП
class DriverAccidentRow(BaseModel):
    driver_id: int
    full_name: str
    car_reg_number: str | None = None
    accident_date: date
    location: str
    accident_type: str
    accident_cause: str

#Отчёт 4: акт ДТП с максимальным числом пострадавших
class MaxVictimsAccident(BaseModel):
    id: int
    act_number: str
    accident_date: date
    location: str
    victims_count: int
    accident_type: str
    accident_cause: str
    driver_id: int
    driver_full_name: str | None = None
    car_reg_number: str | None = None

#Отчёт 5: водители с min_count и более наездами на пешехода
class PedestrianDriver(BaseModel):
    driver_id: int
    full_name: str
    license_number: str
    pedestrian_count: int

#Отчёт 6: частота причин ДТП с процентной долей
class CauseFrequencyRow(BaseModel):
    cause: str
    count: int
    percentage: float
