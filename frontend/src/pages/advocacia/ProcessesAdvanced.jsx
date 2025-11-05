import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/elite-forensic.css';

const ProcessesAdvanced = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  
  // Filtros avançados
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    fase: 'all',
    responsavel: 'all',
    tags: [],
    prazo_critico: false
  });
  
  // Ordenação
  const [sortBy, setSortBy] = useState('data_desc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState({
    numero: true,
    titulo: true,
    cliente: true,
    status: true,
    fase: true,
    responsavel: true,
    prazo: true,
    valor: true,
    tags: true
  });
  
  // Filtros salvos
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    loadProcesses();
    loadSavedFilters();
  }, [filters, sortBy]);

  const loadProcesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/processes/advanced`,
        { 
          params: { ...filters, sort: sortBy },
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

  const loadSavedFilters = () => {
    const saved = localStorage.getItem('elite_saved_filters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  };

  const saveCurrentFilter = () => {
    if (!filterName) {
      alert('Digite um nome para o filtro');
      return;
    }
    
    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters },
      sortBy
    };
    
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('elite_saved_filters', JSON.stringify(updated));
    setFilterName('');
    alert('✅ Filtro salvo!');
  };

  const applyFilter = (filter) => {
    setFilters(filter.filters);
    setSortBy(filter.sortBy);
  };

  const toggleSelectProcess = (id) => {
    if (selectedProcesses.includes(id)) {
      setSelectedProcesses(selectedProcesses.filter(p => p !== id));
    } else {
      setSelectedProcesses([...selectedProcesses, id]);
    }
  };

  const bulkArchive = async () => {
    if (selectedProcesses.length === 0) return;
    
    if (!window.confirm(`Arquivar ${selectedProcesses.length} processos?`)) return;
    
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/processes/bulk-archive`,
        { process_ids: selectedProcesses },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      alert('✅ Processos arquivados!');
      setSelectedProcesses([]);
      loadProcesses();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/processes/export`,
        { 
          params: filters,
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `processos_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Erro ao exportar: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
              <span style={{ color: '#00A3C4' }}>Processos</span> Avançado
            </h1>
            <p className="text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
              {processes.length} processos encontrados
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/athena/processes/new" className="btn-elite btn-elite-primary">
              + Novo Processo
            </Link>
            <button onClick={exportToExcel} className="btn-elite btn-elite-secondary">
              📄 Exportar
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="cipher-glass p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                Buscar
              </label>
              <input
                type="text"
                className="input-elite"
                placeholder="Número, título ou cliente..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                Status
              </label>
              <select
                className="input-elite"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                Fase
              </label>
              <select
                className="input-elite"
                value={filters.fase}
                onChange={(e) => setFilters({...filters, fase: e.target.value})}
              >
                <option value="all">Todas</option>
                <option value="inicial">Inicial</option>
                <option value="instrucao">Instrução</option>
                <option value="julgamento">Julgamento</option>
                <option value="recursal">Recursal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                Ordenar por
              </label>
              <select
                className="input-elite"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="data_desc">Data (mais recente)</option>
                <option value="data_asc">Data (mais antigo)</option>
                <option value="prioridade">Prioridade</option>
                <option value="valor_desc">Valor (maior)</option>
                <option value="prazo_asc">Prazo (mais urgente)</option>
              </select>
            </div>
          </div>

          {/* Filtros Salvos */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: '#00A3C4' }}>Filtros salvos:</span>
            {savedFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => applyFilter(f)}
                className="px-3 py-1 rounded-lg text-xs transition-all"
                style={{
                  background: 'rgba(0,163,196,0.15)',
                  border: '1px solid rgba(0,163,196,0.3)',
                  color: '#00A3C4'
                }}
              >
                {f.name}
              </button>
            ))}
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do filtro"
                className="input-elite text-sm"
                style={{ width: '150px', height: '32px' }}
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <button
                onClick={saveCurrentFilter}
                className="px-3 py-1 rounded-lg text-xs"
                style={{
                  background: '#00A3C4',
                  color: '#000'
                }}
              >
                Salvar Filtro
              </button>
            </div>
          </div>
        </div>

        {/* Ações em Massa */}
        {selectedProcesses.length > 0 && (
          <div className="cipher-glass p-4 mb-6 flex items-center justify-between">
            <div className="text-sm" style={{ color: '#E4E6EB' }}>
              <strong>{selectedProcesses.length}</strong> processos selecionados
            </div>
            <div className="flex gap-3">
              <button onClick={bulkArchive} className="btn-elite btn-elite-secondary text-sm">
                🗄️ Arquivar Selecionados
              </button>
              <button 
                onClick={() => setSelectedProcesses([])} 
                className="px-3 py-1 rounded text-sm"
                style={{ color: '#E67E22' }}
              >
                Limpar Seleção
              </button>
            </div>
          </div>
        )}

        {/* Configuração de Colunas */}
        <div className="cipher-glass p-4 mb-6">
          <details>
            <summary className="cursor-pointer text-sm font-semibold" style={{ color: '#00A3C4' }}>
              ⚙️ Configurar Colunas
            </summary>
            <div className="grid grid-cols-5 gap-3 mt-4">
              {Object.keys(visibleColumns).map((col) => (
                <label key={col} className="flex items-center gap-2 text-sm" style={{ color: '#E4E6EB' }}>
                  <input
                    type="checkbox"
                    checked={visibleColumns[col]}
                    onChange={(e) => setVisibleColumns({...visibleColumns, [col]: e.target.checked})}
                  />
                  <span className="capitalize">{col}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Lista de Processos */}
        <div className="space-y-3">
          {loading ? (
            <div className="cipher-glass p-12 text-center" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Carregando...
            </div>
          ) : processes.length === 0 ? (
            <div className="cipher-glass p-12 text-center" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Nenhum processo encontrado
            </div>
          ) : (
            processes.map((proc) => (
              <div key={proc.id} className="cipher-glass p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedProcesses.includes(proc.id)}
                    onChange={() => toggleSelectProcess(proc.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {visibleColumns.numero && (
                          <div className="font-mono text-sm mb-1" style={{ color: '#00A3C4' }}>
                            {proc.numero || 'N/A'}
                          </div>
                        )}
                        {visibleColumns.titulo && (
                          <h3 className="text-lg font-bold" style={{ color: '#E4E6EB' }}>
                            {proc.titulo || 'Sem título'}
                          </h3>
                        )}
                        {visibleColumns.cliente && (
                          <div className="text-sm mt-1" style={{ color: 'rgba(228,230,235,0.7)' }}>
                            👤 {proc.cliente || 'N/A'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        {visibleColumns.status && (
                          <div className="badge-elite badge-iso text-xs">
                            {proc.status?.toUpperCase() || 'N/A'}
                          </div>
                        )}
                        {proc.prazo_critico && (
                          <div className="text-xs px-2 py-1 rounded" style={{ background: '#E74C3C', color: '#fff' }}>
                            ⚠️ Prazo Crítico
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      {visibleColumns.fase && (
                        <div>
                          <span style={{ color: 'rgba(228,230,235,0.5)' }}>Fase: </span>
                          <span style={{ color: '#E4E6EB' }}>{proc.fase || 'N/A'}</span>
                        </div>
                      )}
                      {visibleColumns.responsavel && (
                        <div>
                          <span style={{ color: 'rgba(228,230,235,0.5)' }}>Responsável: </span>
                          <span style={{ color: '#E4E6EB' }}>{proc.responsavel || 'N/A'}</span>
                        </div>
                      )}
                      {visibleColumns.prazo && proc.proximo_prazo && (
                        <div>
                          <span style={{ color: 'rgba(228,230,235,0.5)' }}>Próximo Prazo: </span>
                          <span style={{ color: '#E67E22' }}>{new Date(proc.proximo_prazo).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {visibleColumns.valor && proc.valor && (
                        <div>
                          <span style={{ color: 'rgba(228,230,235,0.5)' }}>Valor: </span>
                          <span style={{ color: '#27AE60' }}>R$ {proc.valor.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    {visibleColumns.tags && proc.tags && proc.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {proc.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              background: 'rgba(0,163,196,0.1)',
                              border: '1px solid rgba(0,163,196,0.3)',
                              color: '#00A3C4'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessesAdvanced;
