from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.api import auth, videos, clubs, players, matches, reports, subscriptions
from app.database import engine, Base
from app.ml.pipeline import MLPipeline


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Base.metadata.create_all(bind=engine)  # Tabelas criadas manualmente no Supabase
    ml_pipeline = MLPipeline()
    app.state.ml_pipeline = ml_pipeline
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Football Analytics API",
    description="API para análise de vídeos de futebol com IA",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(clubs.router, prefix="/api/clubs", tags=["Clubs"])
app.include_router(players.router, prefix="/api/players", tags=["Players"])
app.include_router(matches.router, prefix="/api/matches", tags=["Matches"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])


@app.get("/")
async def root():
    return {"message": "Football Analytics API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
