import Logo from '../../components/Logo'
import Sidebar from '../../components/Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 border-r bg-white p-4">
        <div className="flex items-center justify-between">
          <Logo size={28} />
        </div>
        <Sidebar />
      </aside>
      <div className="flex-1">
        <header className="flex items-center gap-3 p-4 border-b bg-white">
          <Logo size={36} />
          <div className="text-brand-black font-semibold">Painel EG Assist</div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}