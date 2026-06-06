import { useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import styles from './Estudio.module.css'
import { imgUrl } from '../lib/cloudinary'
import { estudioFotos, ESTUDIO_FX } from '../lib/estudioFotos'

const pic = (id: string) =>
  imgUrl(id, `${ESTUDIO_FX},w_900,h_1240,c_fill,g_auto,q_auto,f_auto`)

const features = [
  ['Sala Infinito', 'Sala principal tipo infinito de cuatro paredes.'],
  ['Salas múltiples', 'Vestuario, reuniones, maquillaje o espacios de trabajo.'],
  ['Catering incluido', 'Para el equipo durante toda la jornada.'],
  ['Servicios add-on', 'Maquilladora y fotógrafe profesional opcionales.'],
]

const pad = (n: number) => String(n).padStart(2, '0')

// react-pageflip marca todas las props como requeridas; lo usamos laxo
const FlipBook = HTMLFlipBook as unknown as React.ComponentType<any>

export default function Estudio() {
  const book = useRef<any>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const flip = (dir: number) => {
    const pf = book.current?.pageFlip?.()
    if (!pf) return
    dir > 0 ? pf.flipNext() : pf.flipPrev()
  }

  const fotoPages = estudioFotos.slice(1) // 5 fotos interiores
  const totalPages = total || 10
  const atStart = page <= 0
  const atEnd = page >= totalPages - 1

  return (
    <section className={styles.section} data-nav="dark">
      <header className={styles.head}>
        <p className={`${styles.eyebrow} reveal`}>Palermo · Buenos Aires</p>
        <h2 className={`${styles.headTitle} reveal d1`}>Conocé el <em>estudio.</em></h2>
        <p className={`${styles.headText} reveal d2`}>
          Nuestro espacio para producciones, contado como una revista.
          Arrastrá la esquina o usá las flechas para pasar de hoja.
        </p>
      </header>

      <div className={styles.bookWrap}>
        <FlipBook
          ref={book}
          width={400}
          height={560}
          size="stretch"
          minWidth={280}
          maxWidth={400}
          minHeight={380}
          maxHeight={560}
          usePortrait
          drawShadow
          maxShadowOpacity={0.4}
          flippingTime={750}
          mobileScrollSupport
          className={styles.book}
          onFlip={(e: any) => setPage(e.data)}
          onInit={(e: any) => setTotal(e.object?.getPageCount?.() ?? 0)}
        >
          {/* p0 — TÍTULO (página de papel) */}
          <div className={`${styles.page} ${styles.paper} ${styles.titlePage}`}>
            <div className={styles.titleInner}>
              <p className={styles.tpKicker}>☆ Estudio</p>
              <h2 className={styles.tpTitle}>La <em>revista</em><br />del espacio.</h2>
              <p className={styles.tpLead}>Nuestro espacio en Palermo, contado hoja por hoja.</p>
              <p className={styles.tpHint}>↗ Arrastrá la esquina o usá las flechas</p>
              <span className={styles.tpMeta}>Nº 01 · Palermo, Buenos Aires</span>
            </div>
          </div>

          {/* p1 — HERO / portada de la nota */}
          <div className={`${styles.page} ${styles.cover}`}>
            <img src={pic(estudioFotos[0].id)} className={styles.coverImg} alt="" />
            <div className={styles.coverShade} />
            <div className={styles.coverInner}>
              <p className={styles.mast}>MUDA</p>
              <div className={styles.coverBottom}>
                <h3 className={styles.coverTitle}>El<br /><em>Estudio</em></h3>
                <p className={styles.coverSub}>Palermo, Buenos Aires</p>
              </div>
            </div>
          </div>

          {/* p2 — INTRO (papel) */}
          <div className={`${styles.page} ${styles.paper}`}>
            <div className={styles.paperInner}>
              <p className={styles.section_n}>El espacio</p>
              <p className={styles.intro}>
                <span className={styles.drop}>E</span>n MUDA contamos con un espacio en
                Palermo pensado para producciones fotográficas, audiovisuales y proyectos
                creativos de todo tipo.
              </p>
              <p className={styles.introSm}>
                Sala infinito de cuatro paredes · salas múltiples · catering incluido ·
                servicios add-on.
              </p>
            </div>
            <span className={styles.folio}>02</span>
          </div>

          {/* p3 */}
          <div className={`${styles.page} ${styles.photoPage}`}>
            <img src={pic(fotoPages[0].id)} className={styles.pageImg} alt={fotoPages[0].label} />
            <span className={styles.cap}>{fotoPages[0].label}</span>
          </div>
          {/* p4 */}
          <div className={`${styles.page} ${styles.photoPage}`}>
            <img src={pic(fotoPages[1].id)} className={styles.pageImg} alt={fotoPages[1].label} />
            <span className={styles.cap}>{fotoPages[1].label}</span>
          </div>

          {/* p5 — FEATURES (papel) */}
          <div className={`${styles.page} ${styles.paper}`}>
            <div className={styles.paperInner}>
              <p className={styles.section_n}>Lo que incluye</p>
              <ul className={styles.featList}>
                {features.map(([t, d]) => (
                  <li key={t} className={styles.featItem}>
                    <span className={styles.featT}>{t}</span>
                    <span className={styles.featD}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <span className={styles.folio}>05</span>
          </div>

          {/* p6 */}
          <div className={`${styles.page} ${styles.photoPage}`}>
            <img src={pic(fotoPages[2].id)} className={styles.pageImg} alt={fotoPages[2].label} />
            <span className={styles.cap}>{fotoPages[2].label}</span>
          </div>
          {/* p7 */}
          <div className={`${styles.page} ${styles.photoPage}`}>
            <img src={pic(fotoPages[3].id)} className={styles.pageImg} alt={fotoPages[3].label} />
            <span className={styles.cap}>{fotoPages[3].label}</span>
          </div>
          {/* p8 */}
          <div className={`${styles.page} ${styles.photoPage}`}>
            <img src={pic(fotoPages[4].id)} className={styles.pageImg} alt={fotoPages[4].label} />
            <span className={styles.cap}>{fotoPages[4].label}</span>
          </div>

          {/* p9 — CONTRATAPA */}
          <div className={`${styles.page} ${styles.cover} ${styles.back}`}>
            <div className={styles.backInner}>
              <p className={styles.mast}>MUDA</p>
              <h3 className={styles.backTitle}>¿Reservás<br />tu <em>producción?</em></h3>
              <p className={styles.backSub}>Palermo, Buenos Aires</p>
              <p className={styles.backTag}>@muda.agcy</p>
            </div>
          </div>
        </FlipBook>

        <div className={styles.controls}>
          <button
            className={`${styles.nav} ${atStart ? styles.navHidden : ''}`}
            onClick={() => flip(-1)}
            aria-label="Anterior"
          >←</button>
          <span className={styles.counter}>{pad(Math.min(page + 1, totalPages))} / {pad(totalPages)}</span>
          <button
            className={`${styles.nav} ${atEnd ? styles.navHidden : ''}`}
            onClick={() => flip(1)}
            aria-label="Siguiente"
          >→</button>
        </div>
      </div>
    </section>
  )
}
