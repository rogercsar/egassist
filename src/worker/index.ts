import { Hono } from "hono";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { validateId, validateIds } from "./middleware/validation";
import { rateLimit } from "./middleware/rateLimit";
import { sanitizeString } from "../shared/utils";

const app = new Hono<{ Bindings: Env }>();

// Global Error Handler
app.onError((err, c) => {
  console.error('Global Error:', err);
  if (err instanceof z.ZodError) {
    return c.json({ error: 'Validation Error', details: err.errors }, 400);
  }
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// Middleware to enable Foreign Keys for D1
app.use(async (c, next) => {
  // Enforce foreign keys for every request that might use the DB
  // Note: D1 might not persist this across requests, so we run it per request if needed.
  // However, for performance, we might want to batch it with queries, but Hono middleware is a good place to start.
  try {
    await c.env.DB.prepare('PRAGMA foreign_keys = ON').run();
  } catch (e) {
    console.error('Failed to enable foreign keys:', e);
  }
  await next();
});

// Rate Limiting (100 requests per minute)
app.use(rateLimit({ limit: 100, windowMs: 60 * 1000 }));


// OAuth redirect URL
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

// Exchange code for session token
app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  const isHttps = c.req.header("x-forwarded-proto") === "https";
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

// Get current user
app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

// Logout
app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  const isHttps = c.req.header('x-forwarded-proto') === 'https';
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Dashboard stats
app.get('/api/dashboard/stats', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const sixMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().split('T')[0];
  const endOfWindow = endOfMonth;
  const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Execute all queries in parallel
  const [
    { results: receivablesMonth },
    { results: overduePayments },
    { results: upcomingEvents },
    { results: receitaSeries },
    { results: despesaSeries },
    { results: margemBruta },
    { results: pendReceber },
    { results: pendPagar },
    { results: fluxoReceitas },
    { results: fluxoDespesas }
  ] = await Promise.all([
    // A Receber (Mês)
    c.env.DB.prepare(
      `SELECT SUM(valor) as total FROM vencimentos_receber 
       WHERE user_id = ? AND status_pagamento = 'Pendente' 
       AND data_vencimento BETWEEN ? AND ?`
    ).bind(user.id, startOfMonth, endOfMonth).all(),

    // Pagamentos Atrasados
    c.env.DB.prepare(
      `SELECT COUNT(*) as count, SUM(valor) as total FROM vencimentos_receber 
       WHERE user_id = ? AND status_pagamento = 'Pendente' 
       AND data_vencimento < ?`
    ).bind(user.id, today).all(),

    // Próximos Eventos (30 dias)
    c.env.DB.prepare(
      `SELECT e.*, c.nome as contratante_nome 
       FROM eventos e 
       LEFT JOIN contratantes c ON e.contratante_id = c.id
       WHERE e.user_id = ? AND e.data_evento BETWEEN ? AND ?
       ORDER BY e.data_evento ASC`
    ).bind(user.id, today, thirtyDaysFromNow).all(),

    // Séries financeiras (últimos 6 meses)
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m', data_vencimento) as periodo, SUM(valor) as total 
       FROM vencimentos_receber
       WHERE user_id = ? AND data_vencimento BETWEEN ? AND ?
         AND status_pagamento != 'Cancelado'
       GROUP BY periodo
       ORDER BY periodo ASC`
    ).bind(user.id, sixMonthsAgo, endOfWindow).all(),

    c.env.DB.prepare(
      `SELECT strftime('%Y-%m', data_vencimento) as periodo, SUM(valor) as total 
       FROM vencimentos_pagar
       WHERE user_id = ? AND data_vencimento BETWEEN ? AND ?
         AND status_pagamento != 'Cancelado'
       GROUP BY periodo
       ORDER BY periodo ASC`
    ).bind(user.id, sixMonthsAgo, endOfWindow).all(),

    // Margem Bruta
    c.env.DB.prepare(
      `SELECT SUM(valor_total_receber) as receita_total, SUM(valor_total_custos) as custo_total
       FROM eventos
       WHERE user_id = ?`
    ).bind(user.id).all(),

    // Pendentes Receber
    c.env.DB.prepare(
      `SELECT SUM(valor) as total
       FROM vencimentos_receber
       WHERE user_id = ? AND status_pagamento = 'Pendente'`
    ).bind(user.id).all(),

    // Pendentes Pagar
    c.env.DB.prepare(
      `SELECT SUM(valor) as total
       FROM vencimentos_pagar
       WHERE user_id = ? AND status_pagamento = 'Pendente'`
    ).bind(user.id).all(),

    // Fluxo Receitas
    c.env.DB.prepare(
      `SELECT data_vencimento, SUM(valor) as total
       FROM vencimentos_receber
       WHERE user_id = ? AND data_vencimento BETWEEN ? AND ? AND status_pagamento != 'Cancelado'
       GROUP BY data_vencimento
       ORDER BY data_vencimento ASC`
    ).bind(user.id, today, ninetyDaysFromNow).all(),

    // Fluxo Despesas
    c.env.DB.prepare(
      `SELECT data_vencimento, SUM(valor) as total
       FROM vencimentos_pagar
       WHERE user_id = ? AND data_vencimento BETWEEN ? AND ? AND status_pagamento != 'Cancelado'
       GROUP BY data_vencimento
       ORDER BY data_vencimento ASC`
    ).bind(user.id, today, ninetyDaysFromNow).all()
  ]);

  const monthsWindow = (() => {
    const arr = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7);
      arr.push({
        key,
        label: date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
      });
    }
    return arr;
  })();

  const series = monthsWindow.map((month) => {
    const receita = Number(receitaSeries.find((item: any) => item.periodo === month.key)?.total || 0);
    const despesa = Number(despesaSeries.find((item: any) => item.periodo === month.key)?.total || 0);
    return {
      period: month.label,
      receita,
      despesa,
      lucro: receita - despesa,
      margem: receita > 0 ? ((receita - despesa) / receita) * 100 : 0,
    };
  });

  const receitaTotal = Number(margemBruta[0]?.receita_total || 0);
  const custoTotal = Number(margemBruta[0]?.custo_total || 0);
  const lucroTotal = receitaTotal - custoTotal;

  const cashPosition = Number(pendReceber[0]?.total || 0) - Number(pendPagar[0]?.total || 0);

  const fluxoDatas = Array.from(
    new Set([
      ...fluxoReceitas.map((item: any) => item.data_vencimento),
      ...fluxoDespesas.map((item: any) => item.data_vencimento),
    ])
  ).sort();

  const cashflowProjection = fluxoDatas.map((date) => ({
    date,
    receita: fluxoReceitas.find((item: any) => item.data_vencimento === date)?.total || 0,
    despesa: fluxoDespesas.find((item: any) => item.data_vencimento === date)?.total || 0,
  }));

  return c.json({
    receivablesMonth: receivablesMonth[0]?.total || 0,
    overduePayments: {
      count: overduePayments[0]?.count || 0,
      total: overduePayments[0]?.total || 0
    },
    upcomingEvents: upcomingEvents || [],
    financialSeries: series,
    marginAnalysis: {
      receitaTotal,
      custoTotal,
      lucroTotal,
      margemPercentual: receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0,
    },
    cashPosition,
    cashflowProjection
  });
});

const respondUnauthorized = (c: any) => c.json({ error: 'Unauthorized' }, 401);

const parseDateString = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date;
};

const shiftDate = (baseDate: string, relativeDays: number, direction: 'antes' | 'depois') => {
  const date = parseDateString(baseDate);
  const shift = relativeDays * 24 * 60 * 60 * 1000;
  const newDate = new Date(direction === 'antes' ? date.getTime() - shift : date.getTime() + shift);
  return newDate.toISOString().split('T')[0];
};

const getUserFromContext = (c: any) => {
  const user = c.get('user');
  if (!user) {
    return null;
  }
  return user;
};

// Eventos endpoints
app.get('/api/eventos', authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT e.*, c.nome as contratante_nome 
     FROM eventos e 
     LEFT JOIN contratantes c ON e.contratante_id = c.id
     WHERE e.user_id = ? 
     ORDER BY e.data_evento DESC`
  ).bind(user.id).all();

  return c.json(results);
});

app.get('/api/eventos/:id', validateId(), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const id = c.req.param('id');

  try {
    const evento = await c.env.DB.prepare(
      `SELECT e.*, c.nome as contratante_nome, c.email as contratante_email, c.telefone as contratante_telefone
       FROM eventos e 
       LEFT JOIN contratantes c ON e.contratante_id = c.id
       WHERE e.id = ? AND e.user_id = ?`
    ).bind(id, user.id).first();

    if (!evento) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }

    return c.json(evento);
  } catch (error) {
    console.error('Error fetching evento:', error);
    return c.json({ error: 'Erro ao buscar evento' }, 500);
  }
});

const createEventoSchema = z.object({
  contratante_id: z.number().int().optional().nullable(),
  nome_evento: z.string().min(1),
  data_evento: z.string().min(1),
  valor_total_receber: z.number(),
  valor_total_custos: z.number().optional(),
  status_evento: z.enum(['Planejamento', 'Confirmado', 'Concluído', 'Cancelado']).optional()
});

app.post('/api/eventos', authMiddleware, zValidator('json', createEventoSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }
  const body = c.req.valid('json');

  // Sanitizar dados de entrada
  const sanitizedData = {
    ...body,
    nome_evento: sanitizeString(body.nome_evento),
    contratante_id: body.contratante_id ?? null,
    valor_total_custos: body.valor_total_custos ?? 0,
    status_evento: body.status_evento ?? 'Planejamento'
  };

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO eventos (user_id, contratante_id, nome_evento, data_evento, valor_total_receber, valor_total_custos, status_evento)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user.id,
      sanitizedData.contratante_id,
      sanitizedData.nome_evento,
      sanitizedData.data_evento,
      sanitizedData.valor_total_receber,
      sanitizedData.valor_total_custos,
      sanitizedData.status_evento
    ).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating evento:', error);
    return c.json({ error: 'Erro ao criar evento' }, 500);
  }
});

// Documentos de eventos
app.get('/api/eventos/:id/documentos', validateId(), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const eventoId = c.req.param('id');

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, nome_arquivo, tipo_documento, mime_type, tamanho, created_at 
       FROM documentos_evento
       WHERE evento_id = ? AND user_id = ?
       ORDER BY created_at DESC`
    ).bind(eventoId, user.id).all();

    return c.json(results || []);
  } catch (error) {
    console.error('Error fetching documentos:', error);
    return c.json({ error: 'Erro ao buscar documentos' }, 500);
  }
});

app.post('/api/eventos/:id/documentos', validateId(), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const eventoId = c.req.param('id');

  // Verificar se evento existe e pertence ao usuário
  try {
    const evento = await c.env.DB.prepare(
      `SELECT id FROM eventos WHERE id = ? AND user_id = ?`
    ).bind(eventoId, user.id).first();

    if (!evento) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }
  } catch (error) {
    console.error('Error verifying evento:', error);
    return c.json({ error: 'Erro ao verificar evento' }, 500);
  }

  const formData = await c.req.formData();
  const file = formData.get('file');
  const tipoDocumento = sanitizeString(formData.get('tipo_documento')?.toString() || 'Outro');

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Arquivo inválido' }, 400);
  }

  // Type guard: ensure file is a File object
  const fileObj = file as File;

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ];
  const maxSize = 5 * 1024 * 1024;
  if (fileObj.size > maxSize) {
    return c.json({ error: 'Arquivo excede 5MB' }, 400);
  }
  if (fileObj.type && !allowedTypes.includes(fileObj.type)) {
    return c.json({ error: 'Tipo de arquivo não permitido' }, 400);
  }

  try {
    const arrayBuffer = await fileObj.arrayBuffer();
    const sanitizedFileName = sanitizeString(fileObj.name);

    const key = `users/${user.id}/eventos/${eventoId}/${Date.now()}_${sanitizedFileName}`;
    await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: fileObj.type || 'application/octet-stream',
        contentDisposition: `attachment; filename="${sanitizedFileName}"`
      }
    });

    const result = await c.env.DB.prepare(
      `INSERT INTO documentos_evento (evento_id, user_id, nome_arquivo, tipo_documento, mime_type, tamanho, r2_key)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      eventoId,
      user.id,
      sanitizedFileName,
      tipoDocumento,
      fileObj.type || 'application/octet-stream',
      fileObj.size,
      key
    ).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error uploading documento:', error);
    return c.json({ error: 'Erro ao fazer upload do documento' }, 500);
  }
});

app.get('/api/eventos/:id/documentos/:docId/download', validateIds('id', 'docId'), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const eventoId = c.req.param('id');
  const docId = c.req.param('docId');

  try {
    const documento = await c.env.DB.prepare(
      `SELECT nome_arquivo, mime_type, r2_key 
       FROM documentos_evento
       WHERE id = ? AND evento_id = ? AND user_id = ?`
    ).bind(docId, eventoId, user.id).first();

    if (!documento) {
      return c.json({ error: 'Documento não encontrado' }, 404);
    }

    const doc = documento as { nome_arquivo: string | null; mime_type: string | null; r2_key: string | null };
    if (doc.r2_key) {
      const obj = await c.env.R2_BUCKET.get(doc.r2_key);
      if (obj && obj.body) {
        return new Response(obj.body, {
          headers: {
            'Content-Type': String(doc.mime_type || 'application/octet-stream'),
            'Content-Disposition': `attachment; filename="${String(doc.nome_arquivo)}"`
          }
        });
      }
    }

    return c.json({ error: 'Documento não encontrado no armazenamento' }, 404);
  } catch (error) {
    console.error('Error downloading documento:', error);
    return c.json({ error: 'Erro ao baixar documento' }, 500);
  }
});

app.delete('/api/eventos/:id/documentos/:docId', validateIds('id', 'docId'), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const eventoId = c.req.param('id');
  const docId = c.req.param('docId');

  try {
    const doc = await c.env.DB.prepare(
      `SELECT r2_key FROM documentos_evento WHERE id = ? AND evento_id = ? AND user_id = ?`
    ).bind(docId, eventoId, user.id).first();

    if (!doc) {
      return c.json({ error: 'Documento não encontrado' }, 404);
    }

    // Deletar do R2 se existir
    const docWithKey = doc as { r2_key: string | null };
    if (docWithKey.r2_key) {
      try {
        await c.env.R2_BUCKET.delete(docWithKey.r2_key);
      } catch (error) {
        console.error('Error deleting from R2:', error);
        // Continuar mesmo se falhar no R2
      }
    }

    // Deletar do banco
    await c.env.DB.prepare(
      `DELETE FROM documentos_evento WHERE id = ? AND evento_id = ? AND user_id = ?`
    ).bind(docId, eventoId, user.id).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting documento:', error);
    return c.json({ error: 'Erro ao deletar documento' }, 500);
  }
});

// Contratantes endpoints
app.get('/api/contratantes', authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM contratantes WHERE user_id = ? ORDER BY nome ASC'
  ).bind(user.id).all();

  return c.json(results);
});

const createContratanteSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable()
});

app.post('/api/contratantes', authMiddleware, zValidator('json', createContratanteSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }
  const body = c.req.valid('json');

  // Sanitizar dados
  const sanitizedData = {
    nome: sanitizeString(body.nome),
    email: body.email ? sanitizeString(body.email) : null,
    telefone: body.telefone ? sanitizeString(body.telefone) : null
  };

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO contratantes (user_id, nome, email, telefone)
       VALUES (?, ?, ?, ?)`
    ).bind(user.id, sanitizedData.nome, sanitizedData.email, sanitizedData.telefone).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating contratante:', error);
    return c.json({ error: 'Erro ao criar contratante' }, 500);
  }
});

app.get('/api/contratantes/:id', validateId(), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const contratanteId = c.req.param('id');

  try {
    const contratante = await c.env.DB.prepare(
      `SELECT * FROM contratantes WHERE id = ? AND user_id = ?`
    ).bind(contratanteId, user.id).first();

    if (!contratante) {
      return c.json({ error: 'Contratante não encontrado' }, 404);
    }

    const { results: eventos } = await c.env.DB.prepare(
      `SELECT * FROM eventos WHERE contratante_id = ? AND user_id = ? ORDER BY data_evento DESC`
    ).bind(contratanteId, user.id).all();

    const totalReceita = eventos.reduce((sum: number, evento: any) => sum + (evento.valor_total_receber || 0), 0);
    const totalLucro = eventos.reduce(
      (sum: number, evento: any) => sum + ((evento.valor_total_receber || 0) - (evento.valor_total_custos || 0)),
      0
    );

    const stats = {
      totalEventos: eventos.length,
      totalReceita,
      totalLucro,
      margemMedia: totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0,
      ultimoEvento: eventos[0] || null,
      proximoEvento: eventos
        .filter((evento: any) => new Date(evento.data_evento) >= new Date())
        .sort((a: any, b: any) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())[0] || null
    };

    return c.json({
      contratante,
      eventos,
      stats
    });
  } catch (error) {
    console.error('Error fetching contratante details:', error);
    return c.json({ error: 'Erro ao buscar detalhes do contratante' }, 500);
  }
});

// Recebiveis endpoints
app.get('/api/recebiveis', authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT vr.*, e.nome_evento as evento_nome 
     FROM vencimentos_receber vr 
     JOIN eventos e ON vr.evento_id = e.id
     WHERE vr.user_id = ? 
     ORDER BY vr.data_vencimento ASC`
  ).bind(user.id).all();

  return c.json(results);
});

