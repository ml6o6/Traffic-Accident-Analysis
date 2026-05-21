from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from . import models  # noqa: F401 — регистрируем модели для Alembic
from .routers import cars, drivers, accidents


def create_app() -> FastAPI:
    app = FastAPI(
        title="Система анализа ДТП",
        version="0.1.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_prefix = "/api"
    app.include_router(cars.router, prefix=api_prefix)
    app.include_router(drivers.router, prefix=api_prefix)
    app.include_router(accidents.router, prefix=api_prefix)

    @app.get("/api/health", tags=["health"])
    def health():
        return {"status": "ok"}

    return app


app = create_app()
