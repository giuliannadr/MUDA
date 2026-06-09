import { useRef } from 'react'
import styles from './Eventos.module.css'
import Portfolio from './Portfolio'

const includes = [
  'Conceptualización del evento',
  'Desarrollo estético',
  'Búsqueda y gestión de locación',
  'Armado de ambientación',
  'Selección y coordinación de proveedores',
  'Catering, música, iluminación',
  'Supervisión el día del evento',
]

export default function Eventos() {
  const sectionRef = useRef<HTMLElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <section ref={sectionRef} className={styles.section} data-nav="light" onMouseMove={onMove}>
      <div className="section-inner">
        <p className="section-label reveal">☆ Organización de eventos</p>

        <div className={styles.layout}>
          <div>
            <h2 className={`${styles.heading} reveal`}>
              Cada evento,<br /><em>una experiencia</em><br />visual y conceptual.
            </h2>
            <p className={`${styles.desc} reveal d1`}>
              Desarrollamos el servicio de organización de eventos desde una mirada creativa
              y estética. Nos encargamos de la planificación, producción y coordinación general,
              trabajando desde la idea inicial hasta su ejecución. Nuestro enfoque está puesto
              en construir eventos alineados con la identidad de cada marca o persona.
            </p>
            <ul className={`${styles.list} reveal d2`}>
              {includes.map((item, i) => (
                <li key={item} style={{ transitionDelay: `${0.4 + i * 0.07}s` }}>
                  <span className={styles.dot} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.visual} reveal d2`}>
            <div className={styles.box}>
              <div className={styles.boxInner}>
                <span className={styles.star}>☆</span>
                <p className={styles.quote}>
                  "Experiencias coherentes,<br />cuidadas y memorables."
                </p>
              </div>
              <div className={styles.accent} />
            </div>
          </div>
        </div>

        {/* Galería de eventos realizados */}
        <div className={styles.eventos}>
          <h3 className={`${styles.eventosH} reveal`}>Eventos <em>realizados.</em></h3>
          <Portfolio categoria="evento" emptyText="Pronto, nuestros eventos…" />
        </div>
      </div>
    </section>
  )
}
