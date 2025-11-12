'use client'
import { useEffect, useState } from 'react'

export default function FlashBanner({ message, variant = 'success', autoHideMs = 4000 }) {
  const [visible, setVisible] = useState(Boolean(message))

  useEffect(() => {
    if (!message) return
    setVisible(true)
    if (autoHideMs > 0) {
      const t = setTimeout(() => setVisible(false), autoHideMs)
      return () => clearTimeout(t)
    }
  }, [message, autoHideMs])

  if (!visible || !message) return null

  const classes = variant === 'error'
    ? 'rounded border bg-red-50 text-red-700 px-3 py-2'
    : 'rounded border bg-green-50 text-green-700 px-3 py-2'

  const ariaLive = variant === 'error' ? 'assertive' : 'polite'

  return (
    <div className={classes} aria-live={ariaLive}>{message}</div>
  )
}