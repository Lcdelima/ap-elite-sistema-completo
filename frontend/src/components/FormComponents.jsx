import React from 'react';
import { Info, AlertCircle, Check, X } from 'lucide-react';

/**
 * FormInput - Input padronizado do sistema
 */
export const FormInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 bg-gray-900 border rounded-lg text-white 
            placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500 focus:border-cyan-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="text-gray-500 text-sm flex items-center gap-1">
          <Info className="w-4 h-4" />
          {hint}
        </p>
      )}
    </div>
  );
};

/**
 * FormTextarea - Textarea padronizado
 */
export const FormTextarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  rows = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          w-full px-4 py-3 bg-gray-900 border rounded-lg text-white 
          placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
          resize-vertical
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500 focus:border-cyan-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="text-gray-500 text-sm flex items-center gap-1">
          <Info className="w-4 h-4" />
          {hint}
        </p>
      )}
    </div>
  );
};

/**
 * FormSelect - Select padronizado
 */
export const FormSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  required = false,
  disabled = false,
  error,
  hint,
  placeholder = 'Selecione...',
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 bg-gray-900 border rounded-lg text-white 
            focus:outline-none focus:ring-2 transition-all appearance-none
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500 focus:border-cyan-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="text-gray-500 text-sm flex items-center gap-1">
          <Info className="w-4 h-4" />
          {hint}
        </p>
      )}
    </div>
  );
};

/**
 * FormCheckbox - Checkbox padronizado
 */
export const FormCheckbox = ({ 
  label, 
  checked, 
  onChange, 
  disabled = false,
  error,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-5 h-5 rounded border-2 bg-gray-900 
            text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0
            transition-all cursor-pointer
            ${error ? 'border-red-500' : 'border-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <span className="text-sm text-gray-300 select-none">{label}</span>
      </label>
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * FormRadioGroup - Radio buttons padronizados
 */
export const FormRadioGroup = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  required = false,
  disabled = false,
  error,
  hint,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={disabled}
              className={`
                w-5 h-5 border-2 bg-gray-900 
                text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0
                transition-all cursor-pointer
                ${error ? 'border-red-500' : 'border-gray-700'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <span className="text-sm text-gray-300 select-none">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="text-gray-500 text-sm flex items-center gap-1">
          <Info className="w-4 h-4" />
          {hint}
        </p>
      )}
    </div>
  );
};

/**
 * FormFileUpload - Upload de arquivo padronizado
 */
export const FormFileUpload = ({ 
  label, 
  onChange, 
  accept,
  required = false,
  disabled = false,
  error,
  hint,
  multiple = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className={`
        relative border-2 border-dashed rounded-lg p-6 text-center
        transition-all cursor-pointer hover:border-cyan-500 hover:bg-gray-900/50
        ${error ? 'border-red-500' : 'border-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <input
          type="file"
          onChange={onChange}
          accept={accept}
          disabled={disabled}
          required={required}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-300">
              <span className="text-cyan-400 font-semibold">Clique para fazer upload</span> ou arraste e solte
            </p>
            {hint && (
              <p className="text-xs text-gray-500 mt-1">{hint}</p>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * FormSection - Seção de formulário com título
 */
export const FormSection = ({ 
  title, 
  subtitle,
  icon: Icon,
  children,
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
          {Icon && (
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Icon className="w-5 h-5 text-cyan-400" />
            </div>
          )}
          <div>
            {title && (
              <h3 className="text-lg font-bold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * FormGrid - Grid para layouts de formulário
 */
export const FormGrid = ({ 
  columns = 2, 
  children,
  className = '' 
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

/**
 * FormActions - Barra de ações do formulário
 */
export const FormActions = ({ 
  onSubmit, 
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading = false,
  submitIcon: SubmitIcon,
  cancelIcon: CancelIcon = X,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-end gap-3 pt-6 border-t border-gray-700 ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          {CancelIcon && <CancelIcon className="w-4 h-4" />}
          {cancelLabel}
        </button>
      )}
      
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading}
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          </>
        ) : (
          <>
            {SubmitIcon && <SubmitIcon className="w-4 h-4" />}
            {submitLabel}
          </>
        )}
      </button>
    </div>
  );
};

/**
 * FormAlert - Alert dentro de formulário
 */
export const FormAlert = ({ 
  type = 'info', 
  title, 
  message,
  onClose,
  className = '' 
}) => {
  const configs = {
    info: { color: 'blue', icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300' },
    success: { color: 'green', icon: Check, bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300' },
    warning: { color: 'yellow', icon: AlertCircle, bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300' },
    error: { color: 'red', icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300' }
  };
  
  const config = configs[type];
  const AlertIcon = config.icon;
  
  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertIcon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`${config.text} font-semibold mb-1`}>{title}</h4>
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
