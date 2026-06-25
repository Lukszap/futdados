import { TalentAlert } from '@/lib/types';
import { Button } from './ui/Button';

interface TalentAlertsProps {
  alerts: TalentAlert[];
  onMarkAsRead?: (alertId: number) => void;
  onViewPlayer?: (playerId: number) => void;
}

const alertTypeLabels: Record<TalentAlert['alert_type'], string> = {
  new_talent: 'Novo Talento',
  breakout_performance: 'Performance Destacada',
  consistent_performer: 'Desempenho Consistente',
};

const alertTypeIcons: Record<TalentAlert['alert_type'], string> = {
  new_talent: '⭐',
  breakout_performance: '🚀',
  consistent_performer: '📈',
};

export function TalentAlerts({ alerts, onMarkAsRead, onViewPlayer }: TalentAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum alerta no momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 ${!alert.is_read ? 'bg-blue-50 border-blue-200' : ''}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{alertTypeIcons[alert.alert_type]}</span>
                <span className="font-semibold">{alert.player_name}</span>
                {!alert.is_read && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Novo</span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{alert.message}</p>
              <div className="flex gap-4 text-sm">
                {alert.metrics.goals !== undefined && (
                  <span>⚽ {alert.metrics.goals} gols</span>
                )}
                {alert.metrics.rating !== undefined && (
                  <span>⭐ Rating: {alert.metrics.rating.toFixed(1)}</span>
                )}
                {alert.metrics.percentile !== undefined && (
                  <span>📊 Top {alert.metrics.percentile}%</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!alert.is_read && onMarkAsRead && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onMarkAsRead(alert.id)}
                >
                  Marcar como lido
                </Button>
              )}
              {onViewPlayer && (
                <Button
                  size="sm"
                  onClick={() => onViewPlayer(alert.player_id)}
                >
                  Ver Perfil
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
