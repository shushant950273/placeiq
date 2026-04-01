# PlaceIQ — Campus Placement Intelligence Platform

A full-stack Campus Placement Management System built with **Django REST Framework** (backend) and **React + Vite + Tailwind CSS** (frontend).

---

## 📁 Project Structure

```
project sp/
├── campushire/          ← Django Backend
│   ├── accounts/        ← User auth, TPO & Company profile APIs
│   ├── students/        ← Student profile, readiness score, bulk upload
│   ├── companies/       ← Company model & profile
│   ├── drives/          ← Placement drive CRUD + status update
│   ├── applications/    ← Drive applications, shortlisting, pipeline
│   ├── experiences/     ← Anonymous interview experience feed
│   ├── notifications/   ← Signal-based notification system
│   ├── analytics/       ← TPO dashboard analytics + NAAC PDF report
│   ├── offers/          ← Offer letter management
│   ├── campushire/      ← Django project settings & URLs
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3       ← SQLite database (auto-created)
│
└── placeiq-frontend/    ← React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Auth/       ← Login, Register
    │   │   ├── Student/    ← Dashboard, Drives, DriveDetail, Applications, Profile, Experiences
    │   │   ├── TPO/        ← Dashboard, DrivesList, DriveCreate, Shortlist, Students, Experiences, Profile
    │   │   └── Company/    ← Dashboard, DrivesList, Profile
    │   ├── components/     ← Layout, Sidebar, Badge, Toast, DriveCard, etc.
    │   ├── context/        ← AuthContext (JWT management)
    │   ├── api/            ← Axios instance (auto-attaches JWT)
    │   └── App.jsx         ← All routes
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 👥 User Roles

| Role | Login redirects to | Capabilities |
|---|---|---|
| **Student** | `/student/dashboard` | Browse drives, apply, track applications, view experiences |
| **TPO** | `/tpo/dashboard` | Create drives, manage applicants, shortlist, approve experiences, view analytics |
| **Company** | `/company/dashboard` | View drives posted for their company, see applicant counts |

---

## ⚙️ Prerequisites

Make sure these are installed on your system:

- **Python** `3.10+` — [python.org](https://www.python.org/downloads/)
- **Node.js** `18+` + **npm** — [nodejs.org](https://nodejs.org/)
- **Git** (optional but recommended)

---

## 🚀 Setup — Backend (Django)

### 1. Navigate to the backend folder

```bash
cd campushire
```

### 2. Create a virtual environment

```bash
# Windows
python -m venv venv

# Mac / Linux
python3 -m venv venv
```

### ### 3. Activate the virtual environment

```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# Mac / Linux
source venv/bin/activate
```

> You should see `(venv)` at the start of your terminal prompt.

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5. Apply database migrations

```bash
python manage.py migrate
```

### 6. (Optional) Create a superuser for Django Admin

```bash
python manage.py createsuperuser
```
> Follow the prompts. Use `role` = `tpo` if asked.

### 7. Start the backend server

```bash
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

> Django Admin panel available at: http://localhost:8000/admin/

---

## 🎨 Setup — Frontend (React + Vite)

Open a **new terminal** (keep the backend running in the first one).

### 1. Navigate to the frontend folder

```bash
cd placeiq-frontend
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Start the frontend dev server

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 First Time: Register Users

Go to **http://localhost:5173/register** and create accounts for each role:

| Role | Required Fields |
|---|---|
| **Student** | Name, Email, Password, Role = Student |
| **TPO** | Name, Email, Password, Role = TPO, College Name |
| **Company** | Name, Email, Password, Role = Company |

> ⚠️ For drive matching to work: **Company account Name** must exactly match what TPO types in the "Company Name" field when creating a drive (case-insensitive).

---

## 📋 Key API Endpoints

| Method | Endpoint | Who | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | Anyone | Register new user |
| POST | `/api/auth/login/` | Anyone | Login → returns JWT tokens |
| GET | `/api/auth/me/` | Auth | Get current user info |
| GET/PUT | `/api/auth/tpo/profile/` | TPO | TPO profile |
| GET/PUT | `/api/auth/company/profile/` | Company | Company profile |
| GET/PUT | `/api/student/profile/` | Student | Student profile |
| GET | `/api/student/profile-score/` | Student | Profile completeness score |
| GET | `/api/student/list/` | TPO | All students list (with `?search=`) |
| POST | `/api/student/bulk-upload/` | TPO | Upload students via CSV |
| GET | `/api/student/readiness/<drive_id>/` | Student | AI readiness score for a drive |
| GET/POST | `/api/drives/` | All | List drives / TPO creates drive |
| PATCH | `/api/drives/<id>/status/` | TPO | Update drive status |
| POST | `/api/drives/<id>/apply/` | Student | Apply to drive |
| GET | `/api/drives/<id>/applicants/` | TPO | List applicants for a drive |
| POST | `/api/drives/<id>/shortlist/` | TPO | Shortlist students |
| GET | `/api/student/applications/` | Student | My applications |
| GET | `/api/student/pipeline/` | Student | Application pipeline tracker |
| GET | `/api/experiences/feed/` | Student | Approved interview experiences |
| POST | `/api/experiences/` | Student | Submit experience (requires application) |
| GET | `/api/experiences/pending/` | TPO | Experiences awaiting approval |
| PUT | `/api/experiences/<id>/approve/` | TPO | Approve experience |
| GET | `/api/analytics/dashboard/` | TPO | Placement analytics |
| GET | `/api/analytics/naac-report/` | TPO | Download NAAC PDF report |
| GET | `/api/notifications/` | Auth | Get user notifications |

---

## 📄 CSV Upload Format (Bulk Students)

The TPO can upload a CSV to create student accounts in bulk.

**Required columns (header row must match exactly):**

```
email,name,usn,branch,semester,gpa,backlogs
```

**Example:**
```csv
email,name,usn,branch,semester,gpa,backlogs
alice@college.edu,Alice Sharma,1RV21CS001,CSE,6,8.5,0
bob@college.edu,Bob Mehta,1RV21IS002,ISE,6,7.2,1
carol@college.edu,Carol Nair,1RV21EC003,ECE,6,6.8,0
```

> Default password for each student = their **USN**. Students should change it after first login.

---

## 🔄 Typical Workflow

```
1. TPO registers → logs in
2. TPO creates a Placement Drive (enters company name, role, GPA cutoff, date)
3. Students register → browse eligible drives → apply
4. TPO views applicants → shortlists students
5. Company logs in → sees drives posted for them → views applicant count
6. TPO declares round results
7. Placed students submit anonymous interview experiences
8. TPO approves experiences → visible to all students
9. TPO downloads NAAC report PDF
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Database | SQLite (dev) |
| PDF Generation | ReportLab |
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router v7 |

---

## 🐛 Common Issues & Fixes

### `ModuleNotFoundError: No module named 'X'`
```bash
pip install -r requirements.txt
```

### `CORS error` in browser
Make sure the backend is running on port `8000` and frontend on `5173`. Check `settings.py`:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

### `401 Unauthorized` on API calls
JWT token may have expired (lifetime: 60 min). Log out and log back in.

### `Migrations not applied` error
```bash
python manage.py makemigrations
python manage.py migrate
```

### PowerShell script execution error (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then retry activating venv.

### Frontend shows blank / white page
Make sure `npm install` was run and `npm run dev` is running.

---

## 📌 Environment Notes

- No `.env` file is required for local development — everything uses defaults.
- `DEBUG=True` and `ALLOWED_HOSTS=['*']` is set for development only.
- Database is `db.sqlite3` — auto-created on first `migrate`. Do **not** commit it to Git.
- JWT access token lifetime: **60 minutes**. Refresh token: **1 day**.

---

## 🤝 Contributing / Sharing

1. Share the entire `project sp/` folder (zip it)
2. Recipient follows this README from **Prerequisites** onwards
3. They do **not** need to copy the `venv/` folder — they create their own
4. The `db.sqlite3` can be included (has your test data) or excluded (fresh start)

---

*Built with ❤️ using Django + React | PlaceIQ — Campus Placement Intelligence Platform*
