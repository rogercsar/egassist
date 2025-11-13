import { createClient } from '@supabase/supabase-js'

// Cliente Supabase para uso genérico (server e client) quando não é necessário
// sincronizar cookies com middleware/SSR. Para SSR com cookies, use
// createServerComponentClient nos layouts/páginas do App Router.
// Para login no cliente com cookies, instancie createClientComponentClient
// diretamente no componente Client.

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)