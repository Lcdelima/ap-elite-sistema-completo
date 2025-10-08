import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, X, Phone, Mail, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = ({ showBackButton = false, title = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className="gradient-bg shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center space-x-4">
            {showBackButton ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-white hover:text-cyan-400 hover:bg-slate-800 p-2"
                data-testid="back-button"
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                Voltar
              </Button>
            ) : (
              <Link to="/" className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-white">
                  <span className="text-cyan-400">AP</span> Elite
                </div>
              </Link>
            )}
            
            {title && (
              <div className="text-xl font-semibold text-white ml-4">
                {title}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-cyan-400 bg-slate-800' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-800'
              }`}
              data-testid="nav-home"
            >
              Início
            </Link>
            <Link
              to="/services"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/services') 
                  ? 'text-cyan-400 bg-slate-800' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-800'
              }`}
              data-testid="nav-services"
            >
              Serviços
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-cyan-400 bg-slate-800' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-800'
              }`}
              data-testid="nav-about"
            >
              Sobre
            </Link>
            <Link
              to="/casos-sucesso"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/casos-sucesso') 
                  ? 'text-cyan-400 bg-slate-800' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-800'
              }`}
              data-testid="nav-casos"
            >
              Casos de Sucesso
            </Link>
            <Link
              to="/agendamento"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/agendamento') 
                  ? 'text-cyan-400 bg-slate-800' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-800'
              }`}
              data-testid="nav-agendamento"
            >
              Agendamento
            </Link>
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-cyan-400 bg-slate-800' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-800'
              }`}
              data-testid="nav-contact"
            >
              Contato
            </Link>
          </div>

          {/* Contact Info & Mobile menu button */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-6 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-xs">Perícia Digital: (11) 9 1646‑8611</span>
                  <span className="text-xs">Advocacia: (11) 9 7219‑0768</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>elitecdel@gmail.com</span>
              </div>
            </div>
            
            {/* Login Button */}
            <Link 
              to="/login" 
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              data-testid="header-login-button"
            >
              <User className="h-4 w-4" />
              <span>Portal de Acesso</span>
            </Link>
            
            <button
              className="md:hidden text-white hover:text-cyan-400 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-800 rounded-lg mt-2 mb-4 p-4" data-testid="mobile-menu">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-cyan-400 bg-slate-700' 
                    : 'text-white hover:text-cyan-400 hover:bg-slate-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-home"
              >
                Início
              </Link>
              <Link
                to="/services"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/services') 
                    ? 'text-cyan-400 bg-slate-700' 
                    : 'text-white hover:text-cyan-400 hover:bg-slate-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-services"
              >
                Serviços
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/about') 
                    ? 'text-cyan-400 bg-slate-700' 
                    : 'text-white hover:text-cyan-400 hover:bg-slate-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-about"
              >
                Sobre
              </Link>
              <Link
                to="/casos-sucesso"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/casos-sucesso') 
                    ? 'text-cyan-400 bg-slate-700' 
                    : 'text-white hover:text-cyan-400 hover:bg-slate-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-casos"
              >
                Casos de Sucesso
              </Link>
              <Link
                to="/agendamento"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/agendamento') 
                    ? 'text-cyan-400 bg-slate-700' 
                    : 'text-white hover:text-cyan-400 hover:bg-slate-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-agendamento"
              >
                Agendamento
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'text-cyan-400 bg-slate-700' 
                    : 'text-white hover:text-cyan-400 hover:bg-slate-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-contact"
              >
                Contato
              </Link>
              
              <div className="border-t border-slate-600 pt-3 mt-3">
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>(11) 9 1646‑8611</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>elitecdel@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>www.elitecdel.com.br</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;