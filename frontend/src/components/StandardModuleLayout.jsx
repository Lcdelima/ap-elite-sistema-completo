import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Save, X, Plus, Edit, Trash2, Download, Upload,
  RefreshCw, Check, AlertCircle, Info, Home, Eye, Filter,
  Search, MoreVertical
} from 'lucide-react';

/**
 * StandardModuleLayout - Componente padrão para todos os módulos
 * Garante consistência visual e funcional em toda aplicação
 */
const StandardModuleLayout = ({ 
  children,
  title,
  subtitle,
  icon: Icon,
  color = 'cyan',
  category,
  showBackButton = true,
  backRoute = '/admin/athena',
  actions = [],
  headerContent = null,
  loading = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backRoute);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and Title */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
                  title="Voltar"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              )}
              
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={`p-3 rounded-xl bg-${color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {title}
                    {category && (
                      <Badge className={`bg-${color}-500/20 text-${color}-400 border-${color}-500/30 text-xs`}>
                        {category}
                      </Badge>
                    )}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <ActionButton key={index} {...action} />
              ))}
              
              <button
                onClick={() => navigate('/admin/athena')}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title="Página Inicial"
              >
                <Home className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Header Content (optional) */}
          {headerContent && (
            <div className="mt-4">
              {headerContent}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

/**
 * ActionButton - Botão padrão de ação
 */
const ActionButton = ({ 
  label, 
  icon: Icon, 
  onClick, 
  variant = 'default',
  disabled = false,
  loading = false,
  tooltip,
  className = ''
}) => {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    default: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'bg-transparent border-2 border-gray-600 hover:border-gray-500 text-gray-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {label && <span>{label}</span>}
    </button>
  );
};

/**
 * StandardCard - Card padrão do sistema
 */
const StandardCard = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  actions = [],
  className = '',
  headerColor = 'cyan'
}) => {
  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      {(title || Icon || actions.length > 0) && (
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`p-2 rounded-lg bg-${headerColor}-500/20`}>
                  <Icon className={`w-5 h-5 text-${headerColor}-400`} />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <ActionButton key={index} {...action} />
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
};

/**
 * StandardForm - Formulário padrão
 */
const StandardForm = ({ 
  children, 
  onSubmit, 
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading = false,
  className = ''
}) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      
      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
        {onCancel && (
          <ActionButton
            label={cancelLabel}
            icon={X}
            onClick={onCancel}
            variant="outline"
          />
        )}
        <ActionButton
          label={submitLabel}
          icon={loading ? RefreshCw : Save}
          variant="primary"
          loading={loading}
          type="submit"
        />
      </div>
    </form>
  );
};

/**
 * StandardTable - Tabela padrão
 */
const StandardTable = ({ 
  columns = [], 
  data = [], 
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Info className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-900/50">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-700/50' : ''} transition-colors`}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * StandardEmptyState - Estado vazio padrão
 */
const StandardEmptyState = ({ 
  icon: Icon = Info,
  title = 'Nenhum item encontrado',
  description,
  action
}) => {
  return (
    <div className="text-center py-16">
      <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
        <Icon className="w-12 h-12 text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <ActionButton {...action} />
      )}
    </div>
  );
};

/**
 * StandardAlert - Alert padrão
 */
const StandardAlert = ({ 
  type = 'info', 
  title, 
  message,
  onClose
}) => {
  const types = {
    info: { color: 'blue', icon: Info },
    success: { color: 'green', icon: Check },
    warning: { color: 'yellow', icon: AlertCircle },
    error: { color: 'red', icon: AlertCircle }
  };

  const config = types[type];
  const AlertIcon = config.icon;

  return (
    <div className={`p-4 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/30 mb-4`}>
      <div className="flex items-start gap-3">
        <AlertIcon className={`w-5 h-5 text-${config.color}-400 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`text-${config.color}-300 font-semibold mb-1`}>{title}</h4>
          )}
          {message && (
            <p className="text-gray-300 text-sm">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * StandardSearchBar - Barra de busca padrão
 */
const StandardSearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Buscar...', 
  onFilter,
  filters = []
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>
      
      {filters.length > 0 && (
        <button
          onClick={onFilter}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      )}
    </div>
  );
};

// Exports
export {
  StandardModuleLayout,
  ActionButton,
  StandardCard,
  StandardForm,
  StandardTable,
  StandardEmptyState,
  StandardAlert,
  StandardSearchBar
};

export default StandardModuleLayout;
