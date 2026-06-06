import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { View } from '../App'
import { supabase, type Talento } from '../lib/supabase'
import { imgUrl } from '../lib/cloudinary'
import { TalentDetail } from './Agencia'
import styles from './Inicio.module.css'

const ROL_LABEL: Record<string, string> = {
  modelos: 'MODELO', fotografos: 'FOTÓGRAFX', maquilladores: 'MAQUILLADORX',
}

type Props = { navigate: (v: View) => void; onCurtainChange?: (open: boolean) => void }

export default function Inicio({ navigate, onCurtainChange }: Props) {
  const topRef = useRef<HTMLDivElement>(null)
  const botRef = useRef<HTMLDivElement>(null)
  const [talentos, setTalentos] = useState<Talento[]>([])
  const [selected, setSelected] = useState<Talento | null>(null)

  // Trae hasta 6 talentos para la tira de Agencia
  useEffect(() => {
    supabase.from('talentos').select('*').order('created_at', { ascending: true }).limit(6)
      .then(({ data }) => setTalentos(data ?? []))
  }, [])

  useEffect(() => {
    // Restaurar visibilidad (Strict Mode ejecuta cleanup+effect dos veces en dev)
    if (topRef.current) { topRef.current.style.display = ''; topRef.current.style.transform = '' }
    if (botRef.current) { botRef.current.style.display = ''; botRef.current.style.transform = '' }

    const scrollEl = document.querySelector<HTMLElement>('.view-wrap')
    if (!scrollEl) return

    const onScroll = () => {
      const st       = scrollEl.scrollTop
      const vh       = window.innerHeight
      const progress = Math.min(st / vh, 1)
      const offset   = progress * (vh / 2)

      if (progress >= 1) {
        if (topRef.current) topRef.current.style.display = 'none'
        if (botRef.current) botRef.current.style.display = 'none'
        onCurtainChange?.(true)
        return
      }

      if (topRef.current) { topRef.current.style.display = ''; topRef.current.style.transform = `translateY(${-offset}px)` }
      if (botRef.current) { botRef.current.style.display = ''; botRef.current.style.transform = `translateY(${offset}px)` }
      onCurtainChange?.(false)
    }

    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      if (topRef.current) topRef.current.style.display = 'none'
      if (botRef.current) botRef.current.style.display = 'none'
    }
  }, [])

  // ── Font cycling en el título MUDA ──────────────────────────
  useEffect(() => {
    const FONTS = [
      { family: "'Cormorant Garamond', Georgia, serif",   style: 'italic',  weight: '300' },
      { family: "'Bebas Neue', Impact, sans-serif",        style: 'normal',  weight: '400' },
      { family: "'DM Mono', 'Courier New', monospace",     style: 'normal',  weight: '300' },
      { family: "'Playfair Display', Georgia, serif",      style: 'italic',  weight: '700' },
      { family: "'Unbounded', Impact, sans-serif",         style: 'normal',  weight: '700' },
      { family: "'Space Mono', 'Courier New', monospace",  style: 'italic',  weight: '400' },
      { family: "'Libre Baskerville', Georgia, serif",     style: 'italic',  weight: '400' },
      { family: "'Anton', Impact, sans-serif",             style: 'normal',  weight: '400' },
    ]

    // Cachear los nodos una sola vez (evita querySelectorAll en cada tick)
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(`.${styles.heroTitle}`))
    let idx = 0
    let id: ReturnType<typeof setInterval> | undefined

    const tick = () => {
      // Pausar si la pestaña no está visible
      if (document.hidden) return
      idx = (idx + 1) % FONTS.length
      const { family, style, weight } = FONTS[idx]
      for (const el of nodes) {
        el.style.fontFamily = family
        el.style.fontStyle  = style
        el.style.fontWeight = weight
      }
    }

    // Esperar a que las fuentes terminen de cargar antes de arrancar
    let cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled) return
      id = setInterval(tick, 220)
    })

    return () => { cancelled = true; if (id) clearInterval(id) }
  }, [])

  const heroContent = (
    <div className={styles.heroInner}>
      <div className={styles.heroBar}>
        <span className={styles.heroMeta}>Buenos Aires · 2024</span>
        <span className={styles.heroMeta}>Productora Creativa</span>
      </div>
      <div className={styles.heroStrip}>
        <div className={styles.heroStripPhoto} />
      </div>
      <h1 className={styles.heroTitle}>MUDA</h1>
      <div className={styles.heroFooter}>
        <p className={styles.heroSub}>Dirección estética<br />&amp; producción de imagen</p>
        <button className={styles.heroBtn} onClick={() => navigate('quienes')}>
          Descubrí →
        </button>
      </div>
    </div>
  )

  return (
    <>
      {createPortal(
        <>
          <div ref={topRef} className={`${styles.heroHalf} ${styles.heroHalfTop}`}>
            {heroContent}
          </div>
          <div ref={botRef} className={`${styles.heroHalf} ${styles.heroHalfBot}`}>
            {heroContent}
          </div>
        </>,
        document.body
      )}

      <div className={styles.page}>
        {/* stickyZone: 200dvh — quienes sticky los primeros 100, luego sube sola */}
        <div className={styles.stickyZone}>
        <section className={styles.quienes} data-nav="light">
          <div className={styles.quienesPhoto}>
            <span className={styles.photoTag}>Justina &amp; Lucila</span>
          </div>
          <div className={styles.quienesText}>
            <span className={styles.decoNum}>01</span>
            <p className={styles.secLabel}>Quiénes somos</p>
            <h2 className={styles.quienesH}>
              Estética<br /><em>con propósito.</em>
            </h2>
            <p className={styles.body}>
              Somos Justina Porta y Lucila Beltramino — productoras de moda formadas
              en dirección de arte y contenido digital. Creamos MUDA para acompañar
              a artistas, marcas y talentos a encontrar una identidad que los
              represente de verdad.
            </p>
            <div className={styles.founders}>
              <div>
                <p className={styles.founderN}>Justina Porta</p>
                <p className={styles.founderR}>Dirección de Arte · Estilismo</p>
              </div>
              <div>
                <p className={styles.founderN}>Lucila Beltramino</p>
                <p className={styles.founderR}>Producción · RR.PP.</p>
              </div>
            </div>
            <button className={styles.ghostBtn} onClick={() => navigate('quienes')}>
              Conocernos →
            </button>
          </div>
        </section>
        </div>{/* fin stickyZone */}

        {/* ══ MARQUEE ════════════════════════════════════════ */}
        <div className={styles.marqueeStrip} data-nav="dark">
          <div className={styles.marqueeTrack}>
            {['Producción foto & video', 'Dirección Creativa', 'Organización de eventos',
              'Agencia de talentos', 'Estudio Palermo', 'Buenos Aires',
              'Producción foto & video', 'Dirección Creativa', 'Organización de eventos',
              'Agencia de talentos', 'Estudio Palermo', 'Buenos Aires'].map((t, i) => (
              <span key={i}>{t}&nbsp;<em>✦</em></span>
            ))}
          </div>
        </div>

        {/* ══ SERVICIOS ══════════════════════════════════════ */}
        <section className={styles.servicios} data-nav="light">
          <div className={styles.serviciosHead}>
            <p className={styles.secLabel}>02 — Servicios</p>
            <h2 className={styles.serviciosH}>Lo que<br /><em>hacemos.</em></h2>
          </div>
          <div className={styles.serviciosRows}>
            {([
              { n: '01', view: 'foto-video'         as const, title: 'Producción de fotos & video', sub: 'Producción y dirección integral. Shooting, locación, arte, estilismo.' },
              { n: '02', view: 'direccion-creativa'  as const, title: 'Dirección Creativa Visual',   sub: 'Conceptualización, moodboards y ejecución estética de campañas y videoclips.' },
              { n: '03', view: 'contenido-redes'     as const, title: 'Contenido para Redes',        sub: 'Producción estratégica para tu presencia digital.' },
            ]).map(s => (
              <div key={s.n} className={styles.sRow} onClick={() => navigate(s.view)}>
                <span className={styles.sNum}>{s.n}</span>
                <div className={styles.sCenter}>
                  <h3 className={styles.sTitle}>{s.title}</h3>
                  <p className={styles.sSub}>{s.sub}</p>
                </div>
                <span className={styles.sArrow}>→</span>
              </div>
            ))}
          </div>
          <div className={styles.serviciosCta}>
            <button className={styles.outlineBtn} onClick={() => navigate('foto-video')}>
              Ver servicios
            </button>
          </div>
        </section>

        {/* ══ EVENTOS ════════════════════════════════════════ */}
        <section className={styles.eventos} data-nav="dark" onClick={() => navigate('eventos')}>
          <div className={styles.eventosPhotoBg} />
          <div className={styles.eventosOverlay}>
            <p className={styles.secLabelLight}>03 — Organización de eventos</p>
            <h2 className={styles.eventosH}>
              Cada evento,<br /><em>una experiencia</em><br />visual y conceptual.
            </h2>
            <div className={styles.eventosBottom}>
              <p className={styles.eventosBody}>
                Planificación, producción y coordinación desde la idea hasta la ejecución.
                Ambientación, proveedores, catering e iluminación.
              </p>
              <span className={styles.eventosLink}>Ver eventos →</span>
            </div>
          </div>
        </section>

        {/* ══ AGENCIA ════════════════════════════════════════ */}
        <section className={styles.agencia} data-nav="light">
          <div className={styles.agenciaHead}>
            <p className={styles.secLabel}>04 — Agencia</p>
            <h2 className={styles.agenciaH}>Base de <em>talentos.</em></h2>
            <p className={styles.agenciaBody}>
              Modelxs, fotógrafxs y maquilladorxs disponibles para<br />
              contratar de forma independiente, sin producción completa.
            </p>
            <div className={styles.agenciaBtns}>
              <button className={styles.fillBtnDark} onClick={() => navigate('agencia')}>
                Ver todos →
              </button>
            </div>
          </div>
          <div className={styles.agenciaStrip}>
            {talentos.map(t => (
              <div key={t.id} className={styles.talentCard} onClick={() => setSelected(t)}>
                <div className={styles.talentImg}>
                  {t.portada_1 && (
                    <img
                      src={imgUrl(t.portada_1, 'w_300,h_400,c_fill,q_auto')}
                      alt={t.nombre}
                      className={styles.talentImgA}
                    />
                  )}
                  {t.portada_2 && (
                    <img
                      src={imgUrl(t.portada_2, 'w_300,h_400,c_fill,q_auto')}
                      alt=""
                      className={styles.talentImgB}
                    />
                  )}
                </div>
                <p className={styles.talentRole}>{t.rol || ROL_LABEL[t.categoria]}</p>
                <p className={styles.talentName}>{t.nombre}</p>
              </div>
            ))}
          </div>

          {selected && <TalentDetail t={selected} onClose={() => setSelected(null)} />}
        </section>

        {/* ══ ESTUDIO ════════════════════════════════════════ */}
        <section className={styles.estudio} data-nav="dark">
          <div className={styles.estudioPanel}>
            <p className={styles.secLabelLight}>05 — Estudio</p>
            <h2 className={styles.estudioH}>Palermo,<br /><em>Buenos Aires.</em></h2>
            <p className={styles.estudioBody}>
              Sala infinito de cuatro paredes. Salas múltiples, catering incluido y servicios add-on.
            </p>
            <div className={styles.estudioTags}>
              {['Sala Infinito', 'Salas múltiples', 'Catering', 'Fotógrafe add-on'].map(t => (
                <span key={t} className={styles.estudioTag}>{t}</span>
              ))}
            </div>
            <button className={styles.ghostBtnCream} onClick={() => navigate('estudio')}>Ver estudio →</button>
          </div>
          <div className={styles.estudioFotos}>
            <div className={styles.estudioMain} onClick={() => navigate('estudio')}>
              <img src={imgUrl('espacio5_fqt5ug', 'w_1300,h_900,c_fill,g_auto,q_auto,f_auto')} alt="Estudio MUDA — Sala Infinito" className={styles.estudioImg} loading="lazy" />
              <span className={styles.photoTagLight}>Sala Infinito</span>
            </div>
            <div className={styles.estudioGrid}>
              <div className={styles.estudioSm} onClick={() => navigate('estudio')}>
                <img src={imgUrl('espacio1_wmgx1f', 'w_760,h_570,c_fill,g_auto,q_auto,f_auto')} alt="Estudio MUDA" className={styles.estudioImg} loading="lazy" />
                <span className={styles.photoTagLight}>El set</span>
              </div>
              <div className={styles.estudioSm} onClick={() => navigate('estudio')}>
                <img src={imgUrl('espacio2_b7rpbk', 'w_760,h_570,c_fill,g_auto,q_auto,f_auto')} alt="Estudio MUDA" className={styles.estudioImg} loading="lazy" />
                <span className={styles.photoTagLight}>Palermo</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CONTACTO ═══════════════════════════════════════ */}
        <section className={styles.contacto} data-nav="light">
          <h2 className={styles.contactoH}>¿Tenés un<br /><em>proyecto?</em></h2>
          <div className={styles.contactoRight}>
            <p className={styles.contactoSub}>Nos encargamos de todo lo que necesitás para proyectar tu imagen.</p>
            <div className={styles.contactoActions}>
              <a href="mailto:creativeagencymuda@gmail.com" className={styles.filledBtn}>Escribinos</a>
              <button className={styles.ghostBtnDark} onClick={() => navigate('contacto')}>Ver contacto →</button>
            </div>
          </div>
          <div className={styles.contactoBar}>
            <span>creativeagencymuda@gmail.com</span>
            <span>@muda.agcy</span>
            <span>Palermo, Buenos Aires</span>
          </div>
        </section>
      </div>
    </>
  )
}
