import { PlayerDetails } from '@/lib/types';
import { Button } from './ui/Button';

interface PlayerDetailsModalProps {
  player: PlayerDetails;
  onClose: () => void;
  onGeneratePDF?: (playerId: number) => void;
}

export function PlayerDetailsModal({ player, onClose, onGeneratePDF }: PlayerDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Detalhes do Jogador</h3>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
        <div className="p-6">
          {/* Player Header */}
          <div className="flex items-center gap-6 mb-6">
            {player.photo_url && (
              <img
                src={player.photo_url}
                alt={player.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{player.name}</h2>
              <p className="text-gray-600">
                {player.position} • {player.age} anos • Nº {player.jersey_number}
              </p>
            </div>
          </div>

          {/* Career Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Partidas</div>
              <div className="text-2xl font-bold">{player.career_stats.total_matches}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Gols</div>
              <div className="text-2xl font-bold">{player.career_stats.total_goals}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Assists</div>
              <div className="text-2xl font-bold">{player.career_stats.total_assists}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Rating Médio</div>
              <div className="text-2xl font-bold">{player.career_stats.average_rating.toFixed(1)}</div>
            </div>
          </div>

          {/* Heatmap */}
          {player.heatmap_url && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Heatmap</h4>
              <img
                src={player.heatmap_url}
                alt="Heatmap"
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Comparison vs Category */}
          {player.comparison_vs_category && player.comparison_vs_category.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4">Comparação vs Média da Categoria</h4>
              <div className="space-y-3">
                {player.comparison_vs_category.map((comp, idx) => (
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
          {player.video_clips && player.video_clips.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4">Clipes Destacados</h4>
              <div className="grid grid-cols-2 gap-4">
                {player.video_clips.map((clip) => (
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
            {onGeneratePDF && (
              <Button
                onClick={() => onGeneratePDF(player.id)}
                className="flex-1"
              >
                Gerar Relatório PDF
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
