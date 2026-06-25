from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class SubscriptionStatus(enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    TRIAL = "trial"


class SubscriptionPlan(enum.Enum):
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    user_type = Column(String, default='individual')  # 'individual' or 'club'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    club = relationship("Club", back_populates="user", uselist=False)


class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    stripe_customer_id = Column(String, unique=True)
    subscription_status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.TRIAL)
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.BASIC)
    subscription_end_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="club")
    players = relationship("Player", back_populates="club")
    matches = relationship("Match", back_populates="club")


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    name = Column(String, nullable=False)
    age = Column(Integer)
    position = Column(String)  # goalkeeper, defender, midfielder, forward
    jersey_number = Column(Integer)
    height = Column(Float)  # em metros
    weight = Column(Float)  # em kg
    photo_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    club = relationship("Club", back_populates="players")
    match_metrics = relationship("PlayerMatchMetrics", back_populates="player")


class Championship(Base):
    __tablename__ = "championships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    year = Column(Integer)
    category = Column(String)  # sub-20, sub-17, profissional
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    championship_id = Column(Integer, ForeignKey("championships.id"))
    home_team = Column(String, nullable=False)
    away_team = Column(String, nullable=False)
    match_date = Column(DateTime(timezone=True))
    venue = Column(String)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    club = relationship("Club", back_populates="matches")
    championship = relationship("Championship")
    videos = relationship("Video", back_populates="match")
    player_metrics = relationship("PlayerMatchMetrics", back_populates="match")


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    duration = Column(Float)  # em segundos
    resolution = Column(String)  # 1920x1080
    format = Column(String)  # mp4, avi
    upload_status = Column(String, default="uploading")  # uploading, uploaded, processing, processed, failed
    processing_progress = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    match = relationship("Match", back_populates="videos")


class PlayerMatchMetrics(Base):
    __tablename__ = "player_match_metrics"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    match_id = Column(Integer, ForeignKey("matches.id"))

    # Métricas de movimento
    total_distance = Column(Float)  # em metros
    average_speed = Column(Float)  # km/h
    max_speed = Column(Float)  # km/h
    sprints_count = Column(Integer)

    # Métricas de ações
    passes_attempted = Column(Integer)
    passes_completed = Column(Integer)
    pass_success_rate = Column(Float)
    shots_total = Column(Integer)
    shots_on_target = Column(Integer)
    dribbles_attempted = Column(Integer)
    dribbles_completed = Column(Integer)
    tackles_attempted = Column(Integer)
    tackles_completed = Column(Integer)

    # Métricas de posição
    average_position_x = Column(Float)  # coordenada média X
    average_position_y = Column(Float)  # coordenada média Y
    time_in_opponent_half = Column(Float)  # em segundos

    # Métricas avançadas
    expected_goals = Column(Float)  # xG
    expected_assists = Column(Float)  # xA
    heatmap_data = Column(Text)  # JSON com dados do heatmap

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    player = relationship("Player", back_populates="match_metrics")
    match = relationship("Match", back_populates="player_metrics")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)  # null se for relatório de carreira
    report_type = Column(String)  # match, career, comparison
    stripe_payment_intent_id = Column(String, unique=True)
    price = Column(Float)
    currency = Column(String, default="BRL")
    status = Column(String, default="pending")  # pending, paid, generating, completed, failed
    file_path = Column(String)
    generated_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
