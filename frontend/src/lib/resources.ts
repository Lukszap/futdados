import api from './api';
import { Player, Match, Championship, Video, PlayerMetrics } from './types';

export interface PlayerInput {
  name: string;
  age?: number;
  position?: string;
  jersey_number?: number;
  height?: number;
  weight?: number;
}

export interface MatchInput {
  championship_id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  venue?: string;
}

export interface ChampionshipInput {
  name: string;
  year?: number;
  category?: string;
}

export const playersApi = {
  list: () => api.get<Player[]>('/api/players/').then((r) => r.data),
  create: (data: PlayerInput) => api.post<Player>('/api/players/', data).then((r) => r.data),
  update: (id: number, data: Partial<PlayerInput>) =>
    api.put<Player>(`/api/players/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/players/${id}`),
};

export const matchesApi = {
  list: () => api.get<Match[]>('/api/matches/').then((r) => r.data),
  create: (data: MatchInput) => api.post<Match>('/api/matches/', data).then((r) => r.data),
  update: (id: number, data: Partial<MatchInput>) =>
    api.put<Match>(`/api/matches/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/matches/${id}`),
  metrics: (id: number) =>
    api.get<PlayerMetrics[]>(`/api/matches/${id}/metrics`).then((r) => r.data),
};

export const championshipsApi = {
  list: () =>
    api.get<Championship[]>('/api/matches/championships').then((r) => r.data),
  create: (data: ChampionshipInput) =>
    api.post<Championship>('/api/matches/championships', data).then((r) => r.data),
};

export const videosApi = {
  listByMatch: (matchId: number) =>
    api.get<Video[]>(`/api/videos/match/${matchId}`).then((r) => r.data),
  get: (id: number) => api.get<Video>(`/api/videos/${id}`).then((r) => r.data),
  upload: (matchId: number, file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<Video>(`/api/videos/upload/${matchId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },
};
