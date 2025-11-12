export default function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      {title && <div className="text-sm text-gray-500">{title}</div>}
      {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
      <div className="mt-2">{children}</div>
    </div>
  )
}