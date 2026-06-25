import Link from 'next/link';

export default function Home() {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Descubra Talentos com IA
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Análise de vídeos de futebol com inteligência artificial para identificar
            os melhores jogadores de campeonatos regionais
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium">
                Começar Agora
              </button>
            </Link>
            <Link href="/ranking">
              <button className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 text-lg font-medium border">
                Ver Ranking Público
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-blue-600 text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Detecção com IA
            </h3>
            <p className="text-gray-600">
              YOLOv8 + ByteTrack para rastrear jogadores e bola em tempo real
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-green-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Métricas Avançadas
            </h3>
            <p className="text-gray-600">
              Velocidade, passes, finalizações, heatmaps e muito mais
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-purple-600 text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ranking Completo
            </h3>
            <p className="text-gray-600">
              Classificação automática de todos os jogadores do campeonato
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Planos e Preços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6 border-2 border-transparent hover:border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ranking Público
              </h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">Grátis</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ Ranking básico</li>
                <li>✓ Perfil público</li>
                <li>✓ Métricas limitadas</li>
              </ul>
              <Link href="/ranking">
                <button className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200">
                  Acessar
                </button>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Para Clubes
              </h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                R$ 1.5-2k<span className="text-lg text-gray-600">/mês</span>
              </p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ Ranking completo</li>
                <li>✓ Todas as métricas</li>
                <li>✓ Upload de vídeos</li>
                <li>✓ Export de dados</li>
              </ul>
              <Link href="/register">
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Assinar
                </button>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-2 border-transparent hover:border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Relatório Individual
              </h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                R$ 200-300
              </p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ PDF detalhado</li>
                <li>✓ Heatmaps</li>
                <li>✓ Comparação</li>
                <li>✓ Vídeos destacados</li>
              </ul>
              <Link href="/register">
                <button className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200">
                  Comprar
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
