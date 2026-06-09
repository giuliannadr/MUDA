import { useRef, useState, useEffect } from 'react'
import type { View } from '../App'
import styles from './Estudio.module.css'
import { imgUrl } from '../lib/cloudinary'
import { ESTUDIO_FX } from '../lib/estudioFotos'
import { whatsappLink, WEB3FORMS_KEY, MUDA_EMAIL } from '../lib/config'

type Chapter = {
  n: string
  title: string
  kicker: string
  desc: string
  fx: boolean
  photos: string[]
}

const chapters: Chapter[] = [
  {
    n: '01',
    title: 'Espacio Infinito',
    kicker: 'Sala blanca',
    desc: 'Sala principal tipo infinito de cuatro paredes. Ideal para sesiones de fotos, campañas de moda, creación de contenido y producciones comerciales.',
    fx: true,
    photos: ['espacio1_wmgx1f', 'espacio3_wiwpo3', 'espacio2_b7rpbk'],
  },
  {
    n: '02',
    title: 'Salas Privadas',
    kicker: 'Espacios íntimos',
    desc: 'Salas de usos múltiples adaptables a cada proyecto: vestuario, reuniones de producción, maquillaje o espacios de trabajo.',
    fx: false,
    photos: [
      'WhatsApp_Image_2026-06-09_at_08.29.49_jj8uy2',
      'WhatsApp_Image_2026-06-09_at_08.29.49_1_uxgvvq',
      'WhatsApp_Image_2026-06-09_at_08.30.07_nvfadc',
    ],
  },
  {
    n: '03',
    title: 'Café & Comida',
    kicker: 'Pausa',
    desc: 'El servicio de alquiler incluye catering para el equipo de trabajo, brindando mayor comodidad durante la jornada.',
    fx: false,
    photos: [
      'WhatsApp_Image_2026-06-09_at_08.30.07_1_rnvsjz',
      'WhatsApp_Image_2026-06-09_at_08.30.06_livted',
    ],
  },
]

// Ancho fijo, alto natural → en desktop la foto se ve completa, sin recortes
const pic = (id: string, fx: boolean) =>
  imgUrl(id, `${fx ? `${ESTUDIO_FX},` : ''}w_1000,q_auto,f_auto`)

const SLIDE_MS = 3800 // tiempo en cada imagen del carrusel (mobile)

