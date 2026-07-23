# ArthoMax EMR

**ArthoMax EMR** is a full-stack Electronic Medical Records platform for clinics. It provides role-based access for doctors and receptionists, patient record management, appointment workflows, clinical search, and a cross-platform experience on web and Android.

---

## Project Overview

ArthoMax EMR centralizes clinic operations in one secure system:

- Doctors manage schedules, patient visits, and clinical records
- Receptionists handle patient registration, appointments, and front-desk workflows
- A FastAPI backend exposes REST APIs secured with JWT authentication
- A React frontend delivers the web experience
- Capacitor wraps the web app for native Android deployment

---

## Key Features

- **Role-based dashboards** — separate views for doctors and receptionists
- **Patient management** — create, update, and search patient records
- **Appointment & visit tracking** — schedule and follow-up workflows
- **Clinical search** — fast lookup across patient data
- **JWT-secured API** — authenticated access to all protected routes
- **Cross-platform** — web (Vercel) + Android (Capacitor)
- **Cloud-ready** — deployable to Render (backend) and Vercel (frontend)

---

## Screenshots

| Login | Dashboard |
|-------|-----------|
| _Add screenshot: `docs/screenshots/login.png`_ | _Add screenshot: `docs/screenshots/dashboard.png`_ |

| Patients | Clinical Search |
|----------|-----------------|
| _Add screenshot: `docs/screenshots/patients.png`_ | _Add screenshot: `docs/screenshots/clinical-search.png`_ |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, React Router, Axios, Lucide React |
| **Mobile** | Capacitor, Android Studio |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL (Supabase / local Docker) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **Deployment** | Render (API), Vercel (web), Supabase (database) |

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  React Web / Android │────▶│   FastAPI Backend   │
│  (Vercel / Capacitor)│ JWT │   (Render)          │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  PostgreSQL         │
                            │  (Supabase / Docker)│
                            └─────────────────────┘
```

**Flow:**
1. User authenticates via `/api/auth/login`
2. Frontend stores JWT and attaches it to API requests
3. Backend validates token and enforces role-based access
4. Patient and dashboard data is served from PostgreSQL

---

## Installation

### Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- **PostgreSQL** 16+ (or Docker)
- **Android Studio** (for mobile builds only)

### Clone the repository

```bash
git clone https://github.com/nayakanusha9/EMR_App.git
cd EMR_App
```

### Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database URL and a strong SECRET_KEY
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if your API URL differs from localhost
```

---

## Running Backend

### Local (development)

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000`  
Health check: `GET /api/health`  
API docs (development only): `http://localhost:8000/docs`

### Docker Compose (full stack)

```bash
docker-compose up
```

This starts PostgreSQL, backend (`:8000`), and frontend dev server (`:5173`).

> **Note:** Default dev accounts are seeded only when `ENVIRONMENT=development`.

---

## Running Frontend

### Development

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`

### Production build

```bash
cd frontend
npm run build
npm run preview
```

Set `VITE_API_URL` in your deployment environment before building for production.

---

## Deployment

### Backend — Render

1. Create a **Web Service** pointing to the `backend/` directory
2. Set environment variables:
   - `ENVIRONMENT=production`
   - `DATABASE_URL=postgresql://...` (your Supabase or Postgres URL)
   - `SECRET_KEY=<long-random-secret>`
   - `ALLOW_REGISTRATION=false`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend — Vercel

1. Import the repository and set root directory to `frontend/`
2. Set environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
3. Build command: `npm run build`
4. Output directory: `dist`

### Database — Supabase

1. Create a PostgreSQL project on Supabase
2. Copy the connection string into `DATABASE_URL`
3. Ensure SSL/m pooling settings match your deployment

---

## Mobile Application (Capacitor Android)

### Build web assets

```bash
cd frontend
npm run build
npx cap sync android
```

### Open in Android Studio

```bash
npx cap open android
```

Build and run on a device or emulator from Android Studio.

> The Android app loads the production web build inside a native WebView. Ensure `VITE_API_URL` points to your deployed backend before building.

---

## Folder Structure

```
EMR_App/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── config.py         # Settings & environment
│   │   ├── auth.py           # JWT & password utilities
│   │   ├── database.py       # SQLAlchemy engine
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   └── routers/          # API route handlers
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route pages (Login, Dashboard, Patients, etc.)
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # Auth context
│   │   └── services/         # API client
│   ├── android/              # Capacitor Android project
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `ENVIRONMENT` | `development` or `production` | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | JWT signing secret (required in production) | `your-long-random-secret` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `480` |
| `ALLOW_REGISTRATION` | Allow public `/register` endpoint | `false` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

---

## Security Notes

- Never commit `.env` files or real credentials
- Set a strong `SECRET_KEY` in production
- Keep `ALLOW_REGISTRATION=false` in production unless you have a controlled onboarding flow
- Default dev seed accounts are created **only** when `ENVIRONMENT=development`
- Rotate any credentials that were ever exposed in git history

---

## Future Enhancements

- [ ] Admin panel for user management
- [ ] Email-based password reset
- [ ] Audit logging for record access
- [ ] Offline support for mobile
- [ ] Automated test suite (backend + frontend)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Role-based fine-grained permissions

---

## License

This project is provided for portfolio and educational purposes.  
Specify your license here before public distribution (e.g. MIT, Apache 2.0).

---

## Author

**Anusha Nayak**  
[GitHub](https://github.com/nayakanusha9) · [LinkedIn](https://www.linkedin.com/in/anushanayak09)
