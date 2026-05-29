#!/bin/sh
set -e

echo "Ожидание готовности базы данных..."
python - <<'PY'
import os, time
import psycopg

url = os.environ.get('DATABASE_URL', '')
if not url:
    print("DATABASE_URL не задан — пропускаем ожидание.")
    raise SystemExit(0)

# Для psycopg.connect нужен URL без префикса "+psycopg"
clean_url = url.replace('postgresql+psycopg://', 'postgresql://')

for attempt in range(30):
    try:
        conn = psycopg.connect(clean_url, connect_timeout=2)
        conn.close()
        print("База данных готова.")
        break
    except Exception as exc:
        print(f"Не готова ({attempt+1}/30): {exc}")
        time.sleep(2)
else:
    print("База данных так и не стала доступной, прерываем запуск.")
    raise SystemExit(1)
PY

echo "Применение миграций Alembic..."
alembic -c alembic.ini upgrade head

echo "Заполнение начальных данных..."
python -m backend.seed || echo "Сид завершился с предупреждением (возможно, данные уже есть)"

exec "$@"
