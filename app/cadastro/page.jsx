'use client'

import { supabase } from '../../lib/supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Logo from '../../components/Logo'

export default function CadastroPage() {
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Logo size={48} />
          <h1 className="text-2xl font-semibold text-brand-black">Cadastre-se no EG Assist</h1>
        </div>
        <p className="mt-1 text-sm text-gray-600">Crie sua conta com Google ou e-mail.</p>

        <div className="mt-4">
          <Auth
            supabaseClient={supabase}
            providers={["google"]}
            redirectTo={callbackUrl}
            appearance={{ theme: ThemeSupa }}
            view="sign_up"
            localization={{
              variables: {
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                },
              },
            }}
          />
        </div>

        <div className="mt-6 text-xs text-gray-500">Ao continuar, você concorda com nossos termos.</div>
      </div>
    </main>
  )
}