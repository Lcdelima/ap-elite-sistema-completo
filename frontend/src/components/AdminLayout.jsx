import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/NotificationCenter';
import {
  BarChart3,
  Radio,
  Folder,
  Users,
  FileText,
  Shield,
  DollarSign,
  Mail,
  Calendar as CalendarIcon,
  LogOut,
  Menu,
  X,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('ap_elite_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ap_elite_user');
    localStorage.removeItem('ap_elite_token');
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard Inteligente',
      path: '/admin/smart-dashboard',
      icon: BarChart3,
      badge: 'Analytics',
      badgeColor: 'bg-cyan-500'
    },
    {
      title: 'Análise de Interceptação',
      path: '/admin/interception',
      icon: Radio,
      badge: 'IA',
      badgeColor: 'bg-purple-500'
    },
    {
      title: 'Gestão de Casos',
      path: '/admin/cases',
      icon: FileText
    },
    {
      title: 'Gestão de Clientes',
      path: '/admin/clients',
      icon: Users
    },
    {
      title: 'Perícia Digital',
      path: '/admin/forensics',
      icon: Shield
    },
    {
      title: 'Gestão Financeira',
      path: '/admin/financial',
      icon: DollarSign
    },
    {
      title: 'Comunicações',
      path: '/admin/communications',
      icon: Mail
    },
    {
      title: 'Calendário',
      path: '/admin/calendar',
      icon: CalendarIcon
    },
    {
      title: 'Relatórios e Exportação',
      path: '/admin/reports',
      icon: Download,
      badge: 'Novo',
      badgeColor: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4 fixed w-full z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-300 hover:text-white lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="text-2xl font-bold text-white">
              <span className="text-cyan-400">AP</span> Elite
            </div>
            <Badge className="bg-purple-500 text-white">ERP v2.0</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-slate-300 hidden md:block">Bem-vindo, {user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-slate-800 min-h-screen p-4 pt-20 lg:pt-4
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors
                    flex items-center justify-between
                    ${isActive 
                      ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' 
                      : 'text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge className={`${item.badgeColor} text-white text-xs`}>
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
