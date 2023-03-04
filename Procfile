web: gunicorn app:app --log-file=- 2>&1
worker: python -c "from app import refresh_token; refresh_token()"