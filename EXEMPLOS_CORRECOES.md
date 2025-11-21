# Exemplos de Correções - EG Assist

Este documento contém exemplos práticos de código para implementar as correções mais críticas identificadas na análise.

---

## 1. Validação e Sanitização no Backend

### Problema: Endpoints sem validação adequada

### Solução: Middleware de validação e sanitização

```typescript
// src/worker/middleware/validation.ts
import { Context, Next } from 'hono';
import { z } from 'zod';

export const validateId = () => {
  return async (c: Context, next: Next) => {
    const id = c.req.param('id');
    if (!id || isNaN(Number(id))) {
      return c.json({ error: 'ID inválido' }, 400);
    }
    await next();
  };
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

// Uso no endpoint
app.get('/api/eventos/:id', validateId(), authMiddleware, async (c) => {
  // ...
});
```

---

## 2. Tratamento de Erros no Frontend

### Problema: Erros apenas no console

### Solução: Hook de tratamento de erros e componente de notificação

```typescript
// src/react-app/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown, userMessage?: string) => {
    console.error('Error:', err);
    const message = userMessage || 'Ocorreu um erro. Tente novamente.';
    setError(message);
    
    // Auto-dismiss após 5 segundos
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// src/react-app/components/ErrorToast.tsx
export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-4">
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">×</button>
    </div>
  );
}

// Uso em componentes
const { error, handleError, clearError } = useErrorHandler();

try {
  const response = await fetch('/api/eventos');
  if (!response.ok) {
    throw new Error('Falha ao carregar eventos');
  }
  const data = await response.json();
  setEventos(data);
} catch (err) {
  handleError(err, 'Não foi possível carregar os eventos');
}
```

---

## 3. Foreign Keys e Constraints no Banco

### Problema: Falta de integridade referencial

### Solução: Migration para adicionar constraints

```sql
-- migrations/4.sql

-- Adicionar foreign keys
CREATE TABLE IF NOT EXISTS eventos_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  contratante_id INTEGER,
  nome_evento TEXT NOT NULL,
  data_evento DATE NOT NULL,
  valor_total_receber REAL NOT NULL CHECK(valor_total_receber >= 0),
  valor_total_custos REAL DEFAULT 0 CHECK(valor_total_custos >= 0),
  status_evento TEXT DEFAULT 'Planejamento' CHECK(status_evento IN ('Planejamento', 'Confirmado', 'Concluído', 'Cancelado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contratante_id) REFERENCES contratantes(id) ON DELETE SET NULL
);

-- Migrar dados
INSERT INTO eventos_new SELECT * FROM eventos;

-- Recriar tabelas com foreign keys
DROP TABLE eventos;
ALTER TABLE eventos_new RENAME TO eventos;

-- Adicionar foreign keys em outras tabelas
CREATE TABLE IF NOT EXISTS vencimentos_receber_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL CHECK(valor > 0),
  data_vencimento DATE NOT NULL,
  status_pagamento TEXT DEFAULT 'Pendente' CHECK(status_pagamento IN ('Pendente', 'Pago', 'Cancelado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Repetir para outras tabelas...
```

---

## 4. Transações em Operações Críticas

### Problema: Operações não atômicas

### Solução: Usar transações do D1

```typescript
// src/worker/index.ts - Aplicar template com transação
app.post('/api/checklists/templates/:templateId/aplicar', authMiddleware, zValidator('json', applyTemplateSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const templateId = c.req.param('templateId');
  const { evento_id } = c.req.valid('json');

  // Verificar se evento existe e pertence ao usuário
  const evento = await c.env.DB.prepare(
    `SELECT * FROM eventos WHERE id = ? AND user_id = ?`
  ).bind(evento_id, user.id).first();

  if (!evento) {
    return c.json({ error: 'Evento não encontrado' }, 404);
  }

  // Buscar tarefas do template
  const { results: tarefasTemplate } = await c.env.DB.prepare(
    `SELECT * FROM tarefas_template WHERE template_id = ?`
  ).bind(templateId).all();

  if (!tarefasTemplate || tarefasTemplate.length === 0) {
    return c.json({ error: 'Template não possui tarefas' }, 400);
  }

  // Usar transação para garantir atomicidade
  try {
    const statements = tarefasTemplate.map((tarefa: any) =>
      c.env.DB.prepare(
        `INSERT INTO tarefas_evento (evento_id, user_id, descricao_tarefa, data_vencimento)
         VALUES (?, ?, ?, ?)`
      ).bind(
        evento_id,
        user.id,
        tarefa.descricao_tarefa,
        shiftDate(
          evento.data_evento,
          tarefa.prazo_relativo_dias,
          tarefa.tipo_prazo === 'depois' ? 'depois' : 'antes'
        )
      )
    );

    await c.env.DB.batch(statements);

    return c.json({ success: true, tarefas_geradas: tarefasTemplate.length });
  } catch (error) {
    console.error('Error applying template:', error);
    return c.json({ error: 'Falha ao aplicar template' }, 500);
  }
});
```

---

## 5. Confirmação em Ações Destrutivas

### Problema: Deletar sem confirmação

### Solução: Componente de confirmação

```typescript
// src/react-app/components/ConfirmDialog.tsx
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: 'bg-blue-500 hover:bg-blue-600'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Uso no componente
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [docToDelete, setDocToDelete] = useState<number | null>(null);

const handleDeleteClick = (docId: number) => {
  setDocToDelete(docId);
  setShowDeleteConfirm(true);
};

const handleDeleteConfirm = async () => {
  if (!docToDelete) return;
  
  try {
    const response = await fetch(`/api/eventos/${id}/documentos/${docToDelete}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      setDocumentos(documentos.filter(doc => doc.id !== docToDelete));
      // Mostrar mensagem de sucesso
    }
  } catch (error) {
    handleError(error, 'Falha ao deletar documento');
  } finally {
    setShowDeleteConfirm(false);
    setDocToDelete(null);
  }
};

