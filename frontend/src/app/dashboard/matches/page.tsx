'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Match, Championship, Video, PlayerMetrics } from '@/lib/types';
import {
  matchesApi,
  championshipsApi,
  videosApi,
  MatchInput,
} from '@/lib/resources';
import { getApiErrorMessage } from '@/lib/errors';

const emptyMatch: MatchInput = {
  championship_id: 0,
  home_team: '',
  away_team: '',
  match_date: '',
  venue: '',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  processed: 'Processado',
  failed: 'Falhou',
  uploaded: 'Enviado',
  uploading: 'Enviando',
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [matchModal, setMatchModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MatchInput>(emptyMatch);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [champModal, setChampModal] = useState(false);
  const [champName, setChampName] = useState('');
  const [champYear, setChampYear] = useState('');
  const [champCategory, setChampCategory] = useState('');

  // Per-match video/metrics panel state
  const [openMatchId, setOpenMatchId] = useState<number | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [metrics, setMetrics] = useState<PlayerMetrics[]>([]);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [processingVideoId, setProcessingVideoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = async () => {
    try {
      const [m, c] = await Promise.all([matchesApi.list(), championshipsApi.list()]);
      setMatches(m);
      setChampionships(c);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyMatch, championship_id: championships[0]?.id ?? 0 });
    setError('');
    setMatchModal(true);
  };

  const openEdit = (m: Match) => {
    setEditingId(m.id);
    setForm({
      championship_id: m.championship_id ?? championships[0]?.id ?? 0,
      home_team: m.home_team,
      away_team: m.away_team,
      match_date: m.match_date ? m.match_date.slice(0, 16) : '',
      venue: m.venue || '',
    });
    setError('');
    setMatchModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.championship_id) {
      setError('Crie e selecione um campeonato primeiro');
      return;
    }
    setSaving(true);
    try {
      const payload: MatchInput = {
        ...form,
        match_date: new Date(form.match_date).toISOString(),
      };
      if (editingId === null) {
        await matchesApi.create(payload);
      } else {
        await matchesApi.update(editingId, payload);
      }
      setMatchModal(false);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao salvar partida'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: Match) => {
    if (!confirm(`Excluir a partida ${m.home_team} x ${m.away_team}?`)) return;
    try {
      await matchesApi.remove(m.id);
      if (openMatchId === m.id) setOpenMatchId(null);
      await loadData();
    } catch {
      alert('Erro ao excluir partida');
    }
  };

  const handleCreateChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const created = await championshipsApi.create({
        name: champName,
        year: champYear ? Number(champYear) : undefined,
        category: champCategory || undefined,
      });
      setChampName('');
      setChampYear('');
      setChampCategory('');
      setChampModal(false);
      const list = await championshipsApi.list();
      setChampionships(list);
      setForm((f) => ({ ...f, championship_id: created.id }));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao criar campeonato'));
    }
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const openPanel = async (matchId: number) => {
    if (openMatchId === matchId) {
      setOpenMatchId(null);
      stopPolling();
      return;
    }
    setOpenMatchId(matchId);
    setVideos([]);
    setMetrics([]);
    setUploadPct(null);
    await refreshPanel(matchId);
  };

  const refreshPanel = async (matchId: number) => {
    const [v, mt] = await Promise.all([
      videosApi.listByMatch(matchId),
      matchesApi.metrics(matchId),
    ]);
    setVideos(v);
    setMetrics(mt);
  };

  const pollVideo = (matchId: number, videoId: number) => {
    stopPolling();
    setProcessingVideoId(videoId);
    pollRef.current = setInterval(async () => {
      try {
        const v = await videosApi.get(videoId);
        setVideos((prev) => prev.map((x) => (x.id === v.id ? v : x)));
        if (v.upload_status === 'processed' || v.upload_status === 'failed') {
          stopPolling();
          setProcessingVideoId(null);
          await refreshPanel(matchId);
        }
      } catch {
        stopPolling();
        setProcessingVideoId(null);
      }
    }, 1000);
  };

  const handleUpload = async (matchId: number, file: File) => {
    setUploadPct(0);
    try {
      const video = await videosApi.upload(matchId, file, setUploadPct);
      setUploadPct(null);
      await refreshPanel(matchId);
      pollVideo(matchId, video.id);
    } catch {
      setUploadPct(null);
      alert('Erro ao enviar vídeo');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
              ← Voltar ao dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Partidas</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setChampModal(true)}>
              + Campeonato
            </Button>
            <Button onClick={openCreate}>+ Nova partida</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="text-gray-500 mb-4">Nenhuma partida cadastrada</p>
            <Button onClick={openCreate}>Cadastrar primeira partida</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((m) => (
              <div key={m.id} className="bg-white rounded-lg shadow">
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {m.home_team} <span className="text-gray-400">x</span> {m.away_team}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {m.championship_name || 'Sem campeonato'}
                      {m.match_date ? ` • ${new Date(m.match_date).toLocaleString('pt-BR')}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.videos_count ?? 0} vídeo(s) • status: {STATUS_LABELS[m.status] || m.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => openPanel(m.id)}>
                      {openMatchId === m.id ? 'Fechar' : 'Vídeos / IA'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => openEdit(m)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(m)}>
                      Excluir
                    </Button>
                  </div>
                </div>

                {openMatchId === m.id && (
                  <div className="border-t px-6 py-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Upload de vídeo</h4>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(m.id, file);
                        }}
                        className="block text-sm text-gray-600"
                      />
                      {uploadPct !== null && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200 rounded">
                            <div
                              className="h-2 bg-blue-600 rounded transition-all"
                              style={{ width: `${uploadPct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Enviando: {uploadPct}%</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Vídeos</h4>
                      {videos.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum vídeo enviado ainda</p>
                      ) : (
                        <ul className="space-y-2">
                          {videos.map((v) => (
                            <li
                              key={v.id}
                              className="flex items-center justify-between text-sm border rounded px-3 py-2"
                            >
                              <span className="text-gray-700 truncate max-w-xs">
                                {v.original_filename}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  {STATUS_LABELS[v.upload_status] || v.upload_status}
                                </span>
                                {v.upload_status === 'processing' && (
                                  <span className="text-blue-600">
                                    {Math.round(v.processing_progress ?? 0)}%
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {processingVideoId !== null && (
                        <p className="text-xs text-blue-600 mt-2">
                          IA analisando o vídeo... as métricas aparecem ao concluir.
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Métricas geradas pela IA</h4>
                      {metrics.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Sem métricas ainda. Faça upload de um vídeo e aguarde o processamento.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">Jogador</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">Dist. (m)</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">Vel. méd.</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">Vel. máx.</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">Passes</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">% Passe</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">xG</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">xA</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {metrics.map((mt) => (
                                <tr key={mt.id}>
                                  <td className="px-3 py-2 font-medium text-gray-900">
                                    {mt.player_name || `#${mt.player_id}`}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {mt.total_distance?.toLocaleString('pt-BR') ?? '-'}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {mt.average_speed ?? '-'}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {mt.max_speed ?? '-'}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {mt.passes_completed ?? '-'}/{mt.passes_attempted ?? '-'}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {mt.pass_success_rate != null ? `${mt.pass_success_rate}%` : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {mt.expected_goals ?? '-'}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {mt.expected_assists ?? '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Match modal */}
      <Modal
        isOpen={matchModal}
        onClose={() => setMatchModal(false)}
        title={editingId === null ? 'Nova partida' : 'Editar partida'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Campeonato</label>
            {championships.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum campeonato.{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setMatchModal(false);
                    setChampModal(true);
                  }}
                >
                  Criar campeonato
                </button>
              </p>
            ) : (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.championship_id}
                onChange={(e) => setForm((f) => ({ ...f, championship_id: Number(e.target.value) }))}
              >
                {championships.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Time da casa"
              required
              value={form.home_team}
              onChange={(e) => setForm((f) => ({ ...f, home_team: e.target.value }))}
            />
            <Input
              label="Time visitante"
              required
              value={form.away_team}
              onChange={(e) => setForm((f) => ({ ...f, away_team: e.target.value }))}
            />
          </div>
          <Input
            label="Data e hora"
            type="datetime-local"
            required
            value={form.match_date}
            onChange={(e) => setForm((f) => ({ ...f, match_date: e.target.value }))}
          />
          <Input
            label="Local"
            value={form.venue || ''}
            onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setMatchModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Championship modal */}
      <Modal
        isOpen={champModal}
        onClose={() => setChampModal(false)}
        title="Novo campeonato"
      >
        <form onSubmit={handleCreateChampionship} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <Input
            label="Nome"
            required
            value={champName}
            onChange={(e) => setChampName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ano"
              type="number"
              value={champYear}
              onChange={(e) => setChampYear(e.target.value)}
            />
            <Input
              label="Categoria"
              placeholder="sub-20"
              value={champCategory}
              onChange={(e) => setChampCategory(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setChampModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
