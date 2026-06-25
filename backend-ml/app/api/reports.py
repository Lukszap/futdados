from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from app.database import get_db
from app.models.database import Report, Player, Match
from app.api.auth import get_current_club
from app.config import settings
from pydantic import BaseModel


router = APIRouter()


class ReportCreate(BaseModel):
    player_id: int
    match_id: int = None
    report_type: str = "match"


class ReportResponse(BaseModel):
    id: int
    player_id: int
    report_type: str
    status: str
    price: float

    class Config:
        from_attributes = True


@router.post("/", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    current_club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    # Verify player exists and belongs to club
    player = db.query(Player).filter(
        Player.id == report_data.player_id,
        Player.club_id == current_club.id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # If match_id provided, verify it exists
    if report_data.match_id:
        match = db.query(Match).filter(Match.id == report_data.match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

    # Create report record (pending payment)
    new_report = Report(
        player_id=report_data.player_id,
        match_id=report_data.match_id,
        report_type=report_data.report_type,
        price=200.00,  # Fixed price for now
        currency="BRL",
        status="pending"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


@router.get("/", response_model=List[ReportResponse])
async def get_reports(current_club = Depends(get_current_club), db: Session = Depends(get_db)):
    reports = db.query(Report).join(Player).filter(
        Player.club_id == current_club.id
    ).all()
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    current_club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    report = db.query(Report).join(Player).filter(
        Report.id == report_id,
        Player.club_id == current_club.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/{report_id}/purchase")
async def purchase_report(
    report_id: int,
    current_club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    """Placeholder for Stripe payment integration"""
    report = db.query(Report).join(Player).filter(
        Report.id == report_id,
        Player.club_id == current_club.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # TODO: Integrate Stripe payment here
    # For now, just mark as paid
    report.status = "paid"
    db.commit()

    return {"message": "Payment successful", "report_id": report_id}