// No JSX
<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Deletar Documento"
  message="Tem certeza que deseja deletar este documento? Esta ação não pode ser desfeita."
  confirmText="Deletar"
  cancelText="Cancelar"
  variant="danger"
  onConfirm={handleDeleteConfirm}
  onCancel={() => {
    setShowDeleteConfirm(false);
    setDocToDelete(null);
  }}
/>
```

---

## 6. Rate Limiting

### Problema: Sem limite de requisições

### Solução: Middleware de rate limiting usando Cloudflare KV

```typescript
// src/worker/middleware/rateLimit.ts
import { Context, Next } from 'hono';

interface RateLimitOptions {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições
  keyGenerator?: (c: Context) => string; // Função para gerar chave única
}

export const rateLimit = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    const key = options.keyGenerator 
      ? options.keyGenerator(c) 
      : c.req.header('cf-connecting-ip') || 'unknown';
    
    const cacheKey = `ratelimit:${key}`;
    
    // Usar Cloudflare Cache API ou implementar com D1
    // Por enquanto, implementação simples com D1
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // Verificar requisições na janela
    const { results } = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM rate_limits 
       WHERE key = ? AND timestamp > ?`
    ).bind(cacheKey, windowStart).first();
    
    const count = (results as any)?.count || 0;
    
    if (count >= options.maxRequests) {
      return c.json(
        { error: 'Muitas requisições. Tente novamente mais tarde.' },
        429
      );
    }
    
    // Registrar requisição
    await c.env.DB.prepare(
      `INSERT INTO rate_limits (key, timestamp) VALUES (?, ?)`
    ).bind(cacheKey, now).run();
    
    // Limpar registros antigos (pode ser feito em background)
    await c.env.DB.prepare(
      `DELETE FROM rate_limits WHERE timestamp < ?`
    ).bind(windowStart).run();
    
    await next();
  };
};

// Migration para tabela de rate limiting
// migrations/5.sql
CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE INDEX idx_rate_limits_key_timestamp ON rate_limits(key, timestamp);

// Uso
app.post('/api/eventos', 
  rateLimit({ windowMs: 60000, maxRequests: 10 }), // 10 req/min
  authMiddleware, 
  zValidator('json', createEventoSchema), 
  async (c) => {
    // ...
  }
);
```

---

## 7. Paginação

### Problema: Carregar todos os registros

### Solução: Implementar paginação no backend e frontend

```typescript
// Backend - src/worker/index.ts
app.get('/api/eventos', authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  // Buscar total de registros
  const { results: countResult } = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM eventos WHERE user_id = ?`
  ).bind(user.id).first();

  const total = (countResult as any)?.total || 0;

  // Buscar registros paginados
  const { results } = await c.env.DB.prepare(
    `SELECT e.*, c.nome as contratante_nome 
     FROM eventos e 
     LEFT JOIN contratantes c ON e.contratante_id = c.id
     WHERE e.user_id = ? 
     ORDER BY e.data_evento DESC
     LIMIT ? OFFSET ?`
  ).bind(user.id, limit, offset).all();

  return c.json({
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// Frontend - src/react-app/components/Pagination.tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === page
              ? 'bg-amber-500 text-white'
              : 'border border-slate-300 hover:bg-slate-50'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Próxima
      </button>
    </div>
  );
}
```

---

## 8. Utilitários Compartilhados

### Problema: Código duplicado

### Solução: Criar arquivo de utilitários

```typescript
// src/shared/utils.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
```

---

## 9. Validação de Formulários em Tempo Real

### Problema: Validação apenas no submit

### Solução: Hook de validação

```typescript
// src/react-app/hooks/useFormValidation.ts
import { useState, useCallback } from 'react';

interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = useCallback((name: keyof T, value: any): string | null => {
    const fieldRules = rules[name as string];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  }, [rules]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    }
  }, [touched, validate]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  }, [values, validate]);

  const isValid = useCallback(() => {
    return Object.keys(rules).every(key => {
      const error = validate(key as keyof T, values[key as keyof T]);
      return !error;
    });
  }, [values, rules, validate]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    setValues
  };
}

// Uso
const { values, errors, touched, handleChange, handleBlur, isValid } = useFormValidation(
  { nome_evento: '', valor_total_receber: '' },
  {
    nome_evento: [
      { validator: (v) => v.length > 0, message: 'Nome é obrigatório' },
      { validator: (v) => v.length >= 3, message: 'Nome deve ter pelo menos 3 caracteres' }
    ],
    valor_total_receber: [
      { validator: (v) => v > 0, message: 'Valor deve ser maior que zero' }
    ]
  }
);
```

---

## 10. Loading States Consistentes

### Problema: Loading states inconsistentes

### Solução: Componente de loading reutilizável

```typescript
// src/react-app/components/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-amber-500 border-t-transparent ${sizeClasses[size]}`} />
  );
}

// src/react-app/components/PageLoader.tsx
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// src/react-app/components/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ loading, variant = 'primary', children, disabled, ...props }: ButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white',
    secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          Carregando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
```

---

Estes exemplos cobrem as correções mais críticas. Implemente-os gradualmente, testando cada mudança antes de prosseguir.


