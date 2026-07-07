from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    get_user_by_email,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas import ALLOWED_ROLES, PasswordUpdate, ProfileUpdate, Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Annotated[Session, Depends(get_db)]):
    if user_data.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Role must be receptionist or doctor")
    if get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account role is not permitted",
        )
    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    updates = data.model_dump(exclude_unset=True)
    if "email" in updates and updates["email"] != current_user.email:
        existing = get_user_by_email(db, updates["email"])
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
    for key, value in updates.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(
    data: PasswordUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
