from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.database import Match, Championship, Club
from app.api.auth import get_current_club
from pydantic import BaseModel


router = APIRouter()


class MatchCreate(BaseModel):
    championship_id: int
    home_team: str
    away_team: str
    match_date: datetime
    venue: str = None


class MatchResponse(BaseModel):
    id: int
    home_team: str
    away_team: str
    match_date: datetime
    venue: str
    status: str

    class Config:
        from_attributes = True


class ChampionshipCreate(BaseModel):
    name: str
    year: int
    category: str = None
    is_public: bool = True


class ChampionshipResponse(BaseModel):
    id: int
    name: str
    year: int
    category: str
    is_public: bool

    class Config:
        from_attributes = True


@router.post("/championships", response_model=ChampionshipResponse)
async def create_championship(
    championship_data: ChampionshipCreate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    new_championship = Championship(**championship_data.model_dump())
    db.add(new_championship)
    db.commit()
    db.refresh(new_championship)
    return new_championship


@router.get("/championships", response_model=List[ChampionshipResponse])
async def get_championships(db: Session = Depends(get_db)):
    championships = db.query(Championship).all()
    return championships


@router.post("/", response_model=MatchResponse)
async def create_match(
    match_data: MatchCreate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    # Verify championship exists
    championship = db.query(Championship).filter(Championship.id == match_data.championship_id).first()
    if not championship:
        raise HTTPException(status_code=404, detail="Championship not found")

    new_match = Match(
        club_id=current_club.id,
        **match_data.model_dump()
    )
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    return new_match


@router.get("/", response_model=List[MatchResponse])
async def get_matches(current_club: Club = Depends(get_current_club), db: Session = Depends(get_db)):
    matches = db.query(Match).filter(Match.club_id == current_club.id).all()
    return matches


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: int,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    match = db.query(Match).filter(
        Match.id == match_id,
        Match.club_id == current_club.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match
