# Gunicorn production configuration — Counselling Portal
import os

bind = "0.0.0.0:" + os.environ.get("PORT", "5000")
# SQLite is single-writer: keep workers modest; threads handle concurrency
workers = int(os.environ.get("WEB_CONCURRENCY", "2"))
threads = int(os.environ.get("WEB_THREADS", "4"))
worker_class = "gthread"

accesslog = "-"            # stdout
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info")
timeout = 60
keepalive = 5

# security/precision niceties
forwarded_allow_ips = "*"
secure_scheme_headers = {"X-FORWARDED-PROTO": "https"}
