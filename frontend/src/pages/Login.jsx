import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    userType: 'client' // 'admin' or 'client'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (type) => {
    setLoginData(prev => ({
      ...prev,
      userType: type
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate input
      if (!loginData.email || !loginData.password) {
        toast.error('Por favor, preencha todos os campos');
        return;
      }

      // Real API authentication
      const response = await axios.post(`${API}/auth/login`, {
        email: loginData.email,
        password: loginData.password,
        role: loginData.userType === 'admin' ? 'administrator' : 'client'
      });

      const { user, token } = response.data;

      // Store user data in localStorage
      localStorage.setItem('ap_elite_user', JSON.stringify(user));
      localStorage.setItem('ap_elite_token', token);
      
      toast.success(`Bem-vindo(a), ${user.name}!`);
      
      // Redirect based on user type
      if (user.role === 'administrator') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro interno. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyan-500 bg-opacity-20 rounded-full">
              <Shield className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-cyan-400">AP</span> Elite
          </h1>
          <p className="text-slate-300">
            Portal de Acesso
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleUserTypeChange('admin')}
              className={`p-4 rounded-lg border-2 transition-all ${
                loginData.userType === 'admin' 
                  ? 'border-cyan-400 bg-cyan-500 bg-opacity-20' 
                  : 'border-slate-600 bg-slate-800'
              }`}
              data-testid="admin-type-button"
            >
              <div className="flex flex-col items-center space-y-2">
                <Shield className={`h-6 w-6 ${loginData.userType === 'admin' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${loginData.userType === 'admin' ? 'text-cyan-400' : 'text-slate-400'}`}>
                  Administrador
                </span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleUserTypeChange('client')}
              className={`p-4 rounded-lg border-2 transition-all ${
                loginData.userType === 'client' 
                  ? 'border-cyan-400 bg-cyan-500 bg-opacity-20' 
                  : 'border-slate-600 bg-slate-800'
              }`}
              data-testid="client-type-button"
            >
              <div className="flex flex-col items-center space-y-2">
                <Users className={`h-6 w-6 ${loginData.userType === 'client' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${loginData.userType === 'client' ? 'text-cyan-400' : 'text-slate-400'}`}>
                  Cliente
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {loginData.userType === 'admin' ? 'Acesso Administrativo' : 'Portal do Cliente'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="bg-slate-700 border-slate-600 text-white pl-10"
                    data-testid="login-email-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    placeholder="Sua senha"
                    className="bg-slate-700 border-slate-600 text-white pl-10 pr-10"
                    data-testid="login-password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    data-testid="toggle-password-button"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="btn-primary w-full py-3"
                disabled={isLoading}
                data-testid="login-submit-button"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Registration Info */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Não possui conta?</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p>Entre em contato para criar sua conta:</p>
              <div>
                <strong className="text-cyan-400">Perícia Digital:</strong> (11) 9 1646‑8611
              </div>
              <div>
                <strong className="text-green-400">Advocacia:</strong> (11) 9 7219‑0768
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Site Link */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
          >
            ← Voltar ao site principal
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;