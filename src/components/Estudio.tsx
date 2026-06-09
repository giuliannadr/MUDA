import type { View } from '../App'
import styles from './Estudio.module.css'
import { imgUrl } from '../lib/cloudinary'
import { ESTUDIO_FX } from '../lib/estudioFotos'
import { whatsappLink } from '../lib/config'

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
    desc: 'Sala infinito de cuatro paredes, ideal para campañas de moda, e-commerce, contenido y producciones comerciales.',
    fx: true,
    photos: ['espacio1_wmgx1f', 'espacio3_wiwpo3', 'espacio2_b7rpbk'],
  },
  {
    n: '02',
    title: 'Salas Privadas',
    kicker: 'Espacios íntimos',
    desc: 'Salas de usos múltiples adaptables a cada proyecto: vestuario, reuniones de producción, maquillaje o descanso del equipo.',
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
    desc: 'El alquiler incluye catering y una estación de café para que el equipo trabaje cómodo durante toda la jornada.',
    fx: false,
    photos: [
      'WhatsApp_Image_2026-06-09_at_08.30.07_1_rnvsjz',
      'WhatsApp_Image_2026-06-09_at_08.30.06_livted',
    ],
  },
]

// Ancho fijo, alto natural → la foto se ve completa, sin recortes
const pic = (id: string, fx: boolean) =>
  imgUrl(id, `${fx ? `${ESTUDIO_FX},` : ''}w_1000,q_auto,f_auto`)

export default function Estudio({ navigate }: { navigate: (v: View) => void }) {
  return (
    <section className={styles.section} data-nav="dark">
      {/* ── Encabezado ── */}
      <header className={styles.head}>
        <p className={styles.eyebrow}>Palermo · Buenos Aires</p>
        <h2 className={styles.headTitle}>El <em>estudio.</em></h2>
        <p className={styles.headText}>
          Un espacio pensado para producciones fotográficas, audiovisuales y proyectos
          creativos. Recorrelo por dentro.
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

            <div className={`${styles.photos} ${ch.photos.length === 1 ? styles.single : ''}`}>
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
          </section>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className={styles.cta}>
        <h3 className={styles.ctaTitle}>¿Reservás<br />tu <em>producción?</em></h3>
        <p className={styles.ctaText}>Contános tu proyecto y armamos la jornada en el estudio.</p>
        <div className={styles.ctaBtns}>
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
      </div>
    </section>
  )
}
