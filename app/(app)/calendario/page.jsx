import Card from '../../../components/Card'

export default function CalendarioPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-brand-black">Calendário</h1>

      <Card title="Visão Geral" subtitle="Em breve">
        <div className="text-sm text-gray-600">Aqui você verá seus eventos por mês/semana/dia.</div>
      </Card>
    </div>
  )
}