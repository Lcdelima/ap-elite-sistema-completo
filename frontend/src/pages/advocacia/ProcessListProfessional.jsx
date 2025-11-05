import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import '../../styles/elite-forensic.css';

const ProcessListProfessional = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    estado: 'all',
    fase: 'all',
    responsavel: 'all',
    status: 'all'
  });
  const [savedViews, setSavedViews] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [quickPeek, setQuickPeek] = useState(null);

  // Colunas configuráveis
  const [columns, setColumns] = useState([
    { key: 'cnj', label: 'Nº CNJ', visible: true, width: '200px' },
    { key: 'titulo', label: 'Título', visible: true, width: 'auto' },
    { key: 'cliente', label: 'Cliente/Pasta', visible: true, width: '180px' },
    { key: 'foro', label: 'Foro/Órgão', visible: true, width: '150px' },
    { key: 'fase', label: 'Fase/Estado', visible: true, width: '120px' },
    { key: 'ultimo_movimento', label: 'Último Andamento', visible: true, width: '200px' }
  ]);

  useEffect(() => {
    loadProcesses();
    loadSavedViews();
  }, [filters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          document.getElementById('search-input')?.focus();
        }
      }
      if (selectedIds.length === 1) {
        if (e.key === 'e') {
          e.preventDefault();
          // Etiquetar
        }
        if (e.key === 'a') {
          e.preventDefault();
          // Atribuir
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIds]);

  const loadProcesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/processes/professional`,
        { 
          params: { ...filters, search },
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } 
        }
      );
      setProcesses(response.data.processes || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedViews = () => {
    const views = localStorage.getItem('elite_saved_views');
    if (views) setSavedViews(JSON.parse(views));
  };

  const saveView = (name) => {
    const newView = { id: Date.now(), name, filters: {...filters}, search };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    localStorage.setItem('elite_saved_views', JSON.stringify(updated));
  };

  const applyView = (view) => {
    setFilters(view.filters);
    setSearch(view.search || '');
  };

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const searchLower = search.toLowerCase();
      return (
        (p.cnj || '').toLowerCase().includes(searchLower) ||
        (p.titulo || '').toLowerCase().includes(searchLower) ||
        (p.cliente || '').toLowerCase().includes(searchLower) ||
        (p.foro || '').toLowerCase().includes(searchLower)
      );
    });
  }, [processes, search]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const bulkTag = async (tag) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/processes/bulk-tag`,
        { process_ids: selectedIds, tag },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      alert(`✅ ${selectedIds.length} processos etiquetados`);
      setSelectedIds([]);
      loadProcesses();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-title font-bold" style={{ color: '#E4E6EB' }}>
                Advocacia <span style={{ color: '#00A3C4' }}>— Gestão Jurídica e Processual</span>
              </h1>
              <div className="text-xs mt-1" style={{ color: 'rgba(228,230,235,0.5)' }}>
                Home / Advocacia / Processos
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/athena/processes/new" className="btn-elite btn-elite-primary text-sm">
                + Novo Processo
              </Link>
              <button className="btn-elite btn-elite-secondary text-sm">
                📄 Exportar
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="cipher-glass p-4">
              <div className="text-2xl font-title font-bold" style={{ color: '#00A3C4' }}>127</div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Clientes Ativos</div>
            </div>
            <div className="cipher-glass p-4">
              <div className="text-2xl font-title font-bold" style={{ color: '#00A3C4' }}>342</div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Processos</div>
            </div>
            <div className="cipher-glass p-4">
              <div className="text-2xl font-title font-bold" style={{ color: '#E67E22' }}>47</div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Prazos Urgentes</div>
            </div>
            <div className="cipher-glass p-4">
              <div className="text-2xl font-title font-bold" style={{ color: '#27AE60' }}>R$ 487k</div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Receita Mês</div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="cipher-glass p-4 mb-4">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <input
                id="search-input"
                type="text"
                className="input-elite"
                placeholder="🔍 Buscar (CNJ, cliente, título, foro) ou pressione Ctrl+K"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select className="input-elite" style={{ width: '150px' }} value={filters.estado} onChange={(e) => setFilters({...filters, estado: e.target.value})}>
              <option value="all">Todos Estados</option>
              <option value="ativo">Ativo</option>
              <option value="suspenso">Suspenso</option>
              <option value="arquivado">Arquivado</option>
            </select>

            <select className="input-elite" style={{ width: '150px' }} value={filters.fase} onChange={(e) => setFilters({...filters, fase: e.target.value})}>
              <option value="all">Todas Fases</option>
              <option value="inicial">Inicial</option>
              <option value="instrucao">Instrução</option>
              <option value="julgamento">Julgamento</option>
            </select>

            <button className="btn-elite btn-elite-secondary text-sm" onClick={() => {
              const name = prompt('Nome da vista:');
              if (name) saveView(name);
            }}>
              💾 Salvar Vista
            </button>
          </div>

          {/* Saved Views */}
          {savedViews.length > 0 && (
            <div className="flex gap-2 mt-3">
              <span className="text-xs" style={{ color: '#00A3C4' }}>Vistas salvas:</span>
              {savedViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => applyView(view)}
                  className="px-2 py-1 rounded text-xs transition-all"
                  style={{
                    background: 'rgba(0,163,196,0.1)',
                    border: '1px solid rgba(0,163,196,0.3)',
                    color: '#00A3C4'
                  }}
                >
                  {view.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="cipher-glass p-3 mb-4 flex justify-between items-center">
            <div className="text-sm" style={{ color: '#E4E6EB' }}>
              <strong>{selectedIds.length}</strong> selecionados
            </div>
            <div className="flex gap-2">
              <button onClick={() => bulkTag('urgente')} className="btn-elite btn-elite-secondary text-xs">Etiquetar</button>
              <button className="btn-elite btn-elite-secondary text-xs">Atribuir</button>
              <button className="btn-elite btn-elite-secondary text-xs">Exportar</button>
              <button onClick={() => setSelectedIds([])} className="text-xs" style={{ color: '#E67E22' }}>Limpar</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="cipher-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <tr>
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredProcesses.length && filteredProcesses.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredProcesses.map(p => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  {columns.filter(c => c.visible).map((col) => (
                    <th key={col.key} className="text-left px-3 py-3 font-semibold" style={{ color: 'rgba(228,230,235,0.8)', width: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-3" style={{ width: '100px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map((proc, idx) => (
                  <tr 
                    key={proc.id} 
                    className="border-b transition-all cursor-pointer"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.05)',
                      background: selectedIds.includes(proc.id) ? 'rgba(0,163,196,0.08)' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedIds.includes(proc.id) ? 'rgba(0,163,196,0.08)' : 'transparent'}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(proc.id)}
                        onChange={() => toggleSelect(proc.id)}
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: '#00A3C4' }}>
                      {proc.cnj || 'N/A'}
                    </td>
                    <td className="px-3 py-3" style={{ color: '#E4E6EB' }}>
                      <div className="font-semibold">{proc.titulo || 'Sem título'}</div>
                      {proc.tags && proc.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {proc.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(0,163,196,0.15)', color: '#00A3C4' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>
                      {proc.cliente || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>
                      {proc.foro || 'N/A'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="px-2 py-1 rounded text-xs text-center" style={{
                        background: proc.fase === 'julgamento' ? 'rgba(230,126,34,0.2)' : 'rgba(0,163,196,0.15)',
                        color: proc.fase === 'julgamento' ? '#E67E22' : '#00A3C4'
                      }}>
                        {proc.fase || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>
                      <div>{proc.ultimo_movimento?.descricao || 'Sem movimentação'}</div>
                      {proc.ultimo_movimento?.data && (
                        <div style={{ color: '#00A3C4' }}>{new Date(proc.ultimo_movimento.data).toLocaleDateString('pt-BR')}</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setQuickPeek(proc)}
                        className="text-xs px-2 py-1 rounded transition-all"
                        style={{ border: '1px solid rgba(0,163,196,0.3)', color: '#00A3C4' }}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProcesses.length === 0 && !loading && (
            <div className="p-20 text-center" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Nenhum processo encontrado
            </div>
          )}
        </div>

        {/* Quick Peek Sidebar */}
        {quickPeek && (
          <div className="fixed top-0 right-0 bottom-0 w-96 z-50 cipher-glass border-l" style={{ borderColor: 'rgba(0,163,196,0.3)' }}>
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-title font-bold" style={{ color: '#E4E6EB' }}>Quick Peek</h3>
                <button onClick={() => setQuickPeek(null)} className="text-2xl" style={{ color: '#E4E6EB' }}>×</button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Número CNJ</div>
                  <div className="font-mono" style={{ color: '#E4E6EB' }}>{quickPeek.cnj}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Título</div>
                  <div style={{ color: '#E4E6EB' }}>{quickPeek.titulo}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Cliente</div>
                  <div style={{ color: '#E4E6EB' }}>{quickPeek.cliente}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Fase</div>
                  <div style={{ color: '#E4E6EB' }}>{quickPeek.fase}</div>
                </div>
                
                <div className="pt-4">
                  <Link to={`/athena/processes/${quickPeek.id}`} className="btn-elite btn-elite-primary w-full text-sm">
                    Abrir Completo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="fixed bottom-4 right-4 cipher-glass p-3 text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>
          <div><kbd>Ctrl+K</kbd> Buscar</div>
          <div><kbd>E</kbd> Etiquetar</div>
          <div><kbd>A</kbd> Atribuir</div>
        </div>
      </div>
    </div>
  );
};

export default ProcessListProfessional;