const createRecebivelSchema = z.object({
  evento_id: z.number().int(),
  descricao: z.string().min(1),
  valor: z.number(),
  data_vencimento: z.string().min(1),
  status_pagamento: z.enum(['Pendente', 'Pago', 'Cancelado']).optional()
});

app.post('/api/recebiveis', authMiddleware, zValidator('json', createRecebivelSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }
  const body = c.req.valid('json');

  // Verificar se evento existe e pertence ao usuário
  try {
    const evento = await c.env.DB.prepare(
      `SELECT id FROM eventos WHERE id = ? AND user_id = ?`
    ).bind(body.evento_id, user.id).first();

    if (!evento) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }
  } catch (error) {
    console.error('Error verifying evento:', error);
    return c.json({ error: 'Erro ao verificar evento' }, 500);
  }

  // Sanitizar dados
  const sanitizedData = {
    descricao: sanitizeString(body.descricao),
    valor: body.valor,
    data_vencimento: body.data_vencimento,
    status_pagamento: body.status_pagamento ?? 'Pendente'
  };

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO vencimentos_receber (user_id, evento_id, descricao, valor, data_vencimento, status_pagamento)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      user.id,
      body.evento_id,
      sanitizedData.descricao,
      sanitizedData.valor,
      sanitizedData.data_vencimento,
      sanitizedData.status_pagamento
    ).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating recebivel:', error);
    return c.json({ error: 'Erro ao criar recebível' }, 500);
  }
});

const patchRecebivelSchema = z.object({
  status_pagamento: z.enum(['Pendente', 'Pago', 'Cancelado'])
});

app.patch('/api/recebiveis/:id', authMiddleware, zValidator('json', patchRecebivelSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const id = c.req.param('id');
  const body = c.req.valid('json');

  await c.env.DB.prepare(
    `UPDATE vencimentos_receber SET status_pagamento = ? WHERE id = ? AND user_id = ?`
  ).bind(body.status_pagamento, id, user.id).run();

  return c.json({ success: true });
});

