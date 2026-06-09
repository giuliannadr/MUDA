import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Portfolio.module.css'
import { imgUrl } from '../lib/cloudinary'
import { ESTUDIO_FX } from '../lib/estudioFotos'
import { supabase, type Produccion as Prod } from '../lib/supabase'

const cov = (id: string, fx?: boolean) =>
  imgUrl(id, `${fx ? `${ESTUDIO_FX},` : ''}w_640,h_820,c_fill,g_auto,q_auto,f_auto`)
const full = (id: string, fx?: boolean) =>
  imgUrl(id, `${fx ? `${ESTUDIO_FX},` : ''}w_1500,q_auto,f_auto`)
const pad = (n: number) => String(n).padStart(2, '0')

type Props = { categoria: 'produccion' | 'evento'; emptyText?: string }

export default function Portfolio({ categoria, emptyText = 'Próximamente…' }: Props) {
  const [items, setItems] = useState<Prod[]>([])
  const [hover, setHover] = useState<number | null>(null)
  const [open, setOpen] = useState<Prod | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    supabase.from('producciones')
      .select('*')
      .eq('categoria', categoria)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [categoria])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <ul className={styles.index} onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
        {items.map((p, i) => (
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
        {items.length === 0 && (
          <li className={styles.rowEmpty}>{emptyText}</li>
        )}
      </ul>

      {/* Preview que sigue al cursor (desktop) */}
      {hover !== null && items[hover] && createPortal(
        <div className={styles.preview} style={{ left: pos.x, top: pos.y }}>
          <img src={cov(items[hover].cover, items[hover].fx)} alt="" />
        </div>,
        document.body
      )}

      {/* Galería de la producción/evento */}
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
              {(open.images ?? []).map((id, i) => (
                <figure key={i} className={styles.lbCell}>
                  <img src={full(id, open.fx)} alt={`${open.title} — ${i + 1}`} loading="lazy" className={styles.lbImg} />
                </figure>
              ))}
            </div>
            <p className={styles.lbCount}>
              {(open.images ?? []).length} {(open.images ?? []).length === 1 ? 'imagen' : 'imágenes'}
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
