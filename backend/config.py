from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # На начальном этапе используем локальный SQLite-файл.
    # Позже строка будет переопределяться переменной окружения для PostgreSQL.
    DATABASE_URL: str = "sqlite:///./dtp_dev.db"

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


settings = Settings()
