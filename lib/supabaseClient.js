import { createClient } from '@supabase/supabase-js'

// Cliente Supabase para uso no Next.js (server components e client components)
// Configure as variáveis de ambiente:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY
// Em produção, para operações sensíveis no servidor, use a chave service_role via edge/server somente.

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)