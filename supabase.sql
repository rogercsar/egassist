-- EG Assist - Supabase Schema
-- Enable required extension for UUID generation
create extension if not exists pgcrypto;

-- ===============================
-- Tables
-- ===============================

-- 2) contratantes
create table if not exists public.contratantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  email text,
  telefone text,
  created_at timestamptz not null default now()
);

-- 3) fornecedores
create table if not exists public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome_fornecedor text not null,
  tipo_servico text,
  email_contato text,
  telefone_contato text
);

-- 4) eventos
create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contratante_id uuid references public.contratantes(id) on delete set null,
  nome_evento text not null,
  data_evento date not null,
  valor_total_receber numeric not null,
  valor_total_custos numeric not null default 0,
  status_evento text not null default 'Planejamento'
);

-- 5) vencimentos_receber
create table if not exists public.vencimentos_receber (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  descricao text not null,
  valor numeric not null,
  data_vencimento date not null,
  status_pagamento text not null default 'Pendente'
);

-- 6) vencimentos_pagar
create table if not exists public.vencimentos_pagar (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  fornecedor_id uuid references public.fornecedores(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  descricao text,
  valor numeric not null,
  data_vencimento date not null,
  status_pagamento text not null default 'Pendente'
);

-- 7) templates_checklist
create table if not exists public.templates_checklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome_template text not null
);

-- 8) tarefas_template
create table if not exists public.tarefas_template (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates_checklist(id) on delete cascade,
  descricao_tarefa text not null,
  prazo_relativo_dias integer not null,
  tipo_prazo text not null
);

-- 9) tarefas_evento
create table if not exists public.tarefas_evento (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  descricao_tarefa text not null,
  data_vencimento date not null,
  status_conclusao boolean not null default false
);

-- ===============================
-- Indexes for performance
-- ===============================
create index if not exists idx_contratantes_user on public.contratantes(user_id);
create index if not exists idx_fornecedores_user on public.fornecedores(user_id);
create index if not exists idx_eventos_user_date on public.eventos(user_id, data_evento);
create index if not exists idx_vr_user_date_status on public.vencimentos_receber(user_id, data_vencimento, status_pagamento);
create index if not exists idx_vp_user_date_status on public.vencimentos_pagar(user_id, data_vencimento, status_pagamento);
create index if not exists idx_te_user_date_status on public.tarefas_evento(user_id, data_vencimento, status_conclusao);

-- ===============================
-- Row Level Security (RLS)
-- ===============================
-- Enable RLS on all tables
alter table public.contratantes enable row level security;
alter table public.fornecedores enable row level security;
alter table public.eventos enable row level security;
alter table public.vencimentos_receber enable row level security;
alter table public.vencimentos_pagar enable row level security;
alter table public.templates_checklist enable row level security;
alter table public.tarefas_template enable row level security;
alter table public.tarefas_evento enable row level security;

-- Helper policies: owned-row access using user_id
-- contratantes
create policy contratantes_select on public.contratantes
  for select using (auth.uid() = user_id);
create policy contratantes_insert on public.contratantes
  for insert with check (auth.uid() = user_id);
create policy contratantes_update on public.contratantes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy contratantes_delete on public.contratantes
  for delete using (auth.uid() = user_id);

-- fornecedores
create policy fornecedores_select on public.fornecedores
  for select using (auth.uid() = user_id);
create policy fornecedores_insert on public.fornecedores
  for insert with check (auth.uid() = user_id);
create policy fornecedores_update on public.fornecedores
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy fornecedores_delete on public.fornecedores
  for delete using (auth.uid() = user_id);

-- eventos
create policy eventos_select on public.eventos
  for select using (auth.uid() = user_id);
create policy eventos_insert on public.eventos
  for insert with check (auth.uid() = user_id);
create policy eventos_update on public.eventos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy eventos_delete on public.eventos
  for delete using (auth.uid() = user_id);

-- vencimentos_receber
create policy vr_select on public.vencimentos_receber
  for select using (auth.uid() = user_id);
create policy vr_insert on public.vencimentos_receber
  for insert with check (auth.uid() = user_id);
create policy vr_update on public.vencimentos_receber
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy vr_delete on public.vencimentos_receber
  for delete using (auth.uid() = user_id);

-- vencimentos_pagar
create policy vp_select on public.vencimentos_pagar
  for select using (auth.uid() = user_id);
create policy vp_insert on public.vencimentos_pagar
  for insert with check (auth.uid() = user_id);
create policy vp_update on public.vencimentos_pagar
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy vp_delete on public.vencimentos_pagar
  for delete using (auth.uid() = user_id);

-- templates_checklist
create policy tc_select on public.templates_checklist
  for select using (auth.uid() = user_id);
create policy tc_insert on public.templates_checklist
  for insert with check (auth.uid() = user_id);
create policy tc_update on public.templates_checklist
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy tc_delete on public.templates_checklist
  for delete using (auth.uid() = user_id);

-- tarefas_template (via template ownership)
create policy tt_select on public.tarefas_template
  for select using (
    exists (
      select 1 from public.templates_checklist t
      where t.id = tarefas_template.template_id and t.user_id = auth.uid()
    )
  );
create policy tt_insert on public.tarefas_template
  for insert with check (
    exists (
      select 1 from public.templates_checklist t
      where t.id = tarefas_template.template_id and t.user_id = auth.uid()
    )
  );
create policy tt_update on public.tarefas_template
  for update using (
    exists (
      select 1 from public.templates_checklist t
      where t.id = tarefas_template.template_id and t.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.templates_checklist t
      where t.id = tarefas_template.template_id and t.user_id = auth.uid()
    )
  );
create policy tt_delete on public.tarefas_template
  for delete using (
    exists (
      select 1 from public.templates_checklist t
      where t.id = tarefas_template.template_id and t.user_id = auth.uid()
    )
  );

-- tarefas_evento
create policy tev_select on public.tarefas_evento
  for select using (auth.uid() = user_id);
create policy tev_insert on public.tarefas_evento
  for insert with check (auth.uid() = user_id);
create policy tev_update on public.tarefas_evento
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy tev_delete on public.tarefas_evento
  for delete using (auth.uid() = user_id);