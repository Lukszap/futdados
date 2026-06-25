from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import json
import time
import uuid
import random

from app.database import get_db, SessionLocal
from app.models.database import Video, Match, Player, PlayerMatchMetrics
from app.api.auth import get_current_club
from app.config import settings
from pydantic import BaseModel


router = APIRouter()


class VideoResponse(BaseModel):
    id: int
    original_filename: str
    file_path: str
    upload_status: str
    processing_progress: Optional[float] = 0.0

    class Config:
        from_attributes = True


def ensure_upload_dirs():
    os.makedirs(settings.VIDEO_UPLOAD_PATH, exist_ok=True)
    os.makedirs(settings.PROCESSED_VIDEO_PATH, exist_ok=True)


def _generate_mock_metrics(player_id: int, match_id: int) -> PlayerMatchMetrics:
    """Generate realistic mock metrics for a player in a match.

    Used while the real ML pipeline (YOLOv8 + ByteTrack) is not installed.
    """
    passes_attempted = random.randint(20, 70)
    passes_completed = random.randint(int(passes_attempted * 0.6), passes_attempted)
    shots_total = random.randint(0, 6)
    shots_on_target = random.randint(0, shots_total)
    dribbles_attempted = random.randint(0, 12)
    dribbles_completed = random.randint(0, dribbles_attempted)
    tackles_attempted = random.randint(0, 15)
    tackles_completed = random.randint(0, tackles_attempted)

    heatmap = [
        {"x": round(random.uniform(0, 1), 3), "y": round(random.uniform(0, 1), 3)}
        for _ in range(20)
    ]

    return PlayerMatchMetrics(
        player_id=player_id,
        match_id=match_id,
        total_distance=round(random.uniform(7000, 12000), 1),
        average_speed=round(random.uniform(6, 9), 2),
        max_speed=round(random.uniform(24, 34), 2),
        sprints_count=random.randint(10, 45),
        passes_attempted=passes_attempted,
        passes_completed=passes_completed,
        pass_success_rate=round(passes_completed / passes_attempted * 100, 1) if passes_attempted else 0.0,
        shots_total=shots_total,
        shots_on_target=shots_on_target,
        dribbles_attempted=dribbles_attempted,
        dribbles_completed=dribbles_completed,
        tackles_attempted=tackles_attempted,
        tackles_completed=tackles_completed,
        average_position_x=round(random.uniform(0, 1), 3),
        average_position_y=round(random.uniform(0, 1), 3),
        time_in_opponent_half=round(random.uniform(600, 3000), 1),
        expected_goals=round(random.uniform(0, 1.5), 3),
        expected_assists=round(random.uniform(0, 1.2), 3),
        heatmap_data=json.dumps(heatmap),
    )


def process_video_task(video_id: int):
    """Background task that simulates the ML pipeline.

    Creates its own DB session because the request-scoped session is closed
    once the upload response is returned.
    """
    db = SessionLocal()
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            return

        video.upload_status = "processing"
        video.processing_progress = 0.0
        db.commit()

        for i in range(10, 101, 10):
            time.sleep(0.6)
            video.processing_progress = float(i)
            db.commit()

        # Generate mock per-player metrics for every player of the club.
        match = db.query(Match).filter(Match.id == video.match_id).first()
        if match:
            players = db.query(Player).filter(Player.club_id == match.club_id).all()
            for player in players:
                existing = db.query(PlayerMatchMetrics).filter(
                    PlayerMatchMetrics.player_id == player.id,
                    PlayerMatchMetrics.match_id == match.id,
                ).first()
                if existing is None:
                    db.add(_generate_mock_metrics(player.id, match.id))
            db.commit()

        video.upload_status = "processed"
        video.processing_progress = 100.0
        db.commit()

    except Exception as e:
        db.rollback()
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.upload_status = "failed"
            db.commit()
        print(f"Error processing video: {e}")
    finally:
        db.close()


@router.post("/upload/{match_id}", response_model=VideoResponse)
async def upload_video(
    match_id: int,
    file: UploadFile = File(...),
    current_club = Depends(get_current_club),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    # Verify match exists and belongs to club
    match = db.query(Match).filter(
        Match.id == match_id,
        Match.club_id == current_club.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    ensure_upload_dirs()

    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.VIDEO_UPLOAD_PATH, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Create video record
    new_video = Video(
        match_id=match_id,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        format=file_extension,
        upload_status="uploaded"
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    # Start background processing
    if background_tasks:
        background_tasks.add_task(process_video_task, new_video.id)

    return new_video


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: int,
    current_club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    video = db.query(Video).join(Match).filter(
        Video.id == video_id,
        Match.club_id == current_club.id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/match/{match_id}", response_model=List[VideoResponse])
async def get_match_videos(
    match_id: int,
    current_club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    # Verify match belongs to club
    match = db.query(Match).filter(
        Match.id == match_id,
        Match.club_id == current_club.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    videos = db.query(Video).filter(Video.match_id == match_id).all()
    return videos
