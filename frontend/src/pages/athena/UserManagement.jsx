import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Key, Shield, Search, Filter } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState({});
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // all, employees, clients
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'viewer',
    user_type: 'employee',
    phone: '',
    cpf: '',
    department: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchStats();
  }, [activeTab, filterRole]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${BACKEND_URL}/api/users/list?`;
      if (activeTab !== 'all') url += `user_type=${activeTab === 'employees' ? 'employee' : 'client'}&`;
      if (filterRole) url += `role=${filterRole}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/roles/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRoles(data.roles || {});
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingUser 
        ? `${BACKEND_URL}/api/users/${editingUser.id}`
        : `${BACKEND_URL}/api/users/create`;
      
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser 
        ? { ...formData, password: formData.password || undefined }
        : formData;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert(editingUser ? 'Usuário atualizado!' : 'Usuário criado!');
        setShowModal(false);
        setEditingUser(null);
        setFormData({
          email: '', password: '', name: '', role: 'viewer',
          user_type: 'employee', phone: '', cpf: '', department: ''
        });
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.success("Erro ao salvar usuário");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      user_type: user.user_type,
      phone: user.phone || '',
      cpf: user.cpf || '',
      department: user.department || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Deseja realmente desativar este usuário?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Usuário desativado com sucesso!");
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Digite a nova senha:');
    if (!newPassword) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (response.ok) {
        toast.success("Senha redefinida com sucesso!");
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-700',
      admin: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      lawyer: 'bg-green-100 text-green-700',
      analyst: 'bg-yellow-100 text-yellow-700',
      client: 'bg-gray-100 text-gray-700',
      viewer: 'bg-slate-100 text-slate-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">Gerenciamento de Usuários</h1>
          <p className="text-purple-100">Controle de usuários, permissões e acessos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_users || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Funcionários</p>
                <p className="text-2xl font-bold text-purple-600">{stats.employees || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.clients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-4 py-2 rounded ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                Funcionários
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded ${activeTab === 'clients' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                Clientes
              </button>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  email: '', password: '', name: '', role: 'viewer',
                  user_type: 'employee', phone: '', cpf: '', department: ''
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Todos os perfis</option>
              {Object.entries(roles).map(([key, role]) => (
                <option key={key} value={key}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    {user.department && <div className="text-sm text-gray-500">{user.department}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${getRoleBadgeColor(user.role)}`}>
                      {roles[user.role]?.name || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.user_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo*</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={editingUser}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {editingUser ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha*'}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Departamento</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo*</label>
                    <select
                      value={formData.user_type}
                      onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="employee">Funcionário</option>
                      <option value="client">Cliente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Perfil/Permissão*</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {Object.entries(roles).map(([key, role]) => (
                        <option key={key} value={key}>
                          {role.name} (Nível {role.level})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default UserManagement;
