-- Schema Football Analytics para Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de clubes
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255) UNIQUE,
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de campeonatos
CREATE TABLE IF NOT EXISTS championships (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    year INTEGER,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de jogadores
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    position VARCHAR(50),
    jersey_number INTEGER,
    height DECIMAL(3, 2),
    weight DECIMAL(5, 2),
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de partidas
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    championship_id INTEGER REFERENCES championships(id),
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    match_date TIMESTAMP WITH TIME ZONE,
    venue VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de vídeos
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    duration DECIMAL(10, 2),
    resolution VARCHAR(50),
    format VARCHAR(10),
    upload_status VARCHAR(50) DEFAULT 'uploading',
    processing_progress DECIMAL(5, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de métricas de jogadores por partida
CREATE TABLE IF NOT EXISTS player_match_metrics (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,

    -- Métricas de movimento
    total_distance DECIMAL(10, 2),
    average_speed DECIMAL(5, 2),
    max_speed DECIMAL(5, 2),
    sprints_count INTEGER,

    -- Métricas de ações
    passes_attempted INTEGER,
    passes_completed INTEGER,
    pass_success_rate DECIMAL(5, 2),
    shots_total INTEGER,
    shots_on_target INTEGER,
    dribbles_attempted INTEGER,
    dribbles_completed INTEGER,
    tackles_attempted INTEGER,
    tackles_completed INTEGER,

    -- Métricas de posição
    average_position_x DECIMAL(10, 2),
    average_position_y DECIMAL(10, 2),
    time_in_opponent_half DECIMAL(10, 2),

    -- Métricas avançadas
    expected_goals DECIMAL(5, 2),
    expected_assists DECIMAL(5, 2),
    heatmap_data TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES matches(id) ON DELETE SET NULL,
    report_type VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) DEFAULT 'pending',
    file_path VARCHAR(500),
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clubs_user_id ON clubs(user_id);
CREATE INDEX IF NOT EXISTS idx_players_club_id ON players(club_id);
CREATE INDEX IF NOT EXISTS idx_matches_club_id ON matches(club_id);
CREATE INDEX IF NOT EXISTS idx_matches_championship_id ON matches(championship_id);
CREATE INDEX IF NOT EXISTS idx_videos_match_id ON videos(match_id);
CREATE INDEX IF NOT EXISTS idx_player_metrics_player_id ON player_match_metrics(player_id);
CREATE INDEX IF NOT EXISTS idx_player_metrics_match_id ON player_match_metrics(match_id);
CREATE INDEX IF NOT EXISTS idx_reports_player_id ON reports(player_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_metrics_updated_at BEFORE UPDATE ON player_match_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
