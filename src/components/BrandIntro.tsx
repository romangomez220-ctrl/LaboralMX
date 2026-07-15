import { useEffect, useState } from 'react'

const STORAGE_KEY = 'romanus_brand_intro_seen'

export default function BrandIntro() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined' || window.location.pathname !== '/') return false
    return window.sessionStorage.getItem(STORAGE_KEY) !== '1'
  })
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!visible) return

    window.sessionStorage.setItem(STORAGE_KEY, '1')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const closeTimer = window.setTimeout(() => setClosing(true), reducedMotion ? 120 : 900)
    const removeTimer = window.setTimeout(() => setVisible(false), reducedMotion ? 220 : 1320)

    return () => {
      window.clearTimeout(closeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`brand-intro ${closing ? 'brand-intro--closing' : ''}`} aria-hidden="true">
      <div className="brand-intro__halo" />
      <div className="brand-intro__content">
        <p className="brand-intro__wordmark">ROMANUS</p>
        <div className="brand-intro__line" />
        <p className="brand-intro__tagline">Tecnología · Estrategia · Conocimiento</p>
      </div>
    </div>
  )
}
