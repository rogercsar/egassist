'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/contratantes', label: 'Contratantes' },
  { href: '/fornecedores', label: 'Fornecedores' },
  { href: '/calendario', label: 'Calendário' },
  { href: '/modelos', label: 'Modelos' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="mt-6 space-y-2 text-sm">
      {items.map(({ href, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        const className = active
          ? 'block px-3 py-2 rounded bg-brand-gold/10 text-brand-black font-semibold border border-brand-gold/30'
          : 'block px-3 py-2 rounded text-brand-black hover:bg-brand-gold/10'

        return (
          <Link key={href} href={href} className={className} aria-current={active ? 'page' : undefined}>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}