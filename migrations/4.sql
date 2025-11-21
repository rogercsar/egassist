-- Migration 4: Adicionar Foreign Keys e Constraints
-- Esta migration adiciona integridade referencial ao banco de dados

-- Primeiro, vamos garantir que não há dados órfãos
-- (Isso deve ser feito manualmente antes de aplicar as constraints)

-- Adicionar constraints CHECK nas tabelas existentes
-- Nota: SQLite não suporta ALTER TABLE ADD CONSTRAINT diretamente,
-- então precisamos recriar as tabelas com as constraints

-- 1. Recriar tabela eventos com constraints
CREATE TABLE IF NOT EXISTS eventos_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  contratante_id INTEGER,
  nome_evento TEXT NOT NULL CHECK(LENGTH(nome_evento) > 0),
  data_evento DATE NOT NULL,
  valor_total_receber REAL NOT NULL CHECK(valor_total_receber >= 0),
  valor_total_custos REAL DEFAULT 0 CHECK(valor_total_custos >= 0),
  status_evento TEXT DEFAULT 'Planejamento' CHECK(status_evento IN ('Planejamento', 'Confirmado', 'Concluído', 'Cancelado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrar dados existentes
INSERT INTO eventos_new SELECT * FROM eventos;

-- Recriar índices
CREATE INDEX IF NOT EXISTS idx_eventos_user_id ON eventos_new(user_id);
CREATE INDEX IF NOT EXISTS idx_eventos_data_evento ON eventos_new(data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_contratante_id ON eventos_new(contratante_id);

-- Substituir tabela antiga
DROP TABLE eventos;
ALTER TABLE eventos_new RENAME TO eventos;

-- 2. Recriar tabela vencimentos_receber com constraints
CREATE TABLE IF NOT EXISTS vencimentos_receber_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  descricao TEXT NOT NULL CHECK(LENGTH(descricao) > 0),
  valor REAL NOT NULL CHECK(valor > 0),
  data_vencimento DATE NOT NULL,
  status_pagamento TEXT DEFAULT 'Pendente' CHECK(status_pagamento IN ('Pendente', 'Pago', 'Cancelado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrar dados
INSERT INTO vencimentos_receber_new SELECT * FROM vencimentos_receber;

-- Recriar índices
CREATE INDEX IF NOT EXISTS idx_vencimentos_receber_evento_id ON vencimentos_receber_new(evento_id);
CREATE INDEX IF NOT EXISTS idx_vencimentos_receber_user_id ON vencimentos_receber_new(user_id);
CREATE INDEX IF NOT EXISTS idx_vencimentos_receber_data_vencimento ON vencimentos_receber_new(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_vencimentos_receber_status ON vencimentos_receber_new(status_pagamento);

-- Substituir tabela
DROP TABLE vencimentos_receber;
ALTER TABLE vencimentos_receber_new RENAME TO vencimentos_receber;

-- 3. Recriar tabela vencimentos_pagar com constraints
CREATE TABLE IF NOT EXISTS vencimentos_pagar_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  fornecedor_id INTEGER,
  user_id TEXT NOT NULL,
  descricao TEXT NOT NULL CHECK(LENGTH(descricao) > 0),
  valor REAL NOT NULL CHECK(valor > 0),
  data_vencimento DATE NOT NULL,
  status_pagamento TEXT DEFAULT 'Pendente' CHECK(status_pagamento IN ('Pendente', 'Pago', 'Cancelado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrar dados
INSERT INTO vencimentos_pagar_new SELECT * FROM vencimentos_pagar;

-- Recriar índices
CREATE INDEX IF NOT EXISTS idx_vencimentos_pagar_evento_id ON vencimentos_pagar_new(evento_id);
CREATE INDEX IF NOT EXISTS idx_vencimentos_pagar_user_id ON vencimentos_pagar_new(user_id);
CREATE INDEX IF NOT EXISTS idx_vencimentos_pagar_fornecedor_id ON vencimentos_pagar_new(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_vencimentos_pagar_data_vencimento ON vencimentos_pagar_new(data_vencimento);

-- Substituir tabela
DROP TABLE vencimentos_pagar;
ALTER TABLE vencimentos_pagar_new RENAME TO vencimentos_pagar;

-- 4. Adicionar constraints em contratantes
CREATE TABLE IF NOT EXISTS contratantes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL CHECK(LENGTH(nome) > 0),
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO contratantes_new SELECT * FROM contratantes;

CREATE INDEX IF NOT EXISTS idx_contratantes_user_id ON contratantes_new(user_id);

DROP TABLE contratantes;
ALTER TABLE contratantes_new RENAME TO contratantes;

-- 5. Adicionar constraints em fornecedores
CREATE TABLE IF NOT EXISTS fornecedores_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome_fornecedor TEXT NOT NULL CHECK(LENGTH(nome_fornecedor) > 0),
  tipo_servico TEXT,
  email_contato TEXT,
  telefone_contato TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO fornecedores_new SELECT * FROM fornecedores;

CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON fornecedores_new(user_id);

DROP TABLE fornecedores;
ALTER TABLE fornecedores_new RENAME TO fornecedores;

-- 6. Adicionar constraints em templates_checklist
CREATE TABLE IF NOT EXISTS templates_checklist_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome_template TEXT NOT NULL CHECK(LENGTH(nome_template) > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO templates_checklist_new SELECT * FROM templates_checklist;

CREATE INDEX IF NOT EXISTS idx_templates_checklist_user_id ON templates_checklist_new(user_id);

DROP TABLE templates_checklist;
ALTER TABLE templates_checklist_new RENAME TO templates_checklist;

-- 7. Adicionar constraints em tarefas_template
CREATE TABLE IF NOT EXISTS tarefas_template_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  descricao_tarefa TEXT NOT NULL CHECK(LENGTH(descricao_tarefa) > 0),
  prazo_relativo_dias INTEGER NOT NULL CHECK(prazo_relativo_dias >= 0),
  tipo_prazo TEXT NOT NULL CHECK(tipo_prazo IN ('antes', 'depois')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tarefas_template_new SELECT * FROM tarefas_template;

CREATE INDEX IF NOT EXISTS idx_tarefas_template_template_id ON tarefas_template_new(template_id);

DROP TABLE tarefas_template;
ALTER TABLE tarefas_template_new RENAME TO tarefas_template;

-- 8. Adicionar constraints em tarefas_evento
CREATE TABLE IF NOT EXISTS tarefas_evento_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  descricao_tarefa TEXT NOT NULL CHECK(LENGTH(descricao_tarefa) > 0),
  data_vencimento DATE NOT NULL,
  is_concluida BOOLEAN DEFAULT 0 CHECK(is_concluida IN (0, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tarefas_evento_new SELECT * FROM tarefas_evento;

CREATE INDEX IF NOT EXISTS idx_tarefas_evento_evento_id ON tarefas_evento_new(evento_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_evento_user_id ON tarefas_evento_new(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_evento_data_vencimento ON tarefas_evento_new(data_vencimento);

DROP TABLE tarefas_evento;
ALTER TABLE tarefas_evento_new RENAME TO tarefas_evento;

-- Nota: SQLite não suporta foreign keys por padrão em todas as versões
-- Para habilitar, é necessário executar: PRAGMA foreign_keys = ON;
-- Isso deve ser feito no código da aplicação ao inicializar conexões


