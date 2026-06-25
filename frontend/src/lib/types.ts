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
