import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Cliente Supabase para uso em componentes Client do Next.js
// Este helper sincroniza a sessão com cookies, permitindo proteção via middleware/SSR.
// Certifique-se de definir:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClientComponentClient()