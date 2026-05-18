from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Унифицированный ответ для операций, не возвращающих сущность."""
    message: str


class HealthResponse(BaseModel):
    status: str = "ok"


class ErrorResponse(BaseModel):
    detail: str
