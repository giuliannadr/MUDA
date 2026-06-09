import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Produccion.module.css'
import { imgUrl } from '../lib/cloudinary'
import { ESTUDIO_FX } from '../lib/estudioFotos'
import { supabase, type Produccion as Prod } from '../lib/supabase'

const cov = (id: string, fx?: boolean) =>
  imgUrl(id, `${fx ? `${ESTUDIO_FX},` : ''}w_640,h_820,c_fill,g_auto,q_auto,f_auto`)
const full = (id: string, fx?: boolean) =>
  imgUrl(id, `${fx ? `${ESTUDIO_FX},` : ''}w_1400,q_auto,f_auto`)
const pad = (n: number) => String(n).padStart(2, '0')

export default function Produccion() {
  const [hover, setHover] = useState<number | null>(null)
  const [open, setOpen] = useState<Prod | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [producciones, setProducciones] = useState<Prod[]>([])

  useEffect(() => {
    supabase.from('producciones')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setProducciones(data ?? []))
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <section className={styles.section} data-nav="light">
      <div className="section-inner">
        <div className={styles.head}>
          <p className="section-label reveal">☆ Producción</p>
          <h2 className={`${styles.heading} reveal`}>Nuestras<br /><em>producciones.</em></h2>
          <p className={`${styles.lead} reveal d1`}>
            Producción y dirección integral de foto y video. Cada proyecto, su propio mundo
            visual — pasá por el índice y entrá a cada producción.
          </p>
        </div>

        {/* Índice editorial */}
        <ul className={styles.index} onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
          {producciones.map((p, i) => (
            <li
              key={p.id}
              className={`${styles.row} ${hover === i ? styles.rowOn : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(h => (h === i ? null : h))}
              onClick={() => setOpen(p)}
            >
              <span className={styles.rowNum}>{pad(i + 1)}</span>
              <span className={styles.rowTitle}>{p.title}</span>
              <span className={styles.rowType}>{p.tipo}</span>
              <span className={styles.rowYear}>{p.year}</span>
              <span className={styles.rowGo}>Ver ↗</span>
              <img className={styles.rowCover} src={cov(p.cover, p.fx)} alt={p.title} loading="lazy" />
            </li>
          ))}
          {producciones.length === 0 && (
            <li className={styles.row}>
              <span className={styles.rowTitle} style={{ color: 'var(--muda-gray)' }}>Próximamente...</span>
            </li>
          )}
        </ul>

        <div className={`${styles.nota} reveal`}>
          <p>
            ☆ El costo de cada producción queda sujeto al proyecto: plazos, personal, material y
            horas de trabajo. Toda producción incluye reuniones de pre y post (virtuales o presenciales).
          </p>
        </div>
      </div>

      {/* Preview flotante que sigue al cursor (desktop) */}
      {hover !== null && createPortal(
        <div className={styles.preview} style={{ left: pos.x, top: pos.y }}>
          <img src={cov(producciones[hover].cover, producciones[hover].fx)} alt="" />
        </div>,
        document.body
      )}

      {/* Galería de la producción abierta */}
      {open && createPortal(
        <div className={styles.lb} onClick={() => setOpen(null)}>
          <div className={styles.lbHead}>
            <div>
              <p className={styles.lbMeta}>{open.tipo} · {open.year}</p>
              <h3 className={styles.lbTitle}>{open.title}</h3>
            </div>
            <button className={styles.lbClose} onClick={() => setOpen(null)} aria-label="Cerrar">✕</button>
          </div>
          <div className={styles.lbScroll} onClick={e => e.stopPropagation()}>
            <div className={styles.lbGallery}>
              {open.images.map((id, i) => (
                <figure key={i} className={styles.lbCell}>
                  <img src={full(id, open.fx)} alt={`${open.title} — ${i + 1}`} loading="lazy" className={styles.lbImg} />
                </figure>
              ))}
            </div>
            <p className={styles.lbCount}>{open.images.length} {open.images.length === 1 ? 'imagen' : 'imágenes'}</p>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
