export default function EmptyState({ title = 'Nada aqui ainda', description = 'Adicione um item para começar.' }) {
  return (
    <div className="rounded-lg border bg-white p-6 text-center">
      <div className="text-brand-black font-medium">{title}</div>
      <div className="mt-1 text-xs text-gray-500">{description}</div>
    </div>
  )
}