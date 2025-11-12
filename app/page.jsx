import NavBar from '../components/NavBar'
import Carousel from '../components/Carousel'
import FAQ from '../components/FAQ'
import Link from 'next/link'

export default function LandingPage() {
  const testimonials = [
    { quote: 'Organizei mais eventos com menos esforço.', author: 'Maria, Produtora' },
    { quote: 'Meu fluxo financeiro ficou claro e confiável.', author: 'João, Empresário' },
    { quote: 'Parcerias e contratantes em um só lugar.', author: 'Ana, Cerimonialista' },
  ]

  const faq = [
    { q: 'O que é o EGAssist?', a: 'É uma plataforma para gestão de eventos, contratantes, fornecedores e finanças.' },
    { q: 'Como faço para começar?', a: 'Clique em Cadastrar, crie sua conta e conecte seus dados.' },
    { q: 'Posso usar no celular?', a: 'Sim, a interface é responsiva e funciona em qualquer dispositivo moderno.' },
  ]

  return (
    <main>
      <NavBar />
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-black">Simplifique sua gestão de eventos</h1>
            <p className="mt-3 text-gray-700">Controle contratantes, fornecedores, agenda, finanças e modelos em um único painel com tema consistente.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/cadastro" className="px-4 py-2 rounded border bg-brand-gold/10">Começar agora</Link>
              <Link href="/eventos" className="px-4 py-2 rounded border">Ver demo</Link>
            </div>
          </div>
          <div className="border rounded p-6">
            <ul className="space-y-2">
              <li className="text-brand-black">• Eventos com criação rápida e filtros por período</li>
              <li className="text-brand-black">• Contratantes e fornecedores com busca e paginação</li>
              <li className="text-brand-black">• Calendário e modelos para agilizar processos</li>
              <li className="text-brand-black">• Integração com Supabase e RLS</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold text-brand-black mb-4">Por que usar?</h2>
          <p className="text-gray-700">Centraliza informações essenciais, reduz erros e melhora a visibilidade de próximos eventos e receitas. Padrões visuais e componentes facilitam sua navegação.</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold text-brand-black mb-4">Testemunhos</h2>
          <Carousel items={testimonials} />
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold text-brand-black mb-4">FAQ</h2>
          <FAQ items={faq} />
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-semibold text-brand-black mb-2">Pronto para começar?</h2>
          <p className="text-gray-700 mb-4">Cadastre-se e organize seu próximo evento com facilidade.</p>
          <Link href="/cadastro" className="px-5 py-3 rounded border bg-brand-gold/10">Cadastrar</Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-gray-600 flex justify-between">
          <span>© {new Date().getFullYear()} EGAssist</span>
          <div className="flex gap-4">
            <Link href="/eventos" className="hover:text-brand-black">Eventos</Link>
            <Link href="/contratantes" className="hover:text-brand-black">Contratantes</Link>
            <Link href="/fornecedores" className="hover:text-brand-black">Fornecedores</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}