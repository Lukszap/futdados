'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { PlayerRanking, RankingFilters, TalentAlert, PlayerDetails } from '@/lib/types';
import api from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, club, logout, fetchClub } = useAuth();
  const [activeTab, setActiveTab] = useState<'ranking' | 'alerts' | 'history'>('ranking');
  const [ranking, setRanking] = useState<PlayerRanking[]>([]);
  const [alerts, setAlerts] = useState<TalentAlert[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetails | null>(null);
  const [filters, setFilters] = useState<RankingFilters>({
    sort_by: 'rating',
    sort_order: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClub();
    fetchRanking();
    fetchAlerts();
  }, [filters]);

  const fetchRanking = async () => {
    try {
      const response = await api.get('/api/club/ranking', { params: filters });
      setRanking(response.data);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/club/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleFilterChange = (key: keyof RankingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePlayerClick = async (playerId: number) => {
    try {
      const response = await api.get(`/api/club/players/${playerId}`);
      setSelectedPlayer(response.data);
    } catch (error) {
      console.error('Error fetching player details:', error);
    }
  };

  const handleGeneratePDF = async (playerId: number) => {
    try {
      const response = await api.post(`/api/club/players/${playerId}/report`);
      alert('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar relatório');
    }
  };

  const handleMarkAlertAsRead = async (alertId: number) => {
    try {
      await api.put(`/api/club/alerts/${alertId}/read`);
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const unreadAlertsCount = alerts.filter(a => !a.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Football Analytics
              </h1>
              <p className="text-sm text-gray-600">
                {club?.name || 'Clube não configurado'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="secondary" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        {club && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold mb-1">Plano {club.subscription_plan}</h2>
                <p className="text-sm opacity-90">
                  Status: {club.subscription_status}
                  {club.subscription_end_date && ` • Vence em: ${new Date(club.subscription_end_date).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Acesso completo a:</p>
                <p className="font-medium">Ranking • Métricas • Heatmaps • Alertas</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'ranking'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ranking
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg font-medium relative ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Alertas
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadAlertsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Ranking Tab */}
        {activeTab === 'ranking' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campeonato
                  </label>
                  <select
                    value={filters.championship_id || ''}
                    onChange={(e) => handleFilterChange('championship_id', e.target.value || undefined)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Todos</option>
                    <option value="1">Campeonato Regional 2024</option>
                    <option value="2">Copa Juvenil 2024</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Todas</option>
                    <option value="sub-13">Sub-13</option>
                    <option value="sub-15">Sub-15</option>
                    <option value="sub-17">Sub-17</option>
                    <option value="sub-20">Sub-20</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posição
                  </label>
                  <select
                    value={filters.position || ''}
                    onChange={(e) => handleFilterChange('position', e.target.value || undefined)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Todas</option>
                    <option value="goalkeeper">Goleiro</option>
                    <option value="defender">Defensor</option>
                    <option value="midfielder">Meio-campista</option>
                    <option value="forward">Atacante</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="rating">Rating</option>
                    <option value="goals">Gols</option>
                    <option value="assists">Assists</option>
                    <option value="passes">Passes</option>
                    <option value="duels">Duelos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-xl font-semibold">Ranking Dinâmico</h3>
                <p className="text-sm text-gray-600">Atualizado conforme vídeos são processados</p>
              </div>
              <div className="p-6">
                {ranking.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum dado disponível no momento
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">#</th>
                          <th className="text-left py-3 px-4">Jogador</th>
                          <th className="text-left py-3 px-4">Posição</th>
                          <th className="text-left py-3 px-4">Categoria</th>
                          <th className="text-left py-3 px-4">Rating</th>
                          <th className="text-left py-3 px-4">Gols</th>
                          <th className="text-left py-3 px-4">Assists</th>
                          <th className="text-left py-3 px-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((player) => (
                          <tr
                            key={player.player_id}
                            className="border-b hover:bg-gray-50 cursor-pointer"
                            onClick={() => handlePlayerClick(player.player_id)}
                          >
                            <td className="py-3 px-4 font-bold">{player.rank}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {player.photo_url && (
                                  <img
                                    src={player.photo_url}
                                    alt={player.player_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{player.player_name}</div>
                                  <div className="text-sm text-gray-500">{player.club_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">{player.position || '-'}</td>
                            <td className="py-3 px-4">{player.category || '-'}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-blue-600">
                                {player.stats.rating?.toFixed(1) || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{player.stats.goals || 0}</td>
                            <td className="py-3 px-4">{player.stats.assists || 0}</td>
                            <td className="py-3 px-4">
                              <Button size="sm" onClick={(e) => {
                                e.stopPropagation();
                                handlePlayerClick(player.player_id);
                              }}>
                                Ver Detalhes
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold">Alertas de Novos Talentos</h3>
              <p className="text-sm text-gray-600">Jogadores que se destacaram recentemente</p>
            </div>
            <div className="p-6">
              {alerts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum alerta no momento
                </p>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-4 ${!alert.is_read ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{alert.player_name}</span>
                            {!alert.is_read && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Novo</span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{alert.message}</p>
                          <div className="flex gap-4 text-sm">
                            {alert.metrics.goals !== undefined && (
                              <span>⚽ {alert.metrics.goals} gols</span>
                            )}
                            {alert.metrics.rating !== undefined && (
                              <span>⭐ Rating: {alert.metrics.rating.toFixed(1)}</span>
                            )}
                            {alert.metrics.percentile !== undefined && (
                              <span>📊 Top {alert.metrics.percentile}%</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!alert.is_read && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleMarkAlertAsRead(alert.id)}
                            >
                              Marcar como lido
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handlePlayerClick(alert.player_id)}
                          >
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Histórico de Campanhas</h3>
            <p className="text-gray-500 text-center py-8">
              Histórico de campanhas será implementado com filtros por período e campeonato
            </p>
          </div>
        )}

        {/* Player Details Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold">Detalhes do Jogador</h3>
                <Button variant="secondary" onClick={() => setSelectedPlayer(null)}>
                  Fechar
                </Button>
              </div>
              <div className="p-6">
                {/* Player Header */}
                <div className="flex items-center gap-6 mb-6">
                  {selectedPlayer.photo_url && (
                    <img
                      src={selectedPlayer.photo_url}
                      alt={selectedPlayer.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
                    <p className="text-gray-600">
                      {selectedPlayer.position} • {selectedPlayer.age} anos • Nº {selectedPlayer.jersey_number}
                    </p>
                  </div>
                </div>

                {/* Career Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-600">Partidas</div>
                    <div className="text-2xl font-bold">{selectedPlayer.career_stats.total_matches}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-600">Gols</div>
                    <div className="text-2xl font-bold">{selectedPlayer.career_stats.total_goals}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-600">Assists</div>
                    <div className="text-2xl font-bold">{selectedPlayer.career_stats.total_assists}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-600">Rating Médio</div>
                    <div className="text-2xl font-bold">{selectedPlayer.career_stats.average_rating.toFixed(1)}</div>
                  </div>
                </div>

                {/* Heatmap */}
                {selectedPlayer.heatmap_url && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Heatmap</h4>
                    <img
                      src={selectedPlayer.heatmap_url}
                      alt="Heatmap"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Comparison vs Category */}
                {selectedPlayer.comparison_vs_category && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-4">Comparação vs Média da Categoria</h4>
                    <div className="space-y-3">
                      {selectedPlayer.comparison_vs_category.map((comp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{comp.metric}</span>
                            <span>
                              {comp.player_value.toFixed(1)} vs {comp.category_average.toFixed(1)} (média)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${comp.percentile}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Top {comp.percentile}% da categoria</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Clips */}
                {selectedPlayer.video_clips && selectedPlayer.video_clips.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-4">Clipes Destacados</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPlayer.video_clips.map((clip) => (
                        <div key={clip.id} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">{clip.title}</h5>
                          {clip.description && (
                            <p className="text-sm text-gray-600 mb-2">{clip.description}</p>
                          )}
                          <video
                            src={clip.video_url}
                            controls
                            className="w-full rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleGeneratePDF(selectedPlayer.id)}
                    className="flex-1"
                  >
                    Gerar Relatório PDF
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedPlayer(null)}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
