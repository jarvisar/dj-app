web: gunicorn app:app --workers 1 --preload && python -c 'from app import refresh_token; refresh_token()'