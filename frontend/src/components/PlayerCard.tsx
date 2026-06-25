import { PlayerRanking } from '@/lib/types';

interface PlayerCardProps {
  player: PlayerRanking;
  onClick?: () => void;
  showRank?: boolean;
}

export function PlayerCard({ player, onClick, showRank = true }: PlayerCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {player.photo_url && (
          <img
            src={player.photo_url}
            alt={player.player_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {showRank && (
              <span className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded">
                #{player.rank}
              </span>
            )}
            <h3 className="font-semibold text-gray-900">{player.player_name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {player.position || 'Posição não definida'} • {player.category || 'Categoria não definida'}
          </p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-500">Rating:</span>
              <span className="font-bold text-blue-600 ml-1">
                {player.stats.rating?.toFixed(1) || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">⚽:</span>
              <span className="font-medium ml-1">{player.stats.goals || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">🎯:</span>
              <span className="font-medium ml-1">{player.stats.assists || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
