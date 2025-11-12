"use client";

import Link from "next/link";
import Image from "next/image";
import AuthNav from "../../components/AuthNav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/egassist-logo.png" alt="EG Assist" width={140} height={36} priority />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            <Link href="#features" className="hover:text-slate-900">Recursos</Link>
            <Link href="#metrics" className="hover:text-slate-900">Métricas</Link>
            <Link href="/planos" className="hover:text-slate-900">Planos</Link>
            <Link href="/eventos" className="hover:text-slate-900">Eventos</Link>
          </nav>
          <div className="flex items-center gap-3">
-            <Link href="/login" className="text-slate-700 hover:text-slate-900">Entrar</Link>
-            <Link href="/cadastro" className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Criar conta</Link>
+            <AuthNav />
           </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Organize eventos, contratantes e fornecedores com velocidade.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Controle financeiro, métricas em tempo real e automações para o seu negócio.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/planos" className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
                Assinar agora
              </Link>
              <Link href="/eventos" className="px-5 py-3 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-100">
                Ver na prática
              </Link>
            </div>
            <div className="mt-6 text-sm text-slate-500">
              Avançado R$10/mês • Pro R$19/mês • Gratuito disponível
            </div>
          </div>
          <div className="relative">
            <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-4">
              <div className="h-56 md:h-72 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-slate-700 font-medium">Dashboard financeiro</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">R$ 12.540,00</div>
                  <div className="mt-1 text-sm text-slate-500">A Receber (Mês)</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-slate-600 text-sm">Pagamentos atrasados</div>
                  <div className="text-slate-900 font-semibold">3</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-slate-600 text-sm">Próximos eventos</div>
                  <div className="text-slate-900 font-semibold">7</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-slate-600 text-sm">Fornecedores ativos</div>
                  <div className="text-slate-900 font-semibold">18</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-semibold text-slate-900">Recursos principais</h2>
          <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: "Contratantes e Fornecedores", desc: "Cadastre e gerencie contatos com busca e paginação." },
              { title: "Eventos", desc: "Crie eventos e acompanhe próximos 30 dias." },
              { title: "Métricas", desc: "Valores em BRL, pagamentos atrasados e recebíveis." },
              { title: "Banners de sucesso/erro", desc: "Feedback acessível e auto-ocultação." },
              { title: "Reset automático", desc: "Formulários são limpos ao salvar com sucesso." },
              { title: "Assinaturas", desc: "Planos Avançado e Pro com Mercado Pago." },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-medium text-slate-900">{f.title}</div>
                <div className="mt-1 text-sm text-slate-600">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Pricing */}
      <section className="bg-gradient-to-tr from-blue-50 via-white to-cyan-50">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Escolha o seu plano</h2>
          <p className="mt-2 text-slate-600">Assine em poucos cliques com o Mercado Pago.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/planos" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Ver planos</Link>
            <Link href="/cadastro" className="px-6 py-3 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-100">Criar conta grátis</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/egassist-logo.png" alt="EG Assist" width={140} height={36} className="opacity-80" />
            <span>© {new Date().getFullYear()} EG Assist</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/planos" className="hover:text-slate-900">Planos</Link>
            <Link href="/eventos" className="hover:text-slate-900">Eventos</Link>
            <Link href="/contratantes" className="hover:text-slate-900">Contratantes</Link>
            <Link href="/fornecedores" className="hover:text-slate-900">Fornecedores</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}