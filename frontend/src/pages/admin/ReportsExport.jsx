import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Mail,
  Database,
  FileJson,
  FileSpreadsheet,
  Shield,
  Activity,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ReportsExport = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [selectedCase, setSelectedCase] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activitySummary, setActivitySummary] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch cases
      const casesRes = await axios.get(`${BACKEND_URL}/api/cases`, config);
      setCases(casesRes.data);

      // Fetch activity summary
      const activityRes = await axios.get(`${BACKEND_URL}/api/integrations/audit/activity-summary`, config);
      setActivitySummary(activityRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const generateReport = async (caseId) => {
    setGenerating({ ...generating, [caseId]: true });
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.post(
        `${BACKEND_URL}/api/integrations/reports/case/${caseId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Relatório gerado com sucesso!');
      
      // Download the report
      window.open(`${BACKEND_URL}${res.data.download_url}`, '_blank');
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating({ ...generating, [caseId]: false });
    }
  };

  const sendReportEmail = async () => {
    if (!selectedCase || !emailRecipient) {
      toast.error('Selecione um caso e informe o email');
      return;
    }

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(
        `${BACKEND_URL}/api/integrations/email/send-report?case_id=${selectedCase}&recipient_email=${emailRecipient}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Email será enviado em breve!');
      setShowEmailModal(false);
      setEmailRecipient('');
      setSelectedCase('');
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erro ao enviar email');
    }
  };

  const exportData = async (format, type) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const url = `${BACKEND_URL}/api/integrations/export/${type}/${format}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([res.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${type}_export.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Exportação concluída!');
      
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const createBackup = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      toast.info('Criando backup...');
      
      const res = await axios.post(
        `${BACKEND_URL}/api/integrations/backup/create`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Backup criado com sucesso!');
      
      // Download the backup
      window.open(`${BACKEND_URL}${res.data.download_url}`, '_blank');
      
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Erro ao criar backup');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Relatórios e Exportação</h1>
            <p className="text-slate-400 mt-1">Gere relatórios, exporte dados e faça backups</p>
          </div>
          <Badge className="bg-green-500 text-white">Sistema Avançado</Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => exportData('csv', 'cases')}>
            <CardContent className="p-6 text-center">
              <FileSpreadsheet className="h-12 w-12 text-white mx-auto mb-3" />
              <p className="text-white font-semibold text-lg">Exportar Casos (CSV)</p>
              <p className="text-blue-100 text-sm mt-2">Baixar todos os casos em formato CSV</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => exportData('json', 'analytics')}>
            <CardContent className="p-6 text-center">
              <FileJson className="h-12 w-12 text-white mx-auto mb-3" />
              <p className="text-white font-semibold text-lg">Exportar Analytics (JSON)</p>
              <p className="text-purple-100 text-sm mt-2">Dados analíticos completos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-teal-600 border-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={createBackup}>
            <CardContent className="p-6 text-center">
              <Database className="h-12 w-12 text-white mx-auto mb-3" />
              <p className="text-white font-semibold text-lg">Criar Backup</p>
              <p className="text-green-100 text-sm mt-2">Backup completo do sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Case Reports */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Relatórios de Casos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300">Nenhum caso disponível</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((case_item) => (
                  <div key={case_item.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-white">{case_item.title}</p>
                      <p className="text-sm text-slate-400">
                        {case_item.case_number} - {case_item.status}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => generateReport(case_item.id)}
                        disabled={generating[case_item.id]}
                        className="btn-primary"
                      >
                        {generating[case_item.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCase(case_item.id);
                          setShowEmailModal(true);
                        }}
                        className="text-slate-300 border-slate-600"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        {activitySummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Atividades por Ação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activitySummary.activity_by_action.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <span className="text-slate-300">{item._id}</span>
                      <Badge className="bg-cyan-500">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activitySummary.recent_activity.slice(0, 10).map((log, index) => (
                    <div key={index} className="p-2 bg-slate-700 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400">{log.action}</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mt-1">{log.resource_type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md m-4">
              <CardHeader>
                <CardTitle className="text-white">Enviar Relatório por Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email do Destinatário
                  </label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="cliente@exemplo.com"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                    className="text-slate-300 border-slate-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={sendReportEmail}
                    className="btn-primary"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportsExport;