// Pagaveis endpoints
app.get('/api/pagaveis', authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT vp.*, e.nome_evento as evento_nome, f.nome_fornecedor as fornecedor_nome
     FROM vencimentos_pagar vp 
     JOIN eventos e ON vp.evento_id = e.id
     LEFT JOIN fornecedores f ON vp.fornecedor_id = f.id
     WHERE vp.user_id = ? 
     ORDER BY vp.data_vencimento ASC`
  ).bind(user.id).all();

  return c.json(results);
});

const createPagavelSchema = z.object({
  evento_id: z.number().int(),
  fornecedor_id: z.number().int().optional().nullable(),
  descricao: z.string().min(1),
  valor: z.number(),
  data_vencimento: z.string().min(1),
  status_pagamento: z.enum(['Pendente', 'Pago', 'Cancelado']).optional()
});

app.post('/api/pagaveis', authMiddleware, zValidator('json', createPagavelSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }
  const body = c.req.valid('json');

  // Verificar se evento existe e pertence ao usuário
  try {
    const evento = await c.env.DB.prepare(
      `SELECT id FROM eventos WHERE id = ? AND user_id = ?`
    ).bind(body.evento_id, user.id).first();

    if (!evento) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }

    // Se fornecedor_id foi fornecido, verificar se existe e pertence ao usuário
    if (body.fornecedor_id) {
      const fornecedor = await c.env.DB.prepare(
        `SELECT id FROM fornecedores WHERE id = ? AND user_id = ?`
      ).bind(body.fornecedor_id, user.id).first();

      if (!fornecedor) {
        return c.json({ error: 'Fornecedor não encontrado' }, 404);
      }
    }
  } catch (error) {
    console.error('Error verifying relations:', error);
    return c.json({ error: 'Erro ao verificar dados' }, 500);
  }

  // Sanitizar dados
  const sanitizedData = {
    descricao: sanitizeString(body.descricao),
    valor: body.valor,
    data_vencimento: body.data_vencimento,
    status_pagamento: body.status_pagamento ?? 'Pendente'
  };

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO vencimentos_pagar (user_id, evento_id, fornecedor_id, descricao, valor, data_vencimento, status_pagamento)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user.id,
      body.evento_id,
      body.fornecedor_id ?? null,
      sanitizedData.descricao,
      sanitizedData.valor,
      sanitizedData.data_vencimento,
      sanitizedData.status_pagamento
    ).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating pagavel:', error);
    return c.json({ error: 'Erro ao criar pagável' }, 500);
  }
});

const patchPagavelSchema = z.object({
  status_pagamento: z.enum(['Pendente', 'Pago', 'Cancelado'])
});

app.patch('/api/pagaveis/:id', authMiddleware, zValidator('json', patchPagavelSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const id = c.req.param('id');
  const body = c.req.valid('json');

  await c.env.DB.prepare(
    `UPDATE vencimentos_pagar SET status_pagamento = ? WHERE id = ? AND user_id = ?`
  ).bind(body.status_pagamento, id, user.id).run();

  return c.json({ success: true });
});

// Fornecedores endpoints
app.get('/api/fornecedores', authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM fornecedores WHERE user_id = ? ORDER BY nome_fornecedor ASC'
  ).bind(user.id).all();

  return c.json(results);
});

const createFornecedorSchema = z.object({
  nome_fornecedor: z.string().min(1),
  tipo_servico: z.string().optional().nullable(),
  email_contato: z.string().email().optional().nullable(),
  telefone_contato: z.string().optional().nullable()
});

app.post('/api/fornecedores', authMiddleware, zValidator('json', createFornecedorSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }
  const body = c.req.valid('json');

  // Sanitizar dados
  const sanitizedData = {
    nome_fornecedor: sanitizeString(body.nome_fornecedor),
    tipo_servico: body.tipo_servico ? sanitizeString(body.tipo_servico) : null,
    email_contato: body.email_contato ? sanitizeString(body.email_contato) : null,
    telefone_contato: body.telefone_contato ? sanitizeString(body.telefone_contato) : null
  };

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO fornecedores (user_id, nome_fornecedor, tipo_servico, email_contato, telefone_contato)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      user.id,
      sanitizedData.nome_fornecedor,
      sanitizedData.tipo_servico,
      sanitizedData.email_contato,
      sanitizedData.telefone_contato
    ).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating fornecedor:', error);
    return c.json({ error: 'Erro ao criar fornecedor' }, 500);
  }
});

app.get('/api/fornecedores/:id', validateId(), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const fornecedorId = c.req.param('id');

  try {
    const fornecedor = await c.env.DB.prepare(
      `SELECT * FROM fornecedores WHERE id = ? AND user_id = ?`
    ).bind(fornecedorId, user.id).first();

    if (!fornecedor) {
      return c.json({ error: 'Fornecedor não encontrado' }, 404);
    }

    const { results: compromissos } = await c.env.DB.prepare(
      `SELECT vp.*, e.nome_evento as evento_nome
       FROM vencimentos_pagar vp
       JOIN eventos e ON e.id = vp.evento_id
       WHERE vp.fornecedor_id = ? AND vp.user_id = ?
       ORDER BY vp.data_vencimento DESC`
    ).bind(fornecedorId, user.id).all();

    const stats = {
      totalPagamentos: compromissos.length,
      totalPago: compromissos
        .filter((item: any) => item.status_pagamento === 'Pago')
        .reduce((sum: number, item: any) => sum + item.valor, 0),
      totalPendente: compromissos
        .filter((item: any) => item.status_pagamento === 'Pendente')
        .reduce((sum: number, item: any) => sum + item.valor, 0),
      proximoPagamento: compromissos
        .filter((item: any) => item.status_pagamento === 'Pendente' && new Date(item.data_vencimento) >= new Date())
        .sort((a: any, b: any) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0] || null
    };

    return c.json({
      fornecedor,
      compromissos,
      stats
    });
  } catch (error) {
    console.error('Error fetching fornecedor details:', error);
    return c.json({ error: 'Erro ao buscar detalhes do fornecedor' }, 500);
  }
});

// Checklist & tarefas endpoints
app.get('/api/checklists/templates', authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT tc.*, 
      (SELECT COUNT(*) FROM tarefas_template tt WHERE tt.template_id = tc.id) as total_tarefas
    FROM templates_checklist tc
    WHERE tc.user_id = ?
    ORDER BY tc.created_at DESC`
  ).bind(user.id).all();

  return c.json(results);
});

