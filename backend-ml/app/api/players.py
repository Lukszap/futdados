from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.database import Player, Club
from app.api.auth import get_current_club
from pydantic import BaseModel


router = APIRouter()


class PlayerCreate(BaseModel):
    name: str
    age: Optional[int] = None
    position: Optional[str] = None
    jersey_number: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    photo_url: Optional[str] = None


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    position: Optional[str] = None
    jersey_number: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    photo_url: Optional[str] = None


class PlayerResponse(BaseModel):
    id: int
    name: str
    age: Optional[int] = None
    position: Optional[str] = None
    jersey_number: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    photo_url: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("/", response_model=PlayerResponse)
async def create_player(
    player_data: PlayerCreate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    new_player = Player(
        club_id=current_club.id,
        **player_data.model_dump()
    )
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    return new_player


@router.get("/", response_model=List[PlayerResponse])
async def get_players(current_club: Club = Depends(get_current_club), db: Session = Depends(get_db)):
    players = db.query(Player).filter(Player.club_id == current_club.id).all()
    return players


@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(
    player_id: int,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    player = db.query(Player).filter(
        Player.id == player_id,
        Player.club_id == current_club.id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: int,
    player_data: PlayerUpdate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    player = db.query(Player).filter(
        Player.id == player_id,
        Player.club_id == current_club.id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    update_data = player_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(player, field, value)

    db.commit()
    db.refresh(player)
    return player


@router.delete("/{player_id}", status_code=204)
async def delete_player(
    player_id: int,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    player = db.query(Player).filter(
        Player.id == player_id,
        Player.club_id == current_club.id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    db.delete(player)
    db.commit()
    return None
