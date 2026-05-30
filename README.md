# Система анализа ДТП

Веб-приложение для учёта и анализа дорожно-транспортных происшествий.
Аналитика (дашборд, статистика, карта) открыта без входа; ведение
справочников, актов ДТП и отчётов — только под учётной записью администратора.

### Backend

```bash
# 1. Установить зависимости
pip install -r Traffic-Accident-Analysis/backend/requirements.txt

# 2. Создать БД в PostgreSQL
psql -U postgres -c "CREATE DATABASE dtp_db;"

# 3. Применить миграции
cd Traffic-Accident-Analysis
python -m alembic upgrade head

# 4. Заполнить демо-данными (40 водителей, 30 авто, 300 актов)
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

Открыть http://localhost:5173 — приложение сразу откроется в гостевом режиме.

### Запуск через Docker

```bash
docker compose up --build
```

## Тестовая учётная запись

| Логин   | Пароль     | Роль  |
|---------|------------|-------|
| `admin` | `admin123` | admin |

Гостям логин не нужен — статистика и карта доступны сразу.

## Тесты

```bash
python -m pytest backend/tests/
```
