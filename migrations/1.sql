
-- Contratantes (Clients)
CREATE TABLE contratantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contratantes_user_id ON contratantes(user_id);

-- Fornecedores (Suppliers)
CREATE TABLE fornecedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome_fornecedor TEXT NOT NULL,
  tipo_servico TEXT,
  email_contato TEXT,
  telefone_contato TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fornecedores_user_id ON fornecedores(user_id);

-- Eventos (Events)
CREATE TABLE eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  contratante_id INTEGER,
  nome_evento TEXT NOT NULL,
  data_evento DATE NOT NULL,
  valor_total_receber REAL NOT NULL,
  valor_total_custos REAL DEFAULT 0,
  status_evento TEXT DEFAULT 'Planejamento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eventos_user_id ON eventos(user_id);
CREATE INDEX idx_eventos_data_evento ON eventos(data_evento);
CREATE INDEX idx_eventos_contratante_id ON eventos(contratante_id);

-- Vencimentos a Receber (Receivables)
CREATE TABLE vencimentos_receber (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data_vencimento DATE NOT NULL,
  status_pagamento TEXT DEFAULT 'Pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vencimentos_receber_evento_id ON vencimentos_receber(evento_id);
CREATE INDEX idx_vencimentos_receber_user_id ON vencimentos_receber(user_id);
CREATE INDEX idx_vencimentos_receber_data_vencimento ON vencimentos_receber(data_vencimento);
CREATE INDEX idx_vencimentos_receber_status ON vencimentos_receber(status_pagamento);

-- Vencimentos a Pagar (Payables)
CREATE TABLE vencimentos_pagar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  fornecedor_id INTEGER,
  user_id TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data_vencimento DATE NOT NULL,
  status_pagamento TEXT DEFAULT 'Pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vencimentos_pagar_evento_id ON vencimentos_pagar(evento_id);
CREATE INDEX idx_vencimentos_pagar_user_id ON vencimentos_pagar(user_id);
CREATE INDEX idx_vencimentos_pagar_fornecedor_id ON vencimentos_pagar(fornecedor_id);
CREATE INDEX idx_vencimentos_pagar_data_vencimento ON vencimentos_pagar(data_vencimento);

-- Templates de Checklist
CREATE TABLE templates_checklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome_template TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_checklist_user_id ON templates_checklist(user_id);

-- Tarefas do Template
CREATE TABLE tarefas_template (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  descricao_tarefa TEXT NOT NULL,
  prazo_relativo_dias INTEGER NOT NULL,
  tipo_prazo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tarefas_template_template_id ON tarefas_template(template_id);

-- Tarefas do Evento
CREATE TABLE tarefas_evento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  descricao_tarefa TEXT NOT NULL,
  data_vencimento DATE NOT NULL,
  is_concluida BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tarefas_evento_evento_id ON tarefas_evento(evento_id);
CREATE INDEX idx_tarefas_evento_user_id ON tarefas_evento(user_id);
CREATE INDEX idx_tarefas_evento_data_vencimento ON tarefas_evento(data_vencimento);
