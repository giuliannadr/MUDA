import { useEffect, useRef, useState } from 'react'
import type { View } from '../App'
import styles from './Nav.module.css'

const links: { view: View; label: string }[] = [
  { view: 'quienes',    label: 'Quiénes somos' },
  { view: 'produccion', label: 'Producción' },
  { view: 'eventos',    label: 'Eventos' },
  { view: 'agencia',    label: 'Agencia' },
  { view: 'estudio',    label: 'Estudio' },
]

type Props = { current: View; navigate: (v: View) => void }

export default function Nav({ current, navigate }: Props) {
  const [onLight, setOnLight] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Navegar y cerrar menú mobile
  const go = (v: View) => { setMobileOpen(false); navigate(v) }

  /* ── Detectar fondo ───────────────────────────────────────── */
  useEffect(() => {
    const check = () => {
      const els = document.elementsFromPoint(window.innerWidth / 2, 55)
      for (const el of els) {
        if (el.closest('nav')) continue
        const themed = el.closest('[data-nav]')
        if (!themed) continue
        const theme = themed.getAttribute('data-nav')
        if (theme === 'light') { setOnLight(true); return }
        if (theme === 'dark') { setOnLight(false); return }
      }
    }
    const scrollEl = document.querySelector<HTMLElement>('.view-wrap')
    scrollEl?.addEventListener('scroll', check, { passive: true })
    const t = setTimeout(check, 60)
    return () => { scrollEl?.removeEventListener('scroll', check); clearTimeout(t) }
  }, [current])

  return (
    <nav ref={navRef} className={`${styles.nav} ${onLight ? styles.light : ''} ${mobileOpen ? styles.menuOpen : ''}`}>
      <button className={styles.logo} onClick={() => navigate('inicio')}>
        MUDA
      </button>

      <ul className={styles.links}>
        {links.map(l => (
          <li key={l.view}>
            <button
              className={`${styles.link} ${current === l.view ? styles.active : ''}`}
              onClick={() => navigate(l.view)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.cta}>
        <button
          className={`${styles.ctaBtn} ${current === 'contacto' ? styles.ctaActive : ''}`}
          onClick={() => navigate('contacto')}
        >
          Contacto
        </button>
      </div>

      {/* Botón hamburguesa — solo mobile */}
      <button
        className={`${styles.burger} ${mobileOpen ? styles.burgerOpen : ''}`}
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Menú"
      >
        <span /><span /><span />
      </button>

      {/* Panel mobile */}
      <div className={`${styles.mobilePanel} ${mobileOpen ? styles.mobileVisible : ''}`}>
        {links.map(l => (
          <button
            key={l.view}
            className={`${styles.mobileLink} ${current === l.view ? styles.mobileActive : ''}`}
            onClick={() => go(l.view)}
          >
            {l.label}
          </button>
        ))}
        <button
          className={`${styles.mobileCta} ${current === 'contacto' ? styles.mobileActive : ''}`}
          onClick={() => go('contacto')}
        >
          Contacto
        </button>
      </div>
    </nav>
  )
}
