import { PlayerRanking } from '@/lib/types';
import { Button } from './ui/Button';

interface RankingTableProps {
  ranking: PlayerRanking[];
  onPlayerClick?: (playerId: number) => void;
  showActions?: boolean;
  isPublic?: boolean;
}

export function RankingTable({
  ranking,
  onPlayerClick,
  showActions = true,
  isPublic = false,
}: RankingTableProps) {
  const shareOnWhatsApp = (player: PlayerRanking, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🏆 Ranking Football Analytics\n\n${player.rank}º - ${player.player_name}\n⚽ Gols: ${player.stats.goals || 0}\n🎯 Rating: ${player.stats.rating?.toFixed(1) || '-'}\n\nVeja o ranking completo em football-analytics.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (ranking.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          Nenhum dado disponível no momento
        </p>
        <p className="text-sm text-gray-400">
          {isPublic
            ? 'Os dados serão atualizados conforme vídeos são processados'
            : 'Adicione vídeos para começar a ver o ranking'}
        </p>
      </div>
    );
  }

  return (
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
            {showActions && <th className="text-left py-3 px-4">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {ranking.map((player) => (
            <tr
              key={player.player_id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onPlayerClick?.(player.player_id)}
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
              {showActions && (
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {isPublic && (
                      <button
                        onClick={(e) => shareOnWhatsApp(player, e)}
                        className="text-green-600 hover:text-green-700"
                        title="Compartilhar no WhatsApp"
                      >
                        📱
                      </button>
                    )}
                    {!isPublic && onPlayerClick && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayerClick(player.player_id);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
