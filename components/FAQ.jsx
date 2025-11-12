"use client"
import { useState } from 'react'

export default function FAQ({ items = [] }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div key={idx} className="border rounded">
          <button
            className="w-full text-left px-4 py-3 flex justify-between items-center"
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
          >
            <span className="font-medium text-brand-black">{it.q}</span>
            <span className="text-brand-gold">{open === idx ? '-' : '+'}</span>
          </button>
          {open === idx && (
            <div className="px-4 pb-4 text-sm text-gray-700">{it.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}