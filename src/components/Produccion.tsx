import styles from './Produccion.module.css'

const tipos = [
  'Moda & editorial',
  'E-commerce',
  'Campañas',
  'Videoclips',
  'Contenido para redes',
  'Perfiles de artista',
]

const incluye: [string, string][] = [
  ['Maquillaje & peinado', 'Maquilladorx y peinadorx para el shooting.'],
  ['Fotografía & video', 'Fotógrafx / realizadorx según el proyecto.'],
  ['Locación', 'Búsqueda de locación: estudio o calle.'],
  ['Dirección de arte', 'Armado del espacio visual y escenografía.'],
  ['Estilismo', 'Asesoría y armado de vestuario.'],
  ['Dirección creativa', 'Concepto, moodboards y ejecución estética.'],
]

export default function Produccion() {
  return (
    <section className={styles.section} data-nav="light">
      <div className="section-inner">
        <p className="section-label reveal">☆ Servicios</p>
        <h2 className={`${styles.heading} reveal`}>
          Producción <em>foto & video</em><br />+ dirección creativa.
        </h2>

        <div className={styles.layout}>
          <div className="reveal">
            <p className={styles.leadText}>
              Nuestro servicio principal: producción y dirección integral. Desarrollamos el
              concepto, la bajada visual y la ejecución en conjunto con cada cliente —
              organizamos, planificamos y producimos el shooting de principio a fin.
            </p>
            <p className={styles.leadNote}>
              ¿Ya tenés algunos elementos resueltos (maquillaje, foto, locación)? Contratás solo
              la Producción y Dirección. Y si solo necesitás el concepto, está la Dirección
              Creativa por separado.
            </p>
          </div>

          <div className="reveal d1">
            <p className={styles.blockLabel}>Qué producimos</p>
            <div className={styles.tipoTags}>
              {tipos.map(t => <span key={t} className={styles.tipoTag}>{t}</span>)}
            </div>
          </div>
        </div>

        <div className="reveal">
          <p className={styles.blockLabel}>Qué incluye una producción</p>
          <div className={styles.incluyeGrid}>
            {incluye.map(([t, d]) => (
              <div key={t} className={styles.incItem}>
                <span className={styles.incT}>{t}</span>
                <span className={styles.incD}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.nota} reveal`}>
          <p>
            ☆ El costo de cada producción queda sujeto al proyecto: plazos, cantidad de personal,
            material y horas de trabajo. Toda producción requiere reuniones de pre y post
            producción (virtuales o presenciales).
          </p>
        </div>
      </div>
    </section>
  )
}
