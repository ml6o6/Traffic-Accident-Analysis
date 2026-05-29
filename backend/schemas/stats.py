from datetime import date
from pydantic import BaseModel


# Схемы для статистики и дашборда/сводки по ДТП

class TypeStatRow(BaseModel):
    type: str
    count: int


class CauseStatRow(BaseModel):
    cause: str
    count: int


class DayStatRow(BaseModel):
    day: int
    count: int


class LocationStatRow(BaseModel):
    location: str
    total_victims: int


class SummaryResponse(BaseModel):
    total_accidents: int
    total_victims: int
    top_type: str | None = None
    top_cause: str | None = None


# --- Dashboard ---

class PeriodStats(BaseModel):
    accidents: int
    victims: int


class DailyCount(BaseModel):
    date: date
    count: int


class TopLocation(BaseModel):
    location: str
    count: int


class RecentAccident(BaseModel):
    id: int
    act_number: str
    accident_date: date
    location: str
    accident_type: str
    victims_count: int
    driver_name: str | None = None


class DashboardResponse(BaseModel):
    current_period: PeriodStats
    previous_period: PeriodStats
    daily_counts: list[DailyCount]
    top_locations: list[TopLocation]
    recent_accidents: list[RecentAccident]
