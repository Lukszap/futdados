'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Player } from '@/lib/types';
import { playersApi, PlayerInput } from '@/lib/resources';
import { getApiErrorMessage } from '@/lib/errors';

const POSITIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'goalkeeper', label: 'Goleiro' },
  { value: 'defender', label: 'Defensor' },
  { value: 'midfielder', label: 'Meio-campista' },
  { value: 'forward', label: 'Atacante' },
];

const emptyForm: PlayerInput = {
  name: '',
  age: undefined,
  position: '',
  jersey_number: undefined,
  height: undefined,
  weight: undefined,
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PlayerInput>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPlayers = async () => {
    try {
      setPlayers(await playersApi.list());
    } catch {
      setError('Erro ao carregar jogadores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPlayers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditingId(player.id);
    setForm({
      name: player.name,
      age: player.age,
      position: player.position || '',
      jersey_number: player.jersey_number,
      height: player.height,
      weight: player.weight,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId === null) {
        await playersApi.create(form);
      } else {
        await playersApi.update(editingId, form);
      }
      setIsModalOpen(false);
      await loadPlayers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao salvar jogador'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (player: Player) => {
    if (!confirm(`Excluir o jogador "${player.name}"?`)) return;
    try {
      await playersApi.remove(player.id);
      await loadPlayers();
    } catch {
      alert('Erro ao excluir jogador');
    }
  };

  const setNum = (key: keyof PlayerInput, value: string) =>
    setForm((f) => ({ ...f, [key]: value === '' ? undefined : Number(value) }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
              ← Voltar ao dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Jogadores</h1>
          </div>
          <Button onClick={openCreate}>+ Novo jogador</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : players.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="text-gray-500 mb-4">Nenhum jogador cadastrado</p>
            <Button onClick={openCreate}>Cadastrar primeiro jogador</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Idade</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {players.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {POSITIONS.find((pos) => pos.value === p.position)?.label || p.position || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.jersey_number ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{p.age ?? '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(p)}>
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId === null ? 'Novo jogador' : 'Editar jogador'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <Input
            label="Nome"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Posição</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.position || ''}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            >
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Número"
              type="number"
              value={form.jersey_number ?? ''}
              onChange={(e) => setNum('jersey_number', e.target.value)}
            />
            <Input
              label="Idade"
              type="number"
              value={form.age ?? ''}
              onChange={(e) => setNum('age', e.target.value)}
            />
            <Input
              label="Altura (m)"
              type="number"
              step="0.01"
              value={form.height ?? ''}
              onChange={(e) => setNum('height', e.target.value)}
            />
          </div>
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={form.weight ?? ''}
            onChange={(e) => setNum('weight', e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
