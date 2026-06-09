import styles from './Produccion.module.css'
import Portfolio from './Portfolio'

export default function Produccion() {
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

        <Portfolio categoria="produccion" emptyText="Pronto, nuestras producciones…" />

        <div className={`${styles.nota} reveal`}>
          <p>
            ☆ El costo de cada producción queda sujeto al proyecto: plazos, personal, material y
            horas de trabajo. Toda producción incluye reuniones de pre y post (virtuales o presenciales).
          </p>
        </div>
      </div>
    </section>
  )
}
