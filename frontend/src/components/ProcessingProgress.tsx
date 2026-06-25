import { VideoUpload, UploadStatus } from '@/lib/types';

interface ProcessingProgressProps {
  videos: VideoUpload[];
  onValidate?: (videoId: number) => void;
}

const statusLabels: Record<UploadStatus, string> = {
  uploading: 'Fazendo Upload',
  uploaded: 'Upload Concluído',
  processing: 'Processando',
  analyzing: 'Analisando',
  validating: 'Validando',
  published: 'Publicado',
  failed: 'Falhou',
};

const statusColors: Record<UploadStatus, string> = {
  uploading: 'bg-yellow-100 text-yellow-800',
  uploaded: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  analyzing: 'bg-indigo-100 text-indigo-800',
  validating: 'bg-orange-100 text-orange-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function ProcessingProgress({ videos, onValidate }: ProcessingProgressProps) {
  const total = videos.length;
  const processing = videos.filter(v => ['uploading', 'uploaded', 'processing', 'analyzing', 'validating'].includes(v.upload_status)).length;
  const completed = videos.filter(v => v.upload_status === 'published').length;
  const failed = videos.filter(v => v.upload_status === 'failed').length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Fila de Processamento
        </h2>
      </div>
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-blue-600">{total}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Processando</div>
            <div className="text-2xl font-bold text-purple-600">{processing}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Concluídos</div>
            <div className="text-2xl font-bold text-green-600">{completed}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Falhados</div>
            <div className="text-2xl font-bold text-red-600">{failed}</div>
          </div>
        </div>

        {/* Video List */}
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{video.original_filename}</h3>
                  <p className="text-sm text-gray-600">{video.championship_name}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${statusColors[video.upload_status]}`}>
                  {statusLabels[video.upload_status]}
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
              {video.upload_status === 'analyzing' && onValidate && (
                <button
                  onClick={() => onValidate(video.id)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Validar Dados
                </button>
              )}
              {video.error_message && (
                <p className="text-sm text-red-600 mt-2">{video.error_message}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
