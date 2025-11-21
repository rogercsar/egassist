import { CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * Componente de toast para exibir mensagens de sucesso
 */
export function SuccessToast({ 
  message, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 3000 
}: SuccessToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-4 animate-in slide-in-from-top-5 max-w-md">
      <CheckCircle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-green-600 rounded p-1 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}


