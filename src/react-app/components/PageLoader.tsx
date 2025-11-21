import { LoadingSpinner } from './LoadingSpinner';

/**
 * Componente de loading para páginas inteiras
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}


