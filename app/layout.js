import './globals.css'

export const metadata = {
  title: 'EG Assist',
  description: 'O Seu Gestor de Eventos Pro.',
  icons: {
    icon: '/egassist-logo.png',
    shortcut: '/egassist-logo.png',
    apple: '/egassist-logo.png',
  },
  // themeColor removido; migrado para viewport
};

export const viewport = { themeColor: '#111111' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}