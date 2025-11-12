"use client"
import { useEffect, useState } from 'react'

export default function Carousel({ items = [], interval = 4000 }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % items.length), interval)
    return () => clearInterval(id)
  }, [items.length, interval])
  if (!items.length) return null
  const current = items[index]
  return (
    <div className="relative w-full overflow-hidden rounded border">
      <div className="p-6 bg-white">
        <blockquote className="text-brand-black text-lg">
          “{current.quote}”
        </blockquote>
        <div className="mt-2 text-sm text-brand-gold">{current.author}</div>
      </div>
      <div className="absolute bottom-2 right-2 flex gap-1">
        {items.map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i === index ? 'bg-brand-gold' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
  )
}