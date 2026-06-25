from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.database import Club, User
from app.api.auth import get_current_user, get_current_club
from pydantic import BaseModel


router = APIRouter()


class ClubCreate(BaseModel):
    name: str


class ClubResponse(BaseModel):
    id: int
    name: str
    subscription_status: str
    subscription_plan: str

    class Config:
        from_attributes = True


@router.post("/", response_model=ClubResponse)
async def create_club(
    club_data: ClubCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if club already exists
    existing_club = db.query(Club).filter(Club.user_id == current_user.id).first()
    if existing_club:
        raise HTTPException(status_code=400, detail="Club already exists for this user")

    new_club = Club(
        user_id=current_user.id,
        name=club_data.name
    )
    db.add(new_club)
    db.commit()
    db.refresh(new_club)

    return new_club


@router.get("/", response_model=ClubResponse)
async def get_my_club(current_club: Club = Depends(get_current_club)):
    return current_club


@router.put("/", response_model=ClubResponse)
async def update_club(
    club_data: ClubCreate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    current_club.name = club_data.name
    db.commit()
    db.refresh(current_club)
    return current_club
