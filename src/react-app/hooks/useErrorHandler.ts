import { useState, useCallback } from 'react';

interface ErrorHandler {
  error: string | null;
  handleError: (err: unknown, userMessage?: string) => void;
  clearError: () => void;
}

/**
 * Hook para gerenciar erros de forma centralizada
 */
export function useErrorHandler(): ErrorHandler {
  const [error, setError] = useState<string | null>(null);

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
    
    setError(message);
    
    // Auto-dismiss após 5 segundos
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}


