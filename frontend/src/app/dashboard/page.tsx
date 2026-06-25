'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Player, Match } from '@/lib/types';
import api from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, club, logout, fetchClub } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      await fetchClub();
      const [playersRes, matchesRes] = await Promise.all([
        api.get('/api/players/'),
        api.get('/api/matches/'),
      ]);
      setPlayers(playersRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    void fetchData();
  }, []);

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
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <Button variant="secondary" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Jogadores</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{players.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Partidas</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{matches.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Plano</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {club?.subscription_plan || 'Basic'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/players">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gerenciar Jogadores
              </h3>
              <p className="text-gray-600">Adicione e gerencie seus jogadores</p>
            </div>
          </Link>
          <Link href="/dashboard/matches">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gerenciar Partidas
              </h3>
              <p className="text-gray-600">Crie partidas e faça upload de vídeos</p>
            </div>
          </Link>
        </div>

        {/* Recent Players */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Jogadores Recentes</h2>
          </div>
          <div className="p-6">
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum jogador cadastrado
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.slice(0, 6).map((player) => (
                  <div
                    key={player.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900">{player.name}</h3>
                    <p className="text-sm text-gray-600">
                      {player.position || 'Posição não definida'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Nº {player.jersey_number || '-'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
