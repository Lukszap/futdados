'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RankingPage() {
  const [filterPosition, setFilterPosition] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder - será implementado quando a API pública estiver pronta
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [filterPosition]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Football Analytics - Ranking Público
            </h1>
            <Link href="/" className="text-blue-600 hover:underline">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Filtros
          </h2>
          <div className="flex gap-4">
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Todas Posições</option>
              <option value="goalkeeper">Goleiros</option>
              <option value="defender">Defensores</option>
              <option value="midfielder">Meio-campistas</option>
              <option value="forward">Atacantes</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Ranking de Jogadores
            </h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <p className="text-center text-gray-500">Carregando ranking...</p>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Ranking público será disponível em breve
                </p>
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline"
                >
                  Cadastre-se para acesso completo
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
