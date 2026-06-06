import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './Estudio.module.css'
import { imgUrl } from '../lib/cloudinary'
import { estudioFotos } from '../lib/estudioFotos'

const features = [
  { title: 'Sala Infinito', desc: 'Sala principal tipo infinito de cuatro paredes. Ideal para sesiones de fotos, campañas de moda, creación de contenido y producciones comerciales.' },
  { title: 'Salas múltiples', desc: 'Salas de usos múltiples adaptables a cada proyecto: vestuario, reuniones de producción, maquillaje o espacios de trabajo.' },
  { title: 'Catering incluido', desc: 'El servicio de alquiler incluye catering para el equipo de trabajo, brindando mayor comodidad durante la jornada.' },
  { title: 'Servicios add-on', desc: 'Posibilidad de sumar maquilladora y fotógrafe profesional, a criterio y preferencia de cada cliente.' },
]

const N = estudioFotos.length
const pad = (n: number) => String(n).padStart(2, '0')

export default function Estudio() {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const go = useCallback((dir: number) => {
    setActive(a => (a + dir + N) % N)
  }, [])

  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightbox, go])

  const cur = estudioFotos[active]

  return (
    <section className={styles.section} data-nav="dark">
      {/* ── HERO cinematográfico ── */}
      <div className={styles.hero}>
        <img
          src={imgUrl(estudioFotos[0].id, 'w_2200,h_1240,c_fill,g_auto,q_auto,f_auto')}
          alt="Estudio MUDA — Palermo, Buenos Aires"
          className={styles.heroImg}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={`${styles.heroKicker} reveal`}>☆ Estudio</p>
          <h2 className={`${styles.heroH} reveal d1`}>El espacio donde<br />todo <em>cobra vida.</em></h2>
          <p className={`${styles.heroLoc} reveal d2`}>Palermo · Buenos Aires</p>
        </div>
        <div className={styles.heroBadge}>{pad(N)} espacios</div>
      </div>

      {/* ── GALERÍA: visor grande + miniaturas ── */}
      <div className={styles.galleryWrap}>
        <p className={styles.intro}>
          En MUDA contamos con un espacio en Palermo pensado para producciones
          fotográficas, audiovisuales y proyectos creativos de todo tipo.
        </p>

        <div className={styles.viewer}>
          <button className={`${styles.nav} ${styles.navL}`} onClick={() => go(-1)} aria-label="Anterior">←</button>

          <div className={styles.stage} onClick={() => setLightbox(true)}>
            {estudioFotos.map((p, i) => (
              <img
                key={p.id}
                src={imgUrl(p.id, 'w_1600,h_1040,c_fill,g_auto,q_auto,f_auto')}
                alt={p.label}
                className={`${styles.stageImg} ${i === active ? styles.on : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
            <div className={styles.stageBar}>
              <span className={styles.stageLabel}>{cur.label}</span>
              <span className={styles.stageCount}>{pad(active + 1)} / {pad(N)}</span>
            </div>
            <span className={styles.expand}>⤢ Ampliar</span>
          </div>

          <button className={`${styles.nav} ${styles.navR}`} onClick={() => go(1)} aria-label="Siguiente">→</button>
        </div>

        <div className={styles.thumbs}>
          {estudioFotos.map((p, i) => (
            <button
              key={p.id}
              className={`${styles.thumb} ${i === active ? styles.thumbOn : ''}`}
              onClick={() => setActive(i)}
              aria-label={p.label}
            >
              <img src={imgUrl(p.id, 'w_300,h_300,c_fill,g_auto,q_auto,f_auto')} alt={p.label} loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {/* ── FEATURES (banda bordó) ── */}
      <div className={styles.featuresWrap}>
        <div className={styles.featuresInner}>
          <h3 className={styles.featuresH}>Todo lo que incluye<br /><em>el espacio.</em></h3>
          <div className={styles.features}>
            {features.map(f => (
              <div key={f.title} className={styles.feature}>
                <p className={styles.featureTitle}>{f.title}</p>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX (portal a body para escapar el transform de la página) ── */}
      {lightbox && createPortal(
        <div className={styles.lightbox} onClick={() => setLightbox(false)}>
          <button className={styles.lbClose} onClick={() => setLightbox(false)} aria-label="Cerrar">✕</button>
          <button className={`${styles.lbNav} ${styles.lbL}`} onClick={e => { e.stopPropagation(); go(-1) }} aria-label="Anterior">←</button>
          <img
            src={imgUrl(cur.id, 'w_1900,q_auto,f_auto')}
            alt={cur.label}
            className={styles.lbImg}
            onClick={e => e.stopPropagation()}
          />
          <button className={`${styles.lbNav} ${styles.lbR}`} onClick={e => { e.stopPropagation(); go(1) }} aria-label="Siguiente">→</button>
          <div className={styles.lbCaption}>{cur.label} · {pad(active + 1)} / {pad(N)}</div>
        </div>,
        document.body
      )}
    </section>
  )
}
