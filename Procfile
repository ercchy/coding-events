web: python manage.py collectstatic --noinput && python manage.py compress --force; gunicorn codeweekeu.wsgi -b 0.0.0.0:$PORT
