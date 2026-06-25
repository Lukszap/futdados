export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
}

export interface Club {
  id: number;
  name: string;
  subscription_status: string;
  subscription_plan: string;
  subscription_end_date?: string;
}

export interface Player {
  id: number;
  name: string;
  age?: number;
  position?: string;
  jersey_number?: number;
  height?: number;
  weight?: number;
  photo_url?: string;
}

export interface Championship {
  id: number;
  name: string;
  year?: number;
  category?: string;
  is_public: boolean;
}

export interface Match {
  id: number;
  championship_id?: number;
  championship_name?: string;
  home_team: string;
  away_team: string;
  match_date?: string;
  venue?: string;
  status: string;
  videos_count?: number;
}

export interface Video {
  id: number;
  original_filename: string;
  file_path: string;
  upload_status: string;
  processing_progress?: number;
}

export interface PlayerMetrics {
  id: number;
  player_id: number;
  player_name?: string;
  match_id?: number;
  total_distance?: number;
  average_speed?: number;
  max_speed?: number;
  sprints_count?: number;
  passes_attempted?: number;
  passes_completed?: number;
  pass_success_rate?: number;
  shots_total?: number;
  shots_on_target?: number;
  dribbles_attempted?: number;
  dribbles_completed?: number;
  tackles_attempted?: number;
  tackles_completed?: number;
  expected_goals?: number;
  expected_assists?: number;
}

export interface Report {
  id: number;
  player_id: number;
  match_id?: number;
  report_type: string;
  status: string;
  price: number;
  file_path?: string;
}

// Tipos para o fluxo de Upload e Processamento
export type UploadStatus = 'uploading' | 'uploaded' | 'processing' | 'analyzing' | 'validating' | 'published' | 'failed';

export interface VideoUpload {
  id: number;
  original_filename: string;
  file_path: string;
  file_size?: number;
  upload_status: UploadStatus;
  processing_progress?: number;
  uploaded_at: string;
  championship_id?: number;
  championship_name?: string;
  error_message?: string;
}

export interface ProcessingQueue {
  videos: VideoUpload[];
  total_count: number;
  processing_count: number;
  completed_count: number;
  failed_count: number;
}

// Tipos para Ranking Público
export interface PlayerRanking {
  rank: number;
  player_id: number;
  player_name: string;
  position?: string;
  age?: number;
  category?: string;
  championship_name?: string;
  club_name?: string;
  stats: {
    goals?: number;
    assists?: number;
    passes_completed?: number;
    pass_success_rate?: number;
    duels_won?: number;
    duels_total?: number;
    tackles_won?: number;
    distance_covered?: number;
    average_speed?: number;
    rating?: number;
  };
  photo_url?: string;
}

export interface RankingFilters {
  championship_id?: number;
  category?: string;
  position?: string;
  age_min?: number;
  age_max?: number;
  sort_by?: 'rating' | 'goals' | 'assists' | 'passes' | 'duels';
  sort_order?: 'asc' | 'desc';
}

// Tipos para Detalhes de Jogador (Dashboard Clube)
export interface PlayerDetails extends Player {
  career_stats: {
    total_matches: number;
    total_goals: number;
    total_assists: number;
    total_distance: number;
    average_rating: number;
  };
  recent_metrics: PlayerMetrics[];
  heatmap_url?: string;
  video_clips?: VideoClip[];
  comparison_vs_category?: {
    metric: string;
    player_value: number;
    category_average: number;
    percentile: number;
  }[];
}

export interface VideoClip {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  timestamp_start: number;
  timestamp_end: number;
  thumbnail_url?: string;
  created_at: string;
}

// Tipos para Alertas de Talentos
export interface TalentAlert {
  id: number;
  player_id: number;
  player_name: string;
  alert_type: 'new_talent' | 'breakout_performance' | 'consistent_performer';
  message: string;
  metrics: {
    goals?: number;
    rating?: number;
    percentile?: number;
  };
  created_at: string;
  is_read: boolean;
}

// Tipos para Validação (Admin)
export interface VideoValidation {
  video_id: number;
  extracted_data: {
    players_detected: number;
    total_frames: number;
    tracking_quality: number;
  };
  player_stats: Array<{
    player_id?: number;
    detected_name?: string;
    goals: number;
    assists: number;
    passes: number;
    rating: number;
  }>;
  requires_manual_review: boolean;
  issues?: string[];
}
