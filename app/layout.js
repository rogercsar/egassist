import './globals.css'
import Image from 'next/image'

export const metadata = {
  title: 'EG Assist',
  description: 'O Seu Gestor de Eventos Pro.',
  icons: {
    icon: '/egassist-logo.svg',
    shortcut: '/egassist-logo.svg',
    apple: '/egassist-logo.svg',
  },
  // themeColor removido; migrado para viewport
};

export const viewport = { themeColor: '#111111' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px'}}>
          <Image src="/egassist-logo.svg" alt="EG Assist" width={40} height={40} priority />
          <strong>EG Assist</strong>
        </header>
        {children}
      </body>
    </html>
  )
}