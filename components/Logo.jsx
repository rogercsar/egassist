import Image from 'next/image'

export default function Logo({ size = 36 }) {
  return (
    <div className="flex items-center gap-2 select-none" aria-label="EG Assist">
      {/* Imagem oficial da marca */}
      <Image src="/egassist-logo.png" alt="EG Assist" width={size} height={size} priority />
      <div className="leading-tight">
        <div className="text-base font-bold text-brand-black">EG <span className="text-brand-gold">Assist</span></div>
        <div className="text-[11px] text-gray-500">O Seu Gestor de Eventos Pro.</div>
      </div>
    </div>
  )
}