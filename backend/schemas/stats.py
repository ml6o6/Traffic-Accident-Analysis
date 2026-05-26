from pydantic import BaseModel

#Количество ДТП по виду
class TypeStatRow(BaseModel):
    type: str
    count: int

#Количество ДТП по причине
class CauseStatRow(BaseModel):
    cause: str
    count: int

#Количество ДТП за каждый день месяца
class DayStatRow(BaseModel):
    day: int
    count: int

#Места с наибольшим числом пострадавших
class LocationStatRow(BaseModel):
    location: str
    total_victims: int

#Сводная статистика для дашборда
class SummaryResponse(BaseModel):
    total_accidents: int
    total_victims: int
    top_type: str | None = None
    top_cause: str | None = None
