'use client'
import { useEffect } from 'react'

export default function ResetOnSaved({ saved, formIds = [] }) {
  useEffect(() => {
    if (!saved) return
    formIds.forEach(id => {
      const el = document.getElementById(id)
      if (el && el instanceof HTMLFormElement) {
        el.reset()
      }
    })
  }, [saved, formIds])

  return null
}