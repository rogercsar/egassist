import { Context, Next } from 'hono';
import { validateId as validateIdUtil } from '../../shared/utils';

/**
 * Middleware para validar se o ID do parâmetro é válido
 */
export const validateId = () => {
  return async (c: Context, next: Next) => {
    const id = c.req.param('id');
    if (!validateIdUtil(id)) {
      return c.json({ error: 'ID inválido' }, 400);
    }
    await next();
  };
};

/**
 * Middleware para validar múltiplos IDs
 */
export const validateIds = (...paramNames: string[]) => {
  return async (c: Context, next: Next) => {
    for (const paramName of paramNames) {
      const id = c.req.param(paramName);
      if (!validateIdUtil(id)) {
        return c.json({ error: `${paramName} inválido` }, 400);
      }
    }
    await next();
  };
};