const createTemplateSchema = z.object({
  nome_template: z.string().min(1)
});

app.post('/api/checklists/templates', authMiddleware, zValidator('json', createTemplateSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }
  const body = c.req.valid('json');

  // Sanitizar dados
  const sanitizedNome = sanitizeString(body.nome_template);

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO templates_checklist (user_id, nome_template)
       VALUES (?, ?)`
    ).bind(user.id, sanitizedNome).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating template:', error);
    return c.json({ error: 'Erro ao criar template' }, 500);
  }
});

app.get('/api/checklists/templates/:templateId/tarefas', validateId(), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const templateId = c.req.param('templateId');

  // Verificar se template pertence ao usuário
  try {
    const template = await c.env.DB.prepare(
      `SELECT id FROM templates_checklist WHERE id = ? AND user_id = ?`
    ).bind(templateId, user.id).first();

    if (!template) {
      return c.json({ error: 'Template não encontrado' }, 404);
    }

    const { results } = await c.env.DB.prepare(
      `SELECT * FROM tarefas_template WHERE template_id = ? ORDER BY created_at ASC`
    ).bind(templateId).all();

    return c.json(results || []);
  } catch (error) {
    console.error('Error fetching template tasks:', error);
    return c.json({ error: 'Erro ao buscar tarefas do template' }, 500);
  }
});

const createTemplateTaskSchema = z.object({
  descricao_tarefa: z.string().min(1),
  prazo_relativo_dias: z.number().int(),
  tipo_prazo: z.enum(['antes', 'depois']).optional()
});

app.post('/api/checklists/templates/:templateId/tarefas', validateId(), authMiddleware, zValidator('json', createTemplateTaskSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const templateId = c.req.param('templateId');
  const body = c.req.valid('json');

  // Verificar se template pertence ao usuário
  try {
    const template = await c.env.DB.prepare(
      `SELECT id FROM templates_checklist WHERE id = ? AND user_id = ?`
    ).bind(templateId, user.id).first();

    if (!template) {
      return c.json({ error: 'Template não encontrado' }, 404);
    }
  } catch (error) {
    console.error('Error verifying template:', error);
    return c.json({ error: 'Erro ao verificar template' }, 500);
  }

  // Sanitizar dados
  const sanitizedDescricao = sanitizeString(body.descricao_tarefa);

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO tarefas_template (template_id, descricao_tarefa, prazo_relativo_dias, tipo_prazo)
       VALUES (?, ?, ?, ?)`
    ).bind(
      templateId,
      sanitizedDescricao,
      body.prazo_relativo_dias,
      body.tipo_prazo ?? 'antes'
    ).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating template task:', error);
    return c.json({ error: 'Erro ao criar tarefa do template' }, 500);
  }
});

const applyTemplateSchema = z.object({
  evento_id: z.number().int()
});

app.post('/api/checklists/templates/:templateId/aplicar', validateId(), authMiddleware, zValidator('json', applyTemplateSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const templateId = c.req.param('templateId');
  const { evento_id } = c.req.valid('json');

  try {
    // Verificar se template pertence ao usuário
    const template = await c.env.DB.prepare(
      `SELECT id FROM templates_checklist WHERE id = ? AND user_id = ?`
    ).bind(templateId, user.id).first();

    if (!template) {
      return c.json({ error: 'Template não encontrado' }, 404);
    }

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

    // Usar batch para inserir todas as tarefas de uma vez (transação implícita)
    const statements = tarefasTemplate.map((tarefa: any) =>
      c.env.DB.prepare(
        `INSERT INTO tarefas_evento (evento_id, user_id, descricao_tarefa, data_vencimento)
         VALUES (?, ?, ?, ?)`
      ).bind(
        evento_id,
        user.id,
        tarefa.descricao_tarefa,
        shiftDate(
          String(evento.data_evento),
          Number(tarefa.prazo_relativo_dias),
          tarefa.tipo_prazo === 'depois' ? 'depois' : 'antes'
        )
      )
    );

    await c.env.DB.batch(statements);

    return c.json({ success: true, tarefas_geradas: tarefasTemplate.length });
  } catch (error) {
    console.error('Error applying template:', error);
    return c.json({ error: 'Erro ao aplicar template' }, 500);
  }
});

