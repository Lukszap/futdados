import { useState } from 'react';
import { Button } from './ui/Button';
import { Championship } from '@/lib/types';

interface VideoUploadCardProps {
  championships: Championship[];
  onUpload: (file: File, championshipId: number) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function VideoUploadCard({
  championships,
  onUpload,
  isUploading = false,
  uploadProgress = 0,
}: VideoUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedChampionship, setSelectedChampionship] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedChampionship) {
      alert('Selecione um arquivo e um campeonato');
      return;
    }

    await onUpload(selectedFile, selectedChampionship);
    setSelectedFile(null);
    setSelectedChampionship(null);
  };

  return (
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
            disabled={isUploading}
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
            disabled={isUploading}
          />
        </div>
        {selectedFile && (
          <div className="text-sm text-gray-600">
            Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
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
          disabled={!selectedFile || !selectedChampionship || isUploading}
          className="w-full"
        >
          {isUploading ? 'Fazendo Upload...' : 'Iniciar Upload'}
        </Button>
      </div>
    </div>
  );
}
