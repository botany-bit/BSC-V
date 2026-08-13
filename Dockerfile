# Counselling Portal — all-in-one container
FROM python:3.12-slim

# persistent data dir (mount a volume here in production)
ENV DATABASE_PATH=/data/counselling.db \
    PORT=5000 \
    FLASK_SECURE_COOKIES=0 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request,sys;import os;\
sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','5000')+'/healthz', timeout=3).status==200 else 1)"

CMD ["gunicorn", "wsgi:application", "-c", "gunicorn.conf.py"]
