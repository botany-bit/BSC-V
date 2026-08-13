# 📤 Uploading to GitHub — 2-Minute Flow

This folder is already GitHub-ready (`.gitignore` excludes the database,
backups, caches, and `.env`). Pick ONE of the two methods below.

---

## Method 1 — GitHub web upload (no terminal)

1. Go to https://github.com/new → create repo, e.g. `bsc-counselling-portal`
   (Public or Private — your call), **do not** initialize with README.
2. On the empty repo page click **“uploading an existing file”**.
3. Drag the **contents** of this folder (not the folder itself) into the page:
   `app.py`, `oe_catalog.py`, `wsgi.py`, `gunicorn.conf.py`, `requirements.txt`,
   `Procfile`, `render.yaml`, `Dockerfile`, `docker-compose.yml`,
   `.env.example`, `.gitignore`, `README.md`, `DEPLOYMENT.md`,
   `portal_preview.html`, `templates/…`, `static/…`
   ⚠️ Do **not** upload `counselling.db` — a fresh seeded database is created
   automatically on first boot (course catalogue, mentors, notices).
4. Commit: *"Initial commit — B.Sc. Counselling Portal 2026-27"*.

## Method 2 — Git commands

```bash
cd bsc_counselling_portal
git init
git add .
git commit -m "Initial commit — B.Sc. Counselling Portal 2026-27"
git branch -M main
git remote add origin https://github.com/<you>/bsc-counselling-portal.git
git push -u origin main
```

(Authenticate with a Personal Access Token if GitHub asks for a password.)

---

## Then deploy from the repo (choose one)

- **Render**: Dashboard → *New → Blueprint* → select the repo → it reads
  `render.yaml` → set `ADMIN_PASSWORD` when asked → Deploy.
- **Railway / Koyeb / Fly**: “Deploy from GitHub repo” — `Procfile` is picked up
  automatically; add env vars from `.env.example`.
- **VPS**: `git clone` on the server, then follow DEPLOYMENT.md (Docker or
  systemd + gunicorn).

## Safety reminders

- 🔐 Never commit `.env` or `counselling.db` (already in `.gitignore`).
- 🔐 Set a strong `ADMIN_PASSWORD` in the host dashboard before sharing the URL.
- 📦 Database lives on the host’s persistent disk (`DATABASE_PATH` in
  `render.yaml` / compose keeps it across redeploys).
- 🔄 Updating later = `git push` → the host redeploys automatically.
