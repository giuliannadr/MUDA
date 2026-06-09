import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './Portfolio.module.css'
import { imgUrl } from '../lib/cloudinary'
import { ESTUDIO_FX } from '../lib/estudioFotos'
import { supabase, type Produccion as Prod } from '../lib/supabase'

const fx = (on?: boolean) => (on ? `${ESTUDIO_FX},` : '')
const cover = (id: string, f?: boolean) => imgUrl(id, `${fx(f)}w_720,h_900,c_fill,g_auto,q_auto,f_auto`)
const thumb = (id: string, f?: boolean) => imgUrl(id, `${fx(f)}w_440,h_440,c_fill,g_auto,q_auto,f_auto`)
const full = (id: string, f?: boolean) => imgUrl(id, `${fx(f)}w_1700,q_auto,f_auto`)
const pad = (n: number) => String(n).padStart(2, '0')

type Props = { categoria: 'produccion' | 'evento'; emptyText?: string }

export default function Portfolio({ categoria, emptyText = 'Próximamente…' }: Props) {
  const [items, setItems] = useState<Prod[]>([])
  const [open, setOpen] = useState<Prod | null>(null)
  const [idx, setIdx] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('producciones')
      .select('*')
      .eq('categoria', categoria)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [categoria])

  const close = useCallback(() => { setOpen(null); setIdx(null) }, [])
  const nav = useCallback((d: number) => {
    setIdx(i => {
      if (i === null || !open) return i
      const n = open.images?.length ?? 0
      return n ? (i + d + n) % n : i
    })
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { idx !== null ? setIdx(null) : close() }
      if (idx !== null) {
        if (e.key === 'ArrowRight') nav(1)
        if (e.key === 'ArrowLeft') nav(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, idx, close, nav])

  return (
    <>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.grid}>
          {items.map((p, i) => (
            <button
              key={p.id}
              className={styles.card}
              style={{ '--d': `${i * 65}ms` } as React.CSSProperties}
              onClick={() => setOpen(p)}
            >
              <img className={styles.cardImg} src={cover(p.cover, p.fx)} alt={p.title} loading="lazy" />
              <span className={styles.cardNum}>{pad(i + 1)}</span>
              <span className={styles.cardCount}>{(p.images ?? []).length} fotos</span>
              <div className={styles.cardInfo}>
                <span className={styles.cardType}>{p.tipo}{p.year ? ` · ${p.year}` : ''}</span>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <span className={styles.cardGo}>Ver producción ↗</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay: grilla de miniaturas de esa producción */}
      {open && createPortal(
        <div className={styles.ov}>
          <header className={styles.ovHead}>
            <div>
              <p className={styles.ovType}>{open.tipo} · {open.year}</p>
              <h3 className={styles.ovTitle}>{open.title}</h3>
            </div>
            <button className={styles.ovClose} onClick={close} aria-label="Cerrar">✕</button>
          </header>

          <div className={styles.ovScroll}>
            <div className={styles.thumbs}>
              {(open.images ?? []).map((id, i) => (
                <button key={i} className={styles.thumb} onClick={() => setIdx(i)} aria-label={`Foto ${i + 1}`}>
                  <img src={thumb(id, open.fx)} alt={`${open.title} ${i + 1}`} loading="lazy" />
                  <span className={styles.thumbZoom}>⤢</span>
                </button>
              ))}
            </div>
            {(open.images ?? []).length === 0 && (
              <p className={styles.ovEmpty}>Esta producción todavía no tiene fotos.</p>
            )}
          </div>

          {/* Visor de una imagen a pantalla */}
          {idx !== null && open.images?.[idx] && (
            <div className={styles.viewer} onClick={() => setIdx(null)}>
              <button className={styles.vClose} onClick={e => { e.stopPropagation(); setIdx(null) }} aria-label="Cerrar">✕</button>
              {open.images.length > 1 && (
                <button className={`${styles.vArrow} ${styles.vPrev}`} onClick={e => { e.stopPropagation(); nav(-1) }} aria-label="Anterior">←</button>
              )}
              <img className={styles.vImg} src={full(open.images[idx], open.fx)} alt="" onClick={e => e.stopPropagation()} />
              {open.images.length > 1 && (
                <button className={`${styles.vArrow} ${styles.vNext}`} onClick={e => { e.stopPropagation(); nav(1) }} aria-label="Siguiente">→</button>
              )}
              <span className={styles.vCount}>{pad(idx + 1)} / {pad(open.images.length)}</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
