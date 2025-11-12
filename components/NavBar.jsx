import Link from 'next/link'

export default function NavBar() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-brand-black">EGAssist</Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 rounded border hover:bg-brand-gold/10">Entrar</Link>
          <Link href="/cadastro" className="px-3 py-2 rounded border bg-brand-gold/10 text-brand-black">Cadastrar</Link>
        </nav>
      </div>
    </header>
  )
}