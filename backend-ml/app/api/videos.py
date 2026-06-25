from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime

from app.database import get_db
from app.models.database import Video, Match
from app.api.auth import get_current_club
from app.config import settings
from pydantic import BaseModel


router = APIRouter()


class VideoResponse(BaseModel):
    id: int
    original_filename: str
    file_path: str
    upload_status: str
    processing_progress: float

    class Config:
        from_attributes = True


def ensure_upload_dirs():
    os.makedirs(settings.VIDEO_UPLOAD_PATH, exist_ok=True)
    os.makedirs(settings.PROCESSED_VIDEO_PATH, exist_ok=True)


def process_video_task(video_id: int, db: Session):
    """Background task to process video with ML pipeline"""
    from app.ml.pipeline import MLPipeline

    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return

    try:
        video.upload_status = "processing"
        video.processing_progress = 0.0
        db.commit()

        # Initialize ML pipeline
        ml_pipeline = MLPipeline()

        # Process video (placeholder - will implement full pipeline)
        # For now, just simulate processing
        import time
        for i in range(0, 101, 10):
            time.sleep(0.5)
            video.processing_progress = float(i)
            db.commit()

        video.upload_status = "processed"
        video.processing_progress = 100.0
        db.commit()

    except Exception as e:
        video.upload_status = "failed"
        db.commit()
        print(f"Error processing video: {e}")


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
        background_tasks.add_task(process_video_task, new_video.id, db)

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
