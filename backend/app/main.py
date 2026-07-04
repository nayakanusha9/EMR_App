from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text

from app.database import Base, SessionLocal, engine
from app.models import User
from app.auth import get_password_hash, get_user_by_email
from app.routers import auth, patients, dashboard


def seed_users():
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


# def reset_schema():
#     with engine.connect() as conn:
#         conn.execute(text("DROP SCHEMA public CASCADE"))
#         conn.execute(text("CREATE SCHEMA public"))
#         conn.commit()
#     Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_users()
    yield


app = FastAPI(
    title="EMR API",
    description="Electronic Medical Records Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
