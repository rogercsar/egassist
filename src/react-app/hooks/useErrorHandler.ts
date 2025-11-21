import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';

interface ErrorHandler {
  error: string | null;
  handleError: (err: unknown, userMessage?: string) => void;
  clearError: () => void;
}

/**
 * Hook para gerenciar erros de forma centralizada usando ToastContext
 */
export function useErrorHandler(): ErrorHandler {
  const { showError } = useToast();

  const handleError = useCallback((err: unknown, userMessage?: string) => {
    console.error('Error:', err);

    let message = userMessage;

    if (!message) {
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else {
        message = 'Ocorreu um erro. Tente novamente.';
      }
    }

    showError(message);
  }, [showError]);

  const clearError = useCallback(() => {
    // No-op since toasts handle their own dismissal
  }, []);

  return { error: null, handleError, clearError };
}


