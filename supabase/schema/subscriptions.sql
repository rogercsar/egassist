-- Cria tabela de assinaturas para controlar planos e status
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free','basic','pro')),
  status text not null, -- ex: pending, authorized, active, paused, canceled
  mp_preapproval_id text,
  mp_plan_id text,
  reason text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);