from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.database import Match, Championship, Club, Player, PlayerMatchMetrics
from app.api.auth import get_current_club
from pydantic import BaseModel


router = APIRouter()


class MatchCreate(BaseModel):
    championship_id: int
    home_team: str
    away_team: str
    match_date: datetime
    venue: Optional[str] = None


class MatchUpdate(BaseModel):
    championship_id: Optional[int] = None
    home_team: Optional[str] = None
    away_team: Optional[str] = None
    match_date: Optional[datetime] = None
    venue: Optional[str] = None
    status: Optional[str] = None


class MatchResponse(BaseModel):
    id: int
    championship_id: Optional[int] = None
    championship_name: Optional[str] = None
    home_team: str
    away_team: str
    match_date: Optional[datetime] = None
    venue: Optional[str] = None
    status: str
    videos_count: int = 0

    class Config:
        from_attributes = True


def serialize_match(match: Match) -> MatchResponse:
    return MatchResponse(
        id=match.id,
        championship_id=match.championship_id,
        championship_name=match.championship.name if match.championship else None,
        home_team=match.home_team,
        away_team=match.away_team,
        match_date=match.match_date,
        venue=match.venue,
        status=match.status,
        videos_count=len(match.videos),
    )


class ChampionshipCreate(BaseModel):
    name: str
    year: Optional[int] = None
    category: Optional[str] = None
    is_public: bool = True


class ChampionshipResponse(BaseModel):
    id: int
    name: str
    year: Optional[int] = None
    category: Optional[str] = None
    is_public: bool

    class Config:
        from_attributes = True


@router.post("/championships", response_model=ChampionshipResponse)
async def create_championship(
    championship_data: ChampionshipCreate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    existing = db.query(Championship).filter(Championship.name == championship_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Championship already exists")

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
    return serialize_match(new_match)


@router.get("/", response_model=List[MatchResponse])
async def get_matches(current_club: Club = Depends(get_current_club), db: Session = Depends(get_db)):
    matches = db.query(Match).filter(Match.club_id == current_club.id).all()
    return [serialize_match(m) for m in matches]


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
    return serialize_match(match)


@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: int,
    match_data: MatchUpdate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    match = db.query(Match).filter(
        Match.id == match_id,
        Match.club_id == current_club.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    update_data = match_data.model_dump(exclude_unset=True)

    if "championship_id" in update_data:
        championship = db.query(Championship).filter(
            Championship.id == update_data["championship_id"]
        ).first()
        if not championship:
            raise HTTPException(status_code=404, detail="Championship not found")

    for field, value in update_data.items():
        setattr(match, field, value)

    db.commit()
    db.refresh(match)
    return serialize_match(match)


class PlayerMatchMetricsResponse(BaseModel):
    id: int
    player_id: int
    player_name: Optional[str] = None
    total_distance: Optional[float] = None
    average_speed: Optional[float] = None
    max_speed: Optional[float] = None
    sprints_count: Optional[int] = None
    passes_attempted: Optional[int] = None
    passes_completed: Optional[int] = None
    pass_success_rate: Optional[float] = None
    shots_total: Optional[int] = None
    shots_on_target: Optional[int] = None
    dribbles_attempted: Optional[int] = None
    dribbles_completed: Optional[int] = None
    tackles_attempted: Optional[int] = None
    tackles_completed: Optional[int] = None
    expected_goals: Optional[float] = None
    expected_assists: Optional[float] = None

    class Config:
        from_attributes = True


@router.get("/{match_id}/metrics", response_model=List[PlayerMatchMetricsResponse])
async def get_match_metrics(
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

    rows = (
        db.query(PlayerMatchMetrics, Player.name)
        .join(Player, Player.id == PlayerMatchMetrics.player_id)
        .filter(PlayerMatchMetrics.match_id == match_id)
        .all()
    )
    result = []
    for metrics, player_name in rows:
        item = PlayerMatchMetricsResponse.model_validate(metrics)
        item.player_name = player_name
        result.append(item)
    return result


@router.delete("/{match_id}", status_code=204)
async def delete_match(
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

    db.delete(match)
    db.commit()
    return None
