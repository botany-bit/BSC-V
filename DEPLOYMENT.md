# 🚀 Deployment Guide — B.Sc. Counselling Portal 2026-27

Production-ready checklist is baked into the repo: `wsgi.py`, `gunicorn.conf.py`,
`Procfile`, `render.yaml`, `Dockerfile`, `docker-compose.yml`, `.env.example`.

## Quick picks

| Host you have | Use this |
|---|---|
| Render.com (free) | `render.yaml` blueprint |
| Railway / Fly.io / Koyeb | `Procfile` |
| Any Linux VPS | Docker / docker-compose, or gunicorn + systemd |
| Shared cPanel-style host | gunicorn via Passenger (likely unavailable — use VPS/Render) |

---

## A. Render.com (easiest free path)

1. Push this folder to a GitHub repo.
2. Render Dashboard → **New → Blueprint** → pick the repo (it reads `render.yaml`).
3. Add the secret: set `ADMIN_PASSWORD` when prompted; `SECRET_KEY` auto-generates.
4. The blueprint creates a **1 GB persistent disk** mounted at `/opt/render/project/src/data` and sets `DATABASE_PATH` there — SQLite data survives redeploys.
5. Deploy. Your app is at `https://<name>.onrender.com` (HTTPS auto; `FLASK_SECURE_COOKIES=1` is already set in the blueprint).

First boot auto-seeds the DB (courses catalogue, sample mentors, notices). Admin login: `/admin` with your `ADMIN_PASSWORD`.

## B. Docker (any VPS / local server)

```bash
docker build -t counselling-portal .
docker run -d --name portal -p 5000:5000 \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  -e ADMIN_PASSWORD="YourStrongPass" \
  -e FLASK_SECURE_COOKIES=1 \
  -v counselling-data:/data \
  counselling-portal
```
Health endpoint: `GET /healthz` → `{"status":"ok","db":"ok"}`.

Or simply `docker compose up -d` (uses docker-compose.yml).

## C. VPS bare-metal (Ubuntu example)

```bash
sudo apt update && sudo apt install -y python3-venv
cd /opt && sudo git clone <your-repo> counselling && cd counselling
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # then edit values
sudo mkdir -p /var/lib/counselling && sudo chown $USER /var/lib/counselling
export DATABASE_PATH=/var/lib/counselling/counselling.db
gunicorn wsgi:application -c gunicorn.conf.py
```

systemd unit `/etc/systemd/system/counselling.service`:

```ini
[Unit]
Description=B.Sc. Counselling Portal
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/counselling
EnvironmentFile=/opt/counselling/.env
ExecStart=/opt/counselling/.venv/bin/gunicorn wsgi:application -c gunicorn.conf.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Nginx front (recommended for HTTPS + your domain):

```nginx
server {
    server_name counselling.yourdomain.ac.in;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Then `sudo certbot --nginx` for a free SSL cert → app sets `FLASK_SECURE_COOKIES=1` automatically via env.

## D. Environment variables (all optional except the two marked 🔐)

| Var | Purpose | Default |
|---|---|---|
| 🔐 `SECRET_KEY` | Flask session signing | dev value |
| 🔐 `ADMIN_PASSWORD` | Admin dashboard login | `amu@2026` — **change before go-live** |
| `DATABASE_PATH` | where SQLite file lives | `./counselling.db` |
| `PORT` / `HOST` | bind | `5000` / `0.0.0.0` |
| `FLASK_SECURE_COOKIES` | `1` = HTTPS-only cookies | `0` |
| `MAX_UPLOAD_MB` | import file size cap | `10` |
| `WEB_CONCURRENCY` / `WEB_THREADS` | gunicorn capacity | `2` / `4` |

## Operational notes

- **Backups**: Admin → Entry Sheet → Backup — or copy the SQLite file. Volume-mounted paths (`/data`, `/var/lib/...`) keep it safe across redeploys.
- **Free-tier sleeps** (Render): first request may take ~30–50 s on cold start; a 5-min cron ping of `/healthz` (UptimeRobot free) keeps it warm.
- **Scaling**: 2 gunicorn workers × 4 threads handles a department-size load comfortably. SQLite single-writer is fine for this workload.
- **After go-live checklist**: change `ADMIN_PASSWORD` · set `SECRET_KEY` · `FLASK_SECURE_COOKIES=1` behind HTTPS · take a Backup from the UI · bookmark `/healthz`.
