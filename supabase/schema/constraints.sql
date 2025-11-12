-- Constraints para produção
alter table public.subscriptions
  add constraint subscriptions_mp_preapproval_id_unique unique (mp_preapproval_id);