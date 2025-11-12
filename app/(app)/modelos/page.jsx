import Card from '../../../components/Card'
import BrandList from '../../../components/BrandList'

export default function ModelosPage() {
  const modelos = [
    { label: 'Checklist de Evento', value: 'v1.0' },
    { label: 'Template de Proposta', value: 'v2.3' },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-brand-black">Modelos</h1>

      <Card title="Modelos Disponíveis">
        <BrandList items={modelos} emptyText="Nenhum modelo cadastrado." />
      </Card>

      <Card title="Ações">
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border hover:bg-brand-gold/10">Novo Modelo</button>
          <button className="px-3 py-2 rounded border hover:bg-brand-gold/10">Importar</button>
        </div>
      </Card>
    </div>
  )
}