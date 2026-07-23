from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User
from app.auth import get_password_hash, get_user_by_email
from app.routers import auth, patients, dashboard, visits
from app.migrate import run_migrations


def seed_users():
    """Create default dev accounts only when explicitly running in development."""
    db = SessionLocal()
    try:
        defaults = [
            {
                "email": "receptionist@emr.com",
                "full_name": "Receptionist",
                "password": "receptionist123",
                "role": "receptionist",
            },
            {
                "email": "doctor@emr.com",
                "full_name": "Doctor",
                "password": "doctor123",
                "role": "doctor",
            },
        ]
        for entry in defaults:
            if not get_user_by_email(db, entry["email"]):
                db.add(
                    User(
                        email=entry["email"],
                        full_name=entry["full_name"],
                        hashed_password=get_password_hash(entry["password"]),
                        role=entry["role"],
                    )
                )
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)

    if settings.ENVIRONMENT == "development":
        seed_users()

    yield


is_production = settings.ENVIRONMENT == "production"

app = FastAPI(
    title="EMR API",
    description="Electronic Medical Records Management System",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://emr-app-frontend.vercel.app",
        "https://localhost",
        "http://localhost",
        "capacitor://localhost",
        "ionic://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(visits.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/")
def root():
    return {
        "message": "AMAX EMR Backend Running",
        "status": "OK",
    }
