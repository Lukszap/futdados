'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { VideoUpload, ProcessingQueue, Championship, VideoValidation } from '@/lib/types';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'queue' | 'validation' | 'analytics'>('upload');
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [processingQueue, setProcessingQueue] = useState<ProcessingQueue | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoUpload | null>(null);
  const [validationData, setValidationData] = useState<VideoValidation | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedChampionship, setSelectedChampionship] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchChampionships();
    fetchProcessingQueue();
  }, []);

  const fetchChampionships = async () => {
    try {
      const response = await api.get('/api/championships/');
      setChampionships(response.data);
    } catch (error) {
      console.error('Error fetching championships:', error);
    }
  };

  const fetchProcessingQueue = async () => {
    try {
      const response = await api.get('/api/admin/processing-queue');
      setProcessingQueue(response.data);
    } catch (error) {
      console.error('Error fetching processing queue:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedChampionship) {
      alert('Selecione um arquivo e um campeonato');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('championship_id', selectedChampionship.toString());

    try {
      await api.post('/api/admin/videos/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setUploadFile(null);
      setSelectedChampionship(null);
      setUploadProgress(0);
      fetchProcessingQueue();
      alert('Upload iniciado com sucesso!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleValidate = async (videoId: number) => {
    try {
      const response = await api.get(`/api/admin/videos/${videoId}/validate`);
      setValidationData(response.data);
      setSelectedVideo(processingQueue?.videos.find(v => v.id === videoId) || null);
      setActiveTab('validation');
    } catch (error) {
      console.error('Error fetching validation data:', error);
    }
  };

  const handlePublish = async (videoId: number) => {
    try {
      await api.post(`/api/admin/videos/${videoId}/publish`);
      alert('Vídeo publicado com sucesso!');
      fetchProcessingQueue();
      setActiveTab('queue');
    } catch (error) {
      console.error('Error publishing video:', error);
      alert('Erro ao publicar vídeo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'bg-yellow-100 text-yellow-800';
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'analyzing':
        return 'bg-indigo-100 text-indigo-800';
      case 'validating':
        return 'bg-orange-100 text-orange-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Football Analytics - Admin
              </h1>
              <p className="text-sm text-gray-600">Painel Administrativo</p>
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upload Vídeo
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Processing Queue
            {processingQueue && processingQueue.processing_count > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {processingQueue.processing_count}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'validation'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Validação
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Upload de Vídeo
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campeonato
                </label>
                <select
                  value={selectedChampionship || ''}
                  onChange={(e) => setSelectedChampionship(Number(e.target.value) || null)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Selecione um campeonato</option>
                  {championships.map((champ) => (
                    <option key={champ.id} value={champ.id}>
                      {champ.name} {champ.category && `(${champ.category})`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo de Vídeo (.mp4)
                </label>
                <input
                  type="file"
                  accept=".mp4"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              {uploadFile && (
                <div className="text-sm text-gray-600">
                  Arquivo selecionado: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do upload</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || !selectedChampionship || isUploading}
                className="w-full"
              >
                {isUploading ? 'Fazendo Upload...' : 'Iniciar Upload'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Fila de Processamento
              </h2>
            </div>
            <div className="p-6">
              {processingQueue ? (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-2xl font-bold text-blue-600">{processingQueue.total_count}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Processando</div>
                      <div className="text-2xl font-bold text-purple-600">{processingQueue.processing_count}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Concluídos</div>
                      <div className="text-2xl font-bold text-green-600">{processingQueue.completed_count}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Falhados</div>
                      <div className="text-2xl font-bold text-red-600">{processingQueue.failed_count}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {processingQueue.videos.map((video) => (
                      <div key={video.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{video.original_filename}</h3>
                            <p className="text-sm text-gray-600">{video.championship_name}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(video.upload_status)}`}>
                            {video.upload_status}
                          </span>
                        </div>
                        {video.processing_progress !== undefined && video.upload_status !== 'published' && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progresso</span>
                              <span>{video.processing_progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${video.processing_progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {video.upload_status === 'analyzing' && (
                          <Button
                            onClick={() => handleValidate(video.id)}
                            className="mt-3"
                            size="sm"
                          >
                            Validar Dados
                          </Button>
                        )}
                        {video.error_message && (
                          <p className="text-sm text-red-600 mt-2">{video.error_message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">Carregando fila de processamento...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'validation' && validationData && selectedVideo && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Validação: {selectedVideo.original_filename}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Jogadores Detectados</div>
                  <div className="text-2xl font-bold">{validationData.extracted_data.players_detected}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Total de Frames</div>
                  <div className="text-2xl font-bold">{validationData.extracted_data.total_frames}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Qualidade do Tracking</div>
                  <div className="text-2xl font-bold">{(validationData.extracted_data.tracking_quality * 100).toFixed(0)}%</div>
                </div>
              </div>

              {validationData.requires_manual_review && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-yellow-800 mb-2">⚠️ Revisão Manual Necessária</h3>
                  <ul className="text-sm text-yellow-700 list-disc list-inside">
                    {validationData.issues?.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="font-semibold mb-4">Estatísticas dos Jogadores</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Jogador</th>
                      <th className="text-left py-2 px-4">Gols</th>
                      <th className="text-left py-2 px-4">Assists</th>
                      <th className="text-left py-2 px-4">Passes</th>
                      <th className="text-left py-2 px-4">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationData.player_stats.map((stat, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-4">{stat.detected_name || `Jogador ${stat.player_id || idx + 1}`}</td>
                        <td className="py-2 px-4">{stat.goals}</td>
                        <td className="py-2 px-4">{stat.assists}</td>
                        <td className="py-2 px-4">{stat.passes}</td>
                        <td className="py-2 px-4">{stat.rating.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  onClick={() => handlePublish(selectedVideo.id)}
                  className="flex-1"
                >
                  Publicar Ranking
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('queue')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Analytics - Ranking Atualizado
            </h2>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Dashboard de analytics será implementado com gráficos e métricas detalhadas
              </p>
              <Link href="/dashboard">
                <Button>Voltar ao Dashboard Principal</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
