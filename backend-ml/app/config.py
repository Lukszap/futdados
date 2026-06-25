from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    # Stripe
    STRIPE_API_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PRICE_ID_BASIC: str
    STRIPE_PRICE_ID_PRO: str

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # ML Models
    YOLO_MODEL_PATH: str = "models/yolov8x.pt"
    BYTETRACK_MODEL_PATH: str = "models/bytetrack.pth"

    # Storage
    VIDEO_UPLOAD_PATH: str = "./uploads"
    PROCESSED_VIDEO_PATH: str = "./processed"
    REPORTS_PATH: str = "./reports"

    @property
    def cors_origins_list(self) -> List[str]:
        return self.CORS_ORIGINS.split(",")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