// Anima el scroll horizontal a mano (no depende de scroll-behavior: smooth)
function animateScroll(el: HTMLElement, target: number, dur = 650) {
  const start = el.scrollLeft
  const change = target - start
  if (Math.abs(change) < 1) return
  const t0 = performance.now()
  const step = (now: number) => {
    const p = Math.min((now - t0) / dur, 1)
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
    el.scrollLeft = start + change * ease
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/* Fotos del capítulo:
   - desktop: pila vertical (alto natural, sin recortes)
   - mobile: carrusel que pasa solo, infinito, y se puede deslizar a mano */
function ChapterPhotos({ ch }: { ch: Chapter }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const pausedUntil = useRef(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el || ch.photos.length < 2) return
    const mq = window.matchMedia('(max-width: 760px)')

    const timer = window.setInterval(() => {
      if (!mq.matches || !el.clientWidth || Date.now() < pausedUntil.current) return
      const cur = Math.round(el.scrollLeft / el.clientWidth)
      const next = (cur + 1) % ch.photos.length
      animateScroll(el, el.clientWidth * next)
    }, SLIDE_MS)

    const onScroll = () => {
      if (el.clientWidth) setActive(Math.round(el.scrollLeft / el.clientWidth))
    }
    // al tocar/deslizar, pausa el auto unos segundos
    const onTouch = () => { pausedUntil.current = Date.now() + 6000 }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('touchstart', onTouch, { passive: true })
    return () => {
      clearInterval(timer)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('touchstart', onTouch)
    }
  }, [ch.photos.length])

  const goTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    pausedUntil.current = Date.now() + 6000
    animateScroll(el, el.clientWidth * i)
  }

  return (
    <div className={styles.photos}>
      <div className={styles.track} ref={trackRef}>
        {ch.photos.map(id => (
          <figure key={id} className={styles.cell}>
            <img
              src={pic(id, ch.fx)}
              alt={`Estudio MUDA — ${ch.title}`}
              loading="lazy"
              className={styles.cellImg}
            />
          </figure>
        ))}
      </div>
      {ch.photos.length > 1 && (
        <div className={styles.dots}>
          {ch.photos.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotOn : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const TIPOS = ['Sesión de fotos', 'Audiovisual', 'Creación de contenido', 'Campaña / e-commerce', 'Otro']

/* Select custom (diseñado, no el nativo del navegador) */
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  return (
    <div className={styles.select} ref={ref}>
      <button
        type="button"
        className={`${styles.selectBtn} ${open ? styles.selectOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span>{value}</span>
        <span className={styles.selectChevron}>⌄</span>
      </button>
      {open && (
        <ul className={styles.selectList}>
          {options.map(o => (
            <li key={o}>
              <button
                type="button"
                className={`${styles.selectOpt} ${o === value ? styles.selectOptOn : ''}`}
                onClick={() => { onChange(o); setOpen(false) }}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* Formulario de consulta → manda un mail con los datos a MUDA */
function ConsultaForm() {
  const [f, setF] = useState({ nombre: '', email: '', telefono: '', fecha: '', tipo: TIPOS[0], mensaje: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'mailto' | 'error'>('idle')
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF(s => ({ ...s, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Opción A: envío silencioso por Web3Forms (si hay access key cargada)
    if (WEB3FORMS_KEY) {
      setStatus('sending')
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `Consulta de estudio — ${f.nombre || 'sin nombre'}`,
            from_name: 'Web MUDA · Estudio',
            Nombre: f.nombre,
            Email: f.email,
            'WhatsApp / Teléfono': f.telefono,
            'Para cuándo': f.fecha,
            'Tipo de producción': f.tipo,
            Mensaje: f.mensaje,
          }),
        })
        const data = await res.json()
        setStatus(data.success ? 'sent' : 'error')
      } catch {
        setStatus('error')
      }
      return
    }

    // Opción B (fallback): abre el mail del usuario ya armado hacia MUDA
    if (MUDA_EMAIL) {
      const body = [
        `Nombre: ${f.nombre}`,
        `Email: ${f.email}`,
        `WhatsApp / Teléfono: ${f.telefono}`,
        `Para cuándo: ${f.fecha}`,
        `Tipo de producción: ${f.tipo}`,
        '',
        f.mensaje,
      ].join('\n')
      window.location.href =
        `mailto:${MUDA_EMAIL}?subject=${encodeURIComponent(`Consulta de estudio — ${f.nombre || ''}`)}&body=${encodeURIComponent(body)}`
      setStatus('mailto')
      return
    }

    setStatus('error')
  }

  if (status === 'sent') {
    return (
      <div className={styles.formDone}>
        <p className={styles.formDoneTitle}>¡Consulta enviada! ✓</p>
        <p className={styles.formDoneText}>Te contactamos a la brevedad. ¡Gracias!</p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formRow}>
        <input className={styles.input} placeholder="Nombre" required value={f.nombre} onChange={set('nombre')} />
        <input className={styles.input} type="email" placeholder="Email" required value={f.email} onChange={set('email')} />
      </div>
      <div className={styles.formRow}>
        <input className={styles.input} placeholder="WhatsApp / teléfono" value={f.telefono} onChange={set('telefono')} />
        <input className={styles.input} placeholder="¿Para cuándo?" value={f.fecha} onChange={set('fecha')} />
      </div>
      <Select value={f.tipo} onChange={v => setF(s => ({ ...s, tipo: v }))} options={TIPOS} />
      <textarea
        className={styles.textarea}
        placeholder="Contanos tu proyecto: qué necesitás, fechas, equipo…"
        rows={3}
        value={f.mensaje}
        onChange={set('mensaje')}
      />
      <button className={styles.formBtn} type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Enviar consulta →'}
      </button>
      {status === 'mailto' && (
        <p className={styles.formHint}>Te abrimos tu app de mail con la consulta lista para enviar ✉️</p>
      )}
      {status === 'error' && (
        <p className={styles.formError}>No se pudo enviar. Probá por WhatsApp 👉</p>
      )}
    </form>
  )
}

export default function Estudio({ navigate }: { navigate: (v: View) => void }) {
  return (
    <section className={styles.section} data-nav="dark">
      {/* ── Encabezado ── */}
      <header className={styles.head}>
        <p className={styles.eyebrow}>Palermo · Buenos Aires</p>
        <h2 className={styles.headTitle}>El <em>estudio.</em></h2>
        <p className={styles.headText}>
          En MUDA contamos con un espacio en Palermo pensado para la realización de
          producciones fotográficas, audiovisuales y proyectos creativos de todo tipo.
        </p>
      </header>

      {/* ── Capítulos alternados ── */}
      <div className={styles.mag}>
        {chapters.map((ch, idx) => (
          <section
            key={ch.n}
            className={`${styles.chapter} ${idx % 2 === 1 ? styles.reverse : ''}`}
          >
            <div className={styles.text}>
              <span className={styles.chapterNum}>{ch.n}</span>
              <span className={styles.chapterKicker}>{ch.kicker}</span>
              <h3 className={styles.chapterTitle}>{ch.title}</h3>
              <p className={styles.chapterDesc}>{ch.desc}</p>
            </div>

            <ChapterPhotos ch={ch} />
          </section>
        ))}
      </div>

      {/* ── CTA con formulario ── */}
      <div className={styles.cta}>
        <div className={styles.ctaLeft}>
          <h3 className={styles.ctaTitle}>¿Reservás<br />tu <em>producción?</em></h3>
          <p className={styles.ctaText}>
            Contános tu proyecto y armamos la jornada en el estudio. Podés sumar
            maquilladora y fotógrafe profesional, a criterio de cada cliente.
          </p>
          <a
            className={styles.ctaBtn}
            href={whatsappLink('¡Hola MUDA! Quiero alquilar el estudio para una producción.')}
            target="_blank"
            rel="noopener"
          >
            Escribinos por WhatsApp →
          </a>
          <button className={styles.ctaGhost} onClick={() => navigate('contacto')}>
            Ver contacto
          </button>
        </div>

        <div className={styles.ctaRight}>
          <p className={styles.formLabel}>O dejanos tu consulta</p>
          <ConsultaForm />
        </div>
      </div>
    </section>
  )
}
