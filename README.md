# B.Sc. (V Semester) Counselling Portal 2026-27
**Aligarh Muslim University, Aligarh — Faculty of Science**

> 🌐 **Going live on the internet? See [DEPLOYMENT.md](DEPLOYMENT.md).**

A self-contained Flask + SQLite web portal covering **two counselling tracks**:

1. **Academic Counselling** — for students currently in B.Sc. V Semester (Session 2026-27):
   mentor–mentee registration, mentor directory, weekly schedule, one-to-one
   appointment booking, and confidential grievance submission.
2. **Admission Counselling** — for new entrants (2026-27): counselling registration
   with subject-combination preferences, round-wise schedule, indicative seat matrix,
   and document checklist.

It also includes a notice board and a password-protected **Admin dashboard**.

---

## ▶️ Run the portal

```bash
cd bsc_counselling_portal
pip install -r requirements.txt
python3 app.py                      # dev
# production:
gunicorn wsgi:application -c gunicorn.conf.py
```

Open **http://localhost:5000** · health check: **/healthz**

The SQLite database (`counselling.db`) is created and seeded automatically on first run.

## 🔐 Admin dashboard

- URL: `/admin`
- Default password: **`amu@2026`**
- Change it before going live:

```bash
ADMIN_PASSWORD="YourStrongPassword" SECRET_KEY="random-long-string" python3 app.py
```

Admin can: view all registrations / appointments / grievances, update appointment
status (Pending → Confirmed / Completed / Cancelled), publish & delete notices, and
export any table as CSV.

## 🗂️ Project structure

```
bsc_counselling_portal/
├── app.py               # Flask application + SQLite schema + seed data
├── requirements.txt     # flask (only dependency)
├── counselling.db       # SQLite database (auto-created on first run)
├── templates/           # Jinja2 templates (base, pages, forms, admin)
└── static/
    ├── style.css        # self-contained stylesheet (AMU green & gold theme)
    └── app.js           # mobile nav, flash messages, registration form toggle
```

## ✏️ How to customise

| What | Where |
|---|---|
| Mentor list | `SEED_MENTORS` in `app.py` (delete `counselling.db` afterwards to re-seed) |
| Seed notices | `SEED_NOTICES` in `app.py` — or use the Admin dashboard |
| Time slots / subject combinations / categories | Constants at the top of `app.py` |
| Important dates / seat matrix / FAQ text | The corresponding template in `templates/` |
| College name & session | `inject_globals()` in `app.py` |
| Theme colours | CSS variables (`:root`) at the top of `static/style.css` |

> ⚠️ **Note:** Mentor names, e-mails, helpdesk numbers, dates and the seat matrix
> shipped with this template are **placeholders for illustration**. Replace them
> with official data before actual use.

## 📌 Main routes

| Route | Purpose |
|---|---|
| `/` | Home (tracks, important dates, latest notices) |
| `/academic`, `/admission` | Details of each counselling track |
| `/mentors`, `/schedule` | Mentor directory & weekly counselling schedule |
| `/register?type=academic` / `?type=admission` | Online counselling registration |
| `/appointment` | Book a 30-minute mentor slot (prevents double booking) |
| `/grievance` | Confidential grievance submission |
| `/notices`, `/faq`, `/contact` | Notice board, FAQ, contact & office info |
| `/admin` | Admin dashboard (login at `/admin/login`) |

---

## 🧮 Counselling Data Entry — “Botany Counselling” interface *(Admin only)*

Dark-themed master data-entry screen for B.Sc. Semester V & VI open electives.
The **official catalogue (775 codes: 385 Sem-V + 390 Sem-VI)** is pre-loaded
from `oe_catalog.py` and auto-categorized by the code's type letters:
**MJ · MO · NO · XO · VO→VOC · VA→VAC** (`5P0x`/`6P0x` = practical
components). One row per student; each course cell is a searchable
“CODE — Name” combobox that saves instantly (records are **automatically
separated** into the per-course sheets).

**Tabs:** Main Entry Sheet · VAC V · VOC V · **MO V** · **NO V** · **XO V** ·
**MO VI** · **NO VI** · **XO VI** · VAC VI · VOC VI · Course Code Sheets
(course master, add/update/delete)

**Toolbar:** New Record · New Student · Import Excel · Import CSV · Sample ·
Save · Auto Save · Delete (bulk) · Refresh · live Search · Excel · PDF ·
Print · ZIP · Split Sheets · Backup · Restore

| Route | Purpose |
|---|---|
| `/oec/` | Main Entry Sheet — add students, inline course assignment |
| `/oec/sheet/<slot>` | Auto-separated sheets (`vac_v`, `voc_v`, `vac_vi`, `voc_vi`) with per-course chips |
| `/oec/courses` | Course Code Sheets — the course master (VAC/VOC, Sem V/VI) |
| `/oec/import` | Import `.xlsx` / `.csv` + database **Restore** |
| `/oec/format.xlsx` · `/oec/sample.xlsx` | Blank official format / sample |
| `/oec/export.xlsx` · `export.pdf` · `export.zip` · `split.xlsx` | Downloads: main sheet, PDF table, ZIP of all sheets, course-wise split workbook |
| `/oec/student/<id>.pdf` · `/student/<id>/print` | Per-student counselling slip |
| `/oec/backup.db` · `/oec/restore` | Full database backup / validated restore (keeps a `.bak` safety copy) |

Built-in safeguards: duplicate Enrollment No. rejected · wrong-column course
codes rejected (a VAC-V course can't go in a VOC-V cell) · unknown codes must
first be added in Course Code Sheets · DD-MM-YYYY dates normalized.
