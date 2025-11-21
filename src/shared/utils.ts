/**
 * Utilitários compartilhados entre frontend e backend
 */

/**
 * Formata um valor numérico como moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata uma data completa em formato brasileiro
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formata uma data curta em formato brasileiro
 */
export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
};

/**
 * Formata um valor como porcentagem
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Sanitiza uma string removendo caracteres perigosos
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Valida um email
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Valida se um ID é numérico válido
 */
export const validateId = (id: string | undefined): boolean => {
  if (!id) return false;
  const numId = Number(id);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
};

/**
 * Valida se um valor numérico é positivo
 */
export const validatePositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};

/**
 * Valida se uma data é válida
 */
export const validateDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Sanitiza um objeto removendo propriedades undefined e sanitizando strings
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const sanitized: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof value === 'string') {
        sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
      } else {
        sanitized[key as keyof T] = value;
      }
    }
  }
  return sanitized;
};


