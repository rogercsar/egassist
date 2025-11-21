import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

/**
 * Componente de botão reutilizável com estados de loading
 */
export function Button({ 
  loading, 
  variant = 'primary', 
  children, 
  disabled, 
  icon,
  className = '',
  ...props 
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30',
    secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        px-6 py-3 rounded-lg font-semibold transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variant === 'primary' && !disabled && !loading ? 'hover:scale-105' : ''}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          Carregando...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon}
          {children}
        </span>
      )}
    </button>
  );
}


