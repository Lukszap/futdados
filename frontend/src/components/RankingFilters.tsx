import { RankingFilters } from '@/lib/types';

interface RankingFiltersProps {
  filters: RankingFilters;
  onFilterChange: (key: keyof RankingFilters, value: any) => void;
  championships?: { id: number; name: string; category?: string }[];
}

export function RankingFilters({ filters, onFilterChange, championships = [] }: RankingFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campeonato
          </label>
          <select
            value={filters.championship_id || ''}
            onChange={(e) => onFilterChange('championship_id', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Todos</option>
            {championships.map((champ) => (
              <option key={champ.id} value={champ.id}>
                {champ.name} {champ.category && `(${champ.category})`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value || undefined)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Todas</option>
            <option value="sub-13">Sub-13</option>
            <option value="sub-15">Sub-15</option>
            <option value="sub-17">Sub-17</option>
            <option value="sub-20">Sub-20</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posição
          </label>
          <select
            value={filters.position || ''}
            onChange={(e) => onFilterChange('position', e.target.value || undefined)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Todas</option>
            <option value="goalkeeper">Goleiro</option>
            <option value="defender">Defensor</option>
            <option value="midfielder">Meio-campista</option>
            <option value="forward">Atacante</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange('sort_by', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="rating">Rating</option>
            <option value="goals">Gols</option>
            <option value="assists">Assists</option>
            <option value="passes">Passes</option>
            <option value="duels">Duelos</option>
          </select>
        </div>
      </div>
    </div>
  );
}