app.get('/api/eventos/:id/tarefas', validateId(), authMiddleware, async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const eventoId = c.req.param('id');

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM tarefas_evento 
       WHERE evento_id = ? AND user_id = ?
       ORDER BY data_vencimento ASC`
    ).bind(eventoId, user.id).all();

    return c.json(results || []);
  } catch (error) {
    console.error('Error fetching event tasks:', error);
    return c.json({ error: 'Erro ao buscar tarefas do evento' }, 500);
  }
});

const createEventoTarefaSchema = z.object({
  descricao_tarefa: z.string().min(1),
  data_vencimento: z.string().min(1),
  is_concluida: z.boolean().optional()
});

app.post('/api/eventos/:id/tarefas', validateId(), authMiddleware, zValidator('json', createEventoTarefaSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const eventoId = c.req.param('id');
  const body = c.req.valid('json');

  // Verificar se evento existe e pertence ao usuário
  try {
    const evento = await c.env.DB.prepare(
      `SELECT id FROM eventos WHERE id = ? AND user_id = ?`
    ).bind(eventoId, user.id).first();

    if (!evento) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }
  } catch (error) {
    console.error('Error verifying evento:', error);
    return c.json({ error: 'Erro ao verificar evento' }, 500);
  }

  // Sanitizar dados
  const sanitizedDescricao = sanitizeString(body.descricao_tarefa);

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO tarefas_evento (evento_id, user_id, descricao_tarefa, data_vencimento, is_concluida)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      eventoId,
      user.id,
      sanitizedDescricao,
      body.data_vencimento,
      body.is_concluida ? 1 : 0
    ).run();

    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Error creating event task:', error);
    return c.json({ error: 'Erro ao criar tarefa' }, 500);
  }
});

const patchEventoTarefaSchema = z.object({
  descricao_tarefa: z.string().min(1).optional(),
  data_vencimento: z.string().min(1).optional(),
  is_concluida: z.boolean().optional()
});

app.patch('/api/eventos/:id/tarefas/:tarefaId', validateIds('id', 'tarefaId'), authMiddleware, zValidator('json', patchEventoTarefaSchema), async (c) => {
  const user = getUserFromContext(c);
  if (!user) {
    return respondUnauthorized(c);
  }

  const eventoId = c.req.param('id');
  const tarefaId = c.req.param('tarefaId');
  const body = c.req.valid('json');

  try {
    // Verificar se tarefa existe e pertence ao usuário
    const tarefa = await c.env.DB.prepare(
      `SELECT id FROM tarefas_evento WHERE id = ? AND evento_id = ? AND user_id = ?`
    ).bind(tarefaId, eventoId, user.id).first();

    if (!tarefa) {
      return c.json({ error: 'Tarefa não encontrada' }, 404);
    }

    // Sanitizar descrição se fornecida
    const sanitizedDescricao = body.descricao_tarefa ? sanitizeString(body.descricao_tarefa) : null;

    await c.env.DB.prepare(
      `UPDATE tarefas_evento 
       SET 
        descricao_tarefa = COALESCE(?, descricao_tarefa),
        data_vencimento = COALESCE(?, data_vencimento),
        is_concluida = COALESCE(?, is_concluida)
       WHERE id = ? AND evento_id = ? AND user_id = ?`
    ).bind(
      sanitizedDescricao,
      body.data_vencimento ?? null,
      typeof body.is_concluida === 'boolean' ? (body.is_concluida ? 1 : 0) : null,
      tarefaId,
      eventoId,
      user.id
    ).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ error: 'Erro ao atualizar tarefa' }, 500);
  }
});

export default app;
