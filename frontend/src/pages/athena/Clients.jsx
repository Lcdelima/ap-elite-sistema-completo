import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Phone, Mail, Building } from 'lucide-react';
import { toast } from 'sonner';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    company: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setClients(res.data.clients);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar clientes');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(`${BACKEND_URL}/api/athena/clients`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Cliente criado com sucesso!');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', cpf: '', company: '', address: '' });
      fetchClients();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar cliente');
    }
  };

  return (
    <AthenaLayout title="Gestão de Clientes" subtitle="CRM Completo">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Clientes Cadastrados</h2>
          <Button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {loading ? (
          <div className="text-white text-center py-12">Carregando...</div>
        ) : clients.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-4">Nenhum cliente cadastrado</p>
              <Button onClick={() => setShowModal(true)} className="btn-primary">
                Adicionar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-cyan-400" />
                    {client.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-slate-300 text-sm">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {client.email}
                  </div>
                  <div className="flex items-center text-slate-300 text-sm">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    {client.phone}
                  </div>
                  {client.company && (
                    <div className="flex items-center text-slate-300 text-sm">
                      <Building className="h-4 w-4 mr-2 text-slate-400" />
                      {client.company}
                    </div>
                  )}
                  <div className="pt-2">
                    <Badge className="bg-cyan-500">CPF: {client.cpf}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md m-4">
              <CardHeader>
                <CardTitle className="text-white">Novo Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nome *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">CPF *</label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      className="text-slate-300 border-slate-600"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="btn-primary">
                      Criar Cliente
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default Clients;