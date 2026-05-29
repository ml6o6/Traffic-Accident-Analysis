# Система анализа ДТП

Веб-приложение для учёта и анализа дорожно-транспортных происшествий

### Backend

```bash
# 1. Установить зависимости
pip install -r Traffic-Accident-Analysis/backend/requirements.txt

# 2. Создать БД в PostgreSQL
psql -U postgres -c "CREATE DATABASE dtp_db;"

# 3. Применить миграции
cd Traffic-Accident-Analysis
python -m alembic upgrade head

# 4. Заполнить демо-данными
python -m backend.seed

# 5. Запустить API
python -m uvicorn backend.main:app --reload
```

API доступен на http://localhost:8000, Swagger — на http://localhost:8000/api/docs.

### Frontend

```bash
cd Traffic-Accident-Analysis/frontend
npm install
npm run dev
```

Открыть http://localhost:5173.

## Тестовые учётные записи

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Полный доступ |
| `user` | `user123` | Только чтение |

## Тесты

```bash
python -m pytest backend/tests/
```

