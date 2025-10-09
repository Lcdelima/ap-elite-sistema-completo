import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const AthenaLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-blue-100 mt-1">{subtitle}</p>}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="text-white border-white hover:bg-white hover:text-cyan-600"
              >
                <Home className="h-4 w-4 mr-2" />
                Painel Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/athena')}
                className="text-white border-white hover:bg-white hover:text-cyan-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Athena Home
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-white border-white hover:bg-white hover:text-cyan-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
};

export default AthenaLayout;
