"use client"
import { useFormStatus } from 'react-dom'

export default function SubmitButton({ children = 'Salvar' }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`px-3 py-2 rounded border hover:bg-brand-gold/10 ${pending ? 'opacity-60 cursor-not-allowed' : ''}`}>
      {pending ? 'Salvando...' : children}
    </button>
  )
}