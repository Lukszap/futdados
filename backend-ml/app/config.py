from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database - Supabase
    DATABASE_URL: str
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    # Stripe (opcional para desenvolvimento)
    STRIPE_API_KEY: str = "sk_test_placeholder"
    STRIPE_WEBHOOK_SECRET: str = "whsec_placeholder"
    STRIPE_PRICE_ID_BASIC: str = "price_placeholder"
    STRIPE_PRICE_ID_PRO: str = "price_placeholder"

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
