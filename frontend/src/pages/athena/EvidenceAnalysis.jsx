import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  FileText, Upload, Download, Eye, Edit3, Save, Loader, Sparkles,
  FileSearch, Brain, CheckCircle, AlertCircle, Trash2, Plus,
  FileCheck, Zap, Lock, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const EvidenceAnalysis = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const fileInputRef = useRef(null);
  
  const [reportData, setReportData] = useState({
    // Seção 1: Identificação
    processos: '',
    autoridade: '',
    baseLegal: '',
    datasFatos: '',
    enquadramento: '',
    orgaosEnvolvidos: '',
    
    // Seção 2: Sujeitos
    reus: '',
    vitimas: '',
    testemunhasAcusacao: '',
    testemunhasDefesa: '',
    assistenteTecnico: '',
    peritosOficiais: '',
    
    // Seção 3: Objetos
    objetosApreendidos: '',
    localApreensao: '',
    cadeiasCustodia: '',
    integridade: '',
    
    // Seção 4: Provas
    relatoriosPericiais: '',
    laudosComplementares: '',
    provasDigitais: '',
    provasTelematicas: '',
    dadosFinanceiros: '',
    documentosOrigemIndefinida: '',
    
    // Seção 5: Interceptações
    numerosInterceptados: '',
    periodoCaptacao: '',
    autoridadeResponsavel: '',
    relatoriosDegravacao: '',
    integridadeArquivos: '',
    
    // Seção 6: Análise Técnica
    metodologia: '',
    ferramentasForenses: '',
    procedimentosExtracao: '',
    constatacoesRelevantes: '',
    inconsistencias: '',
    
    // Seção 7: Encaixe com Tese
    relacaoDireta: '',
    compatibilidade: '',
    convergencia: '',
    analiseCausalidade: '',
    
    // Seção 8: Análise Testemunhas
    afinidadeVinculos: '',
    contradicoes: '',
    compatibilidadeProvas: '',
    credibilidade: '',
    
    // Seção 10: Correlação Temporal
    linhaTempo: '',
    compatibilidadeCronologica: '',
    sincronizacao: '',
    
    // Seção 11: Pontos Críticos
    ausenciaCadeia: '',
    extracoesNaoAutorizadas: '',
    provasIlicitas: '',
    violacoesLGPD: '',
    faltaContraditorio: '',
    
    // Seção 12: Conclusões
    grauConfiabilidade: '',
    compatibilidadeTecnica: '',
    impactoAutoria: '',
    necessidadePericia: '',
    
    // Seção 13: Quesitos
    integridadeExtracao: '',
    alteracaoFormatos: '',
    lacunas: '',
    interceptacoesOriginais: '',
    hashAuditoria: '',
    
    // Análise IA
    analiseIA: '',
    recomendacoes: '',
    alertasCriticos: []
  });

  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/evidence-analysis/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedReports(res.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.post(
        `${BACKEND_URL}/api/athena/evidence-analysis/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setUploadedFiles([...uploadedFiles, ...res.data.files]);
      toast.success(`${files.length} arquivo(s) carregado(s) com sucesso!`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Carregue ao menos um arquivo para análise');
      return;
    }

    setAnalyzing(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.post(
        `${BACKEND_URL}/api/athena/evidence-analysis/analyze`,
        { fileIds: uploadedFiles.map(f => f.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReportData(res.data.analysis);
      setReport(res.data);
      setEditMode(true);
      toast.success('Análise concluída com sucesso!');
      
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Erro ao analisar evidências');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveReport = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(
        `${BACKEND_URL}/api/athena/evidence-analysis/save`,
        {
          reportData: reportData,
          files: uploadedFiles
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Relatório salvo com sucesso!');
      fetchSavedReports();
      
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Erro ao salvar relatório');
    }
  };

  const handleExportPDF = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/athena/evidence-analysis/export-pdf`,
        { reportData: reportData },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Analise_Evidencias_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const removeFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    toast.info('Arquivo removido');
  };

  return (
    <UniversalModuleLayout
      title="Evidence Analysis"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Análise Inteligente de Evidências</h1>
            <p className="text-slate-400">IA + Perícia Forense Digital</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-4 py-2">
            <Brain className="h-5 w-5 mr-2" />
            Powered by AI
          </Badge>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 border-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-white" />
              <div>
                <p className="text-white font-semibold">Análise Automatizada com IA</p>
                <p className="text-cyan-100 text-sm">Baseado no Roteiro de Análise de Provas - Normas ISO/IEC 27037</p>
              </div>
            </div>
            <Badge className="bg-white text-cyan-600 font-bold">Seguro & Confiável</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Upload Section */}
          <div className="col-span-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-cyan-400" />
                  Upload de Evidências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept="*/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <Loader className="h-12 w-12 text-cyan-500 mx-auto mb-3 animate-spin" />
                    ) : (
                      <FileSearch className="h-12 w-12 text-cyan-500 mx-auto mb-3" />
                    )}
                    <p className="text-white font-medium mb-1">
                      {uploading ? 'Carregando...' : 'Clique para fazer upload'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Qualquer formato: PDF, DOC, XLSX, MP3, MP4, ZIP, etc.
                    </p>
                  </button>
                </div>

                {/* Files List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {uploadedFiles.length > 0 ? (
                    uploadedFiles.map((file, index) => (
                      <div key={index} className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{file.name}</p>
                            <p className="text-slate-400 text-xs">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 p-1 hover:bg-slate-600 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Nenhum arquivo carregado</p>
                    </div>
                  )}
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={uploadedFiles.length === 0 || analyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Analisando com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analisar com IA
                    </>
                  )}
                </Button>

                {analyzing && (
                  <Card className="bg-purple-900 bg-opacity-30 border-purple-600">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
                        <p className="text-purple-200 text-sm font-medium">Análise em Progresso</p>
                      </div>
                      <div className="space-y-1 text-xs text-purple-300">
                        <p>✓ Extraindo conteúdo dos arquivos...</p>
                        <p>✓ Analisando evidências digitais...</p>
                        <p>✓ Gerando relatório estruturado...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Editor */}
          <div className="col-span-8 space-y-6">
            {report ? (
              <>
                {/* Actions */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white font-medium">Relatório Gerado</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setEditMode(!editMode)}
                        className="bg-slate-700 hover:bg-slate-600"
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {editMode ? 'Visualizar' : 'Editar'}
                      </Button>
                      <Button
                        onClick={handleSaveReport}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button
                        onClick={handleExportPDF}
                        className="bg-cyan-600 hover:bg-cyan-700"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Report Sections */}
                <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {/* Seção 1 */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">1. IDENTIFICAÇÃO E CONTEXTO PROCESSUAL</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Processo(s), cautelares e inquéritos vinculados</label>
                        {editMode ? (
                          <textarea
                            value={reportData.processos}
                            onChange={(e) => setReportData({...reportData, processos: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <p className="text-slate-300 bg-slate-700 p-3 rounded-lg">{reportData.processos || 'Não preenchido'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Autoridade requisitante</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={reportData.autoridade}
                            onChange={(e) => setReportData({...reportData, autoridade: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <p className="text-slate-300 bg-slate-700 p-3 rounded-lg">{reportData.autoridade || 'Não preenchido'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Base legal das diligências</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={reportData.baseLegal}
                            onChange={(e) => setReportData({...reportData, baseLegal: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <p className="text-slate-300 bg-slate-700 p-3 rounded-lg">{reportData.baseLegal || 'Não preenchido'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Enquadramento jurídico</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={reportData.enquadramento}
                            onChange={(e) => setReportData({...reportData, enquadramento: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <p className="text-slate-300 bg-slate-700 p-3 rounded-lg">{reportData.enquadramento || 'Não preenchido'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Análise IA */}
                  <Card className="bg-gradient-to-br from-purple-900 to-pink-900 border-purple-600">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        ANÁLISE AUTOMÁTICA POR IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Resumo Executivo</label>
                        <div className="bg-purple-950 bg-opacity-50 p-4 rounded-lg">
                          <p className="text-white whitespace-pre-wrap">{reportData.analiseIA || 'Análise em processamento...'}</p>
                        </div>
                      </div>

                      {reportData.recomendacoes && (
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-2">Recomendações</label>
                          <div className="bg-purple-950 bg-opacity-50 p-4 rounded-lg">
                            <p className="text-white whitespace-pre-wrap">{reportData.recomendacoes}</p>
                          </div>
                        </div>
                      )}

                      {reportData.alertasCriticos?.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-red-200 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Alertas Críticos
                          </label>
                          <div className="space-y-2">
                            {reportData.alertasCriticos.map((alerta, idx) => (
                              <div key={idx} className="bg-red-900 bg-opacity-40 border border-red-600 p-3 rounded-lg flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-red-100 text-sm">{alerta}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Seção 12: Conclusões */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">12. CONCLUSÕES PARCIAIS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Grau de confiabilidade das provas</label>
                        {editMode ? (
                          <textarea
                            value={reportData.grauConfiabilidade}
                            onChange={(e) => setReportData({...reportData, grauConfiabilidade: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <p className="text-slate-300 bg-slate-700 p-3 rounded-lg">{reportData.grauConfiabilidade || 'Não preenchido'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Necessidade de perícia complementar</label>
                        {editMode ? (
                          <textarea
                            value={reportData.necessidadePericia}
                            onChange={(e) => setReportData({...reportData, necessidadePericia: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <p className="text-slate-300 bg-slate-700 p-3 rounded-lg">{reportData.necessidadePericia || 'Não preenchido'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <FileSearch className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">Nenhuma Análise Gerada</h3>
                  <p className="text-slate-400 mb-4">
                    Carregue os arquivos de evidências e clique em "Analisar com IA" para gerar o relatório automaticamente
                  </p>
                  <div className="bg-slate-700 p-4 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-slate-300 text-sm font-medium mb-2">Formatos Suportados:</p>
                    <ul className="text-slate-400 text-sm space-y-1">
                      <li>• Documentos: PDF, DOC, DOCX, TXT</li>
                      <li>• Planilhas: XLS, XLSX, CSV</li>
                      <li>• Imagens: JPG, PNG, TIFF</li>
                      <li>• Áudio: MP3, WAV, M4A</li>
                      <li>• Vídeo: MP4, AVI, MOV</li>
                      <li>• Compactados: ZIP, RAR, 7Z</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Saved Reports */}
        {savedReports.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-green-400" />
                Relatórios Salvos ({savedReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {savedReports.map((savedReport, idx) => (
                  <div key={idx} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-650 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-5 w-5 text-cyan-400" />
                      <Badge className="bg-green-600 text-xs">Salvo</Badge>
                    </div>
                    <p className="text-white font-medium text-sm mb-1">Relatório #{idx + 1}</p>
                    <p className="text-slate-400 text-xs">{new Date(savedReport.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UniversalModuleLayout>
  );
};

export default EvidenceAnalysis;
