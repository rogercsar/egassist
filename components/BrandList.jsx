export default function BrandList({ items = [], emptyText = 'Nenhum item disponível.' }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.length === 0 && (
        <li className="text-sm text-gray-400">{emptyText}</li>
      )}
      {items.map((it, idx) => (
        <li key={idx} className="flex justify-between text-sm">
          <span className="font-medium text-brand-black">{it.label}</span>
          {it.value && <span className="text-brand-gold">{it.value}</span>}
        </li>
      ))}
    </ul>
  )
}