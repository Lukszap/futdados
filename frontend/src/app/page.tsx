'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayerRanking, RankingFilters } from '@/lib/types';

export default function Home() {
  const [ranking, setRanking] = useState<PlayerRanking[]>([]);
  const [filters, setFilters] = useState<RankingFilters>({
    sort_by: 'rating',
    sort_order: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch ranking from API when available
    // const fetchRanking = async () => {
    //   const response = await fetch(`/api/public/ranking?${new URLSearchParams(filters as any)}`);
    //   const data = await response.json();
    //   setRanking(data);
    //   setIsLoading(false);
    // };
    // fetchRanking();
    setIsLoading(false);
  }, [filters]);

  const handleFilterChange = (key: keyof RankingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const shareOnWhatsApp = (player: PlayerRanking) => {
    const text = `🏆 Ranking Football Analytics\n\n${player.rank}º - ${player.player_name}\n⚽ Gols: ${player.stats.goals || 0}\n🎯 Rating: ${player.stats.rating?.toFixed(1) || '-'}\n\nVeja o ranking completo em football-analytics.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Football Analytics
            </h1>
            <div className="flex gap-4">
              <Link href="/login">
                <button className="px-4 py-2 text-gray-700 hover:text-gray-900">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Cadastre-se
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ranking Público de Talentos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra os melhores jogadores de campeonatos regionais com análise de IA
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
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
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Top Jogadores
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('sort_order', 'asc')}
                className={`px-3 py-1 rounded ${filters.sort_order === 'asc' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                ↑
              </button>
              <button
                onClick={() => handleFilterChange('sort_order', 'desc')}
                className={`px-3 py-1 rounded ${filters.sort_order === 'desc' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                ↓
              </button>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <p className="text-center text-gray-500">Carregando ranking...</p>
            ) : ranking.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Nenhum dado disponível no momento
                </p>
                <p className="text-sm text-gray-400">
                  Os dados serão atualizados conforme vídeos são processados
                </p>
              </div>
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
                      <tr key={player.player_id} className="border-b hover:bg-gray-50">
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
                          <button
                            onClick={() => shareOnWhatsApp(player)}
                            className="text-green-600 hover:text-green-700"
                            title="Compartilhar no WhatsApp"
                          >
                            📱
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Quer mais dados?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Assine para ter acesso a métricas completas, heatmaps, comparações e alertas de novos talentos
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 text-lg font-medium">
                Assinar Agora - R$ 1.5-2k/mês
              </button>
            </Link>
          </div>
          <p className="mt-4 text-sm opacity-75">
            Acesso completo a todos os campeonatos e jogadores
          </p>
        </div>
      </main>
    </div>
  );
}
