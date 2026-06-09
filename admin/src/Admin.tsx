import { useState, useEffect, useRef } from 'react'
import { supabase, TALENTO_VACIO, type Talento, type Categoria, type Solicitud, type Produccion, PRODUCCION_VACIA } from './lib/supabase'
import { uploadImage, imgUrl } from './lib/cloudinary'

const CATS: { key: Categoria; label: string; desc: string }[] = [
  { key: 'modelos',       label: 'Modelo',        desc: 'Medidas, talles, físico' },
  { key: 'fotografos',    label: 'Fotógrafo/a',   desc: 'Estilo y especialidad' },
  { key: 'maquilladores', label: 'Maquillador/a', desc: 'Estilo y especialidad' },
]

const ROL_POR_CAT: Record<Categoria, string> = {
  modelos: 'Modelo', fotografos: 'Fotógrafx', maquilladores: 'Maquilladorx',
}

/* Clases reutilizables */
const fieldLabel = 'font-mono text-[0.58rem] tracking-[0.16em] uppercase text-ink/40'
const bigInput   = 'font-display text-[1.1rem] text-ink bg-white border-[1.5px] border-ink/12 px-[0.9rem] py-3 w-full transition-colors focus:outline-none focus:border-burgundy placeholder:text-ink/20'

/* ── Login ─────────────────────────────────────────────────── */
function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [err, setErr]     = useState('')
  const [busy, setBusy]   = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setErr(error.message)
    else onLogin()
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 bg-cream">
      <h1 className="font-display text-[4.5rem] font-light text-ink text-center leading-[0.88] m-0">
        MUDA<br /><span className="italic text-burgundy">Admin</span>
      </h1>
      <form className="flex flex-col gap-3 w-full max-w-[340px]" onSubmit={submit}>
        <input
          className="font-display text-[1.05rem] text-ink bg-white border-[1.5px] border-ink/15 px-4 py-3.5 w-full transition-colors focus:outline-none focus:border-burgundy placeholder:text-ink/25"
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input
          className="font-display text-[1.05rem] text-ink bg-white border-[1.5px] border-ink/15 px-4 py-3.5 w-full transition-colors focus:outline-none focus:border-burgundy placeholder:text-ink/25"
          type="password" placeholder="Contraseña"
          value={pass} onChange={e => setPass(e.target.value)} required />
        {err && <p className="text-[0.65rem] text-[#c0392b]">{err}</p>}
        <button
          className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-cream-2 bg-burgundy py-4 cursor-pointer mt-1.5 transition-colors hover:bg-ink disabled:opacity-50"
          disabled={busy}>
          {busy ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

/* ── Upload foto ───────────────────────────────────────────── */
function FotoUpload({ url, onUrl }: { url: string; onUrl: (u: string) => void }) {
  const [busy, setBusy]     = useState(false)
  const [preview, setPrev]  = useState<string | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  const handle = async (file: File) => {
    // Preview local instantánea mientras sube
    const local = URL.createObjectURL(file)
    setPrev(local)
    setBusy(true)
    try {
      const u = await uploadImage(file)
      onUrl(u)
    } finally {
      setBusy(false)
      URL.revokeObjectURL(local)
      setPrev(null)
    }
  }

  const shownImg = preview ?? (url ? imgUrl(url, 'w_400,h_520,c_fill,q_auto') : null)

  return (
    <div
      className={`relative bg-white aspect-[3/4] cursor-pointer overflow-hidden flex items-center justify-center transition-colors group
        ${shownImg ? 'border-[1.5px] border-solid border-ink/10' : 'border-[1.5px] border-dashed border-ink/15 hover:border-burgundy'}`}
      onClick={() => !busy && ref.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); if (busy) return; const f = e.dataTransfer.files[0]; if (f) handle(f) }}
    >
      <input ref={ref} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f) }} />

      {shownImg ? (
        <img src={shownImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <span className="text-[2rem] text-ink/20 leading-none">+</span>
      )}

      {/* Overlay de carga */}
      {busy && (
        <div className="absolute inset-0 bg-ink/55 flex flex-col items-center justify-center gap-2.5">
          <span className="w-6 h-6 border-2 border-cream-2/30 border-t-cream-2 rounded-full animate-spin" />
          <span className="font-mono text-[0.55rem] tracking-[0.18em] uppercase text-cream-2">Subiendo…</span>
        </div>
      )}

      {/* Overlay "Cambiar" solo cuando ya hay imagen y no está subiendo */}
      {!busy && url && (
        <div className="absolute inset-0 bg-ink/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
          font-mono text-[0.6rem] tracking-[0.16em] uppercase text-white">
          Cambiar
        </div>
      )}
    </div>
  )
}

/* ── Wizard form ───────────────────────────────────────────── */
function Wizard({
  initial, onSave, onCancel,
}: {
  initial: Omit<Talento, 'id' | 'created_at'>
  onSave: (d: Omit<Talento, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}) {
  const [step, setStep]     = useState(0)
  const [f, setF]           = useState(initial)
  const [saving, setSaving] = useState(false)
  const [galBusy, setGalBusy] = useState(0)
  const galeriaRef          = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF(p => ({ ...p, [k]: e.target.value }))

  const isModelo   = f.categoria === 'modelos'
  const totalSteps = 3
  const next = () => setStep(s => Math.min(s + 1, totalSteps - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const submit = async () => {
    setSaving(true)
    await onSave({ ...f, rol: ROL_POR_CAT[f.categoria] })
    setSaving(false)
  }

  const addGaleria = async (file: File) => {
    if ((f.galeria ?? []).length >= 6) return
    const u = await uploadImage(file)
    setF(p => ({ ...p, galeria: [...(p.galeria ?? []), u] }))
  }
  const removeGaleria = (i: number) =>
    setF(p => ({ ...p, galeria: (p.galeria ?? []).filter((_, idx) => idx !== i) }))

  return (
    <div className="max-w-[680px] mx-auto px-8 pt-12 pb-16">

      {/* Progress */}
      <div className="flex items-start justify-between relative mb-14">
        <div className="absolute top-2 left-2 right-2 h-px bg-ink/12" />
        <div className="absolute top-2 left-2 h-px bg-burgundy transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${(step / (totalSteps - 1)) * 100}%` }} />
        {['Datos', 'Características', 'Fotos'].map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-2 relative z-10">
            <div
              onClick={() => i < step && setStep(i)}
              className={`w-4 h-4 rounded-full border-2 transition-all
                ${i <= step ? 'bg-burgundy border-burgundy' : 'bg-ink/12 border-ink/12'}`} />
            <span className={`font-mono text-[0.52rem] tracking-[0.14em] uppercase transition-colors
              ${i <= step ? 'text-burgundy' : 'text-ink/30'}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Paso 0: Datos ──────────────────────────────── */}
      {step === 0 && (
        <div className="flex flex-col gap-7 animate-fadeUp">
          <h2 className="font-display italic text-[2.2rem] font-light text-ink m-0">¿Quién es?</h2>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="flex flex-col gap-2">
              <label className={fieldLabel}>Nombre completo</label>
              <input className={bigInput} value={f.nombre} onChange={set('nombre')}
                placeholder="Ej: Sofía Etchart" autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <label className={fieldLabel}>Edad</label>
              <input className={bigInput} type="number" value={f.edad ?? ''}
                onChange={set('edad')} placeholder="24" min={0} max={99} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>Categoría</label>
            <div className="grid grid-cols-3 gap-2.5">
              {CATS.map(c => (
                <button key={c.key} type="button"
                  onClick={() => setF(p => ({ ...p, categoria: c.key }))}
                  className={`flex flex-col items-start gap-1 px-[1.1rem] py-4 bg-white border-[1.5px] cursor-pointer text-left transition-all
                    ${f.categoria === c.key ? 'border-burgundy bg-burgundy/5' : 'border-ink/12 hover:border-burgundy/30'}`}
                >
                  <span className={`font-display italic text-base ${f.categoria === c.key ? 'text-burgundy' : 'text-ink'}`}>{c.label}</span>
                  <span className="font-mono text-[0.52rem] tracking-[0.08em] text-ink/35">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Paso 1: Características ───────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-7 animate-fadeUp">
          <h2 className="font-display italic text-[2.2rem] font-light text-ink m-0">
            {isModelo ? 'Medidas y físico' : 'Estilo de trabajo'}
          </h2>

          {isModelo ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Altura</label>
                  <input className={bigInput} value={f.altura} onChange={set('altura')} placeholder="1,73 m" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Pelo</label>
                  <input className={bigInput} value={f.pelo} onChange={set('pelo')} placeholder="Castaño, lacio" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Ojos</label>
                  <input className={bigInput} value={f.ojos} onChange={set('ojos')} placeholder="Celestes" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={fieldLabel}>
                  Medidas <span className="text-ink/25 normal-case tracking-normal ml-2">en cm</span>
                </label>
                <div className="grid grid-cols-4 gap-3 items-end">
                  <div className="flex flex-col gap-1.5">
                    <span className={fieldLabel}>Hombros</span>
                    <input className={bigInput} value={f.hombros} onChange={set('hombros')} placeholder="—" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {/* Toggle Busto / Pecho */}
                    <div className="flex gap-1">
                      {(['Busto', 'Pecho'] as const).map(opt => (
                        <button key={opt} type="button"
                          onClick={() => setF(p => ({ ...p, busto_label: opt }))}
                          className={`font-mono text-[0.5rem] tracking-[0.1em] uppercase px-1.5 py-0.5 border transition-colors
                            ${f.busto_label === opt ? 'text-burgundy border-burgundy/40' : 'text-ink/30 border-ink/12 hover:text-ink/60'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <input className={bigInput} value={f.busto} onChange={set('busto')} placeholder="—" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className={fieldLabel}>Cintura</span>
                    <input className={bigInput} value={f.cintura} onChange={set('cintura')} placeholder="—" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className={fieldLabel}>Cadera</span>
                    <input className={bigInput} value={f.cadera} onChange={set('cadera')} placeholder="—" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Talle remera</label>
                  <input className={bigInput} value={f.talle_ropa} onChange={set('talle_ropa')} placeholder="S / M / 38" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Talle pantalón</label>
                  <input className={bigInput} value={f.talle_pantalon} onChange={set('talle_pantalon')} placeholder="36 / 40" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Talle calzado</label>
                  <input className={bigInput} value={f.talle_calzado} onChange={set('talle_calzado')} placeholder="38" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Ubicación <span className="text-ink/25 normal-case tracking-normal ml-2">zona o ciudad</span></label>
                  <input className={bigInput} value={f.ubicacion} onChange={set('ubicacion')} placeholder="CABA · Zona Sur…" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Formación / Experiencia <span className="text-ink/25 normal-case tracking-normal ml-2">opcional</span></label>
                  <input className={bigInput} value={f.formacion} onChange={set('formacion')} placeholder="Multitalent, pasarela, editoriales…" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label className={fieldLabel}>Contanos sobre su trabajo</label>
              <textarea rows={5} value={f.estilo} onChange={set('estilo')}
                className="font-display text-[1.05rem] leading-[1.7] text-ink bg-white border-[1.5px] border-ink/12 px-[0.9rem] py-3.5 w-full resize-y transition-colors focus:outline-none focus:border-burgundy placeholder:text-ink/20"
                placeholder={f.categoria === 'fotografos'
                  ? 'Ej: Fotografía editorial y de moda. También hace retratos y contenido para redes…'
                  : 'Ej: Especializada en maquillaje de novia y editorial. También social y FX…'} />
            </div>
          )}
        </div>
      )}

      {/* ── Paso 2: Fotos ─────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-7 animate-fadeUp">
          <h2 className="font-display italic text-[2.2rem] font-light text-ink m-0">Fotos</h2>

          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>
              Portadas <span className="text-ink/25 normal-case tracking-normal ml-2">la 1 es principal, la 2 aparece al hover</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <FotoUpload url={f.portada_1} onUrl={u => setF(p => ({ ...p, portada_1: u }))} />
              <FotoUpload url={f.portada_2} onUrl={u => setF(p => ({ ...p, portada_2: u }))} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-1">
              <label className={fieldLabel}>
                Galería <span className="text-ink/25 normal-case tracking-normal ml-2">{(f.galeria ?? []).length}/6 fotos</span>
              </label>
              {(f.galeria ?? []).length < 6 && (
                <button type="button" disabled={galBusy > 0} onClick={() => galeriaRef.current?.click()}
                  className="font-mono text-[0.55rem] tracking-[0.12em] uppercase text-burgundy bg-transparent border border-burgundy/25 px-3 py-1.5 cursor-pointer transition-all hover:bg-burgundy hover:text-white disabled:opacity-40">
                  + Agregar
                </button>
              )}
              {galBusy > 0 && (
                <span className="flex items-center gap-2 font-mono text-[0.55rem] tracking-[0.14em] uppercase text-terra">
                  <span className="w-3 h-3 border-2 border-terra/30 border-t-terra rounded-full animate-spin" />
                  Subiendo {galBusy}…
                </span>
              )}
              <input ref={galeriaRef} type="file" accept="image/*" multiple hidden
                onChange={async e => {
                  const files = Array.from(e.target.files ?? []).slice(0, 6 - (f.galeria ?? []).length)
                  setGalBusy(files.length)
                  for (const file of files) { await addGaleria(file); setGalBusy(n => n - 1) }
                  e.target.value = ''
                }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(f.galeria ?? []).map((u, i) => (
                <div key={i} className="relative w-[90px] h-[112px] group">
                  <img src={imgUrl(u, 'w_160,h_200,c_fill,q_auto')} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeGaleria(i)}
                    className="absolute top-[3px] right-[3px] w-[22px] h-[22px] bg-ink/60 text-white border-none text-[0.55rem] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ))}
              {(f.galeria ?? []).length < 6 && (
                <div onClick={() => galeriaRef.current?.click()}
                  className="w-[90px] h-[112px] border-[1.5px] border-dashed border-ink/15 flex items-center justify-center text-[1.4rem] text-ink/20 cursor-pointer transition-all hover:border-burgundy hover:text-burgundy">
                  +
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Navegación ────────────────────────────────── */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-ink/8">
        <button type="button" onClick={step === 0 ? onCancel : prev}
          className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-ink/38 bg-transparent border-none py-3.5 cursor-pointer transition-colors hover:text-ink">
          {step === 0 ? 'Cancelar' : '← Atrás'}
        </button>
        {step < totalSteps - 1 ? (
          <button type="button" onClick={next} disabled={!f.nombre}
            className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-cream-2 bg-burgundy border-none px-9 py-3.5 cursor-pointer transition-colors hover:bg-ink disabled:opacity-40 disabled:cursor-not-allowed">
            Continuar →
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={saving || !f.nombre}
            className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-cream-2 bg-burgundy border-none px-9 py-3.5 cursor-pointer transition-colors hover:bg-ink disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? 'Guardando…' : '✓ Guardar talento'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Wizard Producción ─────────────────────────────────────── */
const TIPOS_PROD = [
  'Producción de fotos',
  'Dirección creativa visual',
  'Moda & Editorial',
  'Campaña',
  'Videoclip',
  'E-commerce',
  'Contenido',
  'Evento',
]

function WizardProduccion({
  initial, onSave, onCancel,
}: {
  initial: Omit<Produccion, 'id' | 'created_at'>
  onSave: (d: Omit<Produccion, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF]       = useState(initial)
  const [saving, setSaving] = useState(false)
  const [galBusy, setGalBusy] = useState(0)
  const galeriaRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      setF(p => ({ ...p, [k]: val }))
    }

  const submit = async () => {
    setSaving(true)
    await onSave(f)
    setSaving(false)
  }

  const addGaleria = async (file: File) => {
    if ((f.images ?? []).length >= 15) return
    const u = await uploadImage(file)
    setF(p => ({ ...p, images: [...(p.images ?? []), u] }))
  }
  const removeGaleria = (i: number) =>
    setF(p => ({ ...p, images: (p.images ?? []).filter((_, idx) => idx !== i) }))

  return (
    <div className="max-w-[680px] mx-auto px-8 pt-12 pb-16">
      <div className="flex flex-col gap-7 animate-fadeUp">
        <h2 className="font-display italic text-[2.2rem] font-light text-ink m-0">Datos del proyecto</h2>

        <div className="flex flex-col gap-2">
          <label className={fieldLabel}>Categoría</label>
          <div className="grid grid-cols-2 gap-2.5">
            {([['produccion', 'Producción', 'Foto, video, dirección creativa'], ['evento', 'Evento', 'Organización de eventos']] as const).map(([key, label, desc]) => (
              <button key={key} type="button"
                onClick={() => setF(p => ({ ...p, categoria: key }))}
                className={`flex flex-col items-start gap-1 px-[1.1rem] py-4 bg-white border-[1.5px] cursor-pointer text-left transition-all
                  ${f.categoria === key ? 'border-burgundy bg-burgundy/5' : 'border-ink/12 hover:border-burgundy/30'}`}
              >
                <span className={`font-display italic text-base ${f.categoria === key ? 'text-burgundy' : 'text-ink'}`}>{label}</span>
                <span className="font-mono text-[0.52rem] tracking-[0.08em] text-ink/35">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>Título del proyecto</label>
            <input className={bigInput} value={f.title} onChange={set('title')}
              placeholder="Ej: Editorial Otoño" autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>Año</label>
            <input className={bigInput} value={f.year} onChange={set('year')} placeholder="2026" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabel}>Tipo (servicio / formato)</label>
          <div className="grid grid-cols-4 gap-2">
            {TIPOS_PROD.map(t => (
              <button key={t} type="button"
                onClick={() => setF(p => ({ ...p, tipo: t }))}
                className={`font-mono text-[0.52rem] tracking-[0.08em] uppercase px-3 py-2.5 border cursor-pointer text-left transition-all
                  ${f.tipo === t ? 'text-burgundy border-burgundy/30 bg-burgundy/5' : 'text-ink/38 border-ink/12 hover:border-burgundy/30'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer font-mono text-[0.58rem] tracking-[0.12em] uppercase text-ink/50">
            <input type="checkbox" checked={f.fx} onChange={set('fx')} className="accent-[var(--burgundy)]" />
            Aplicar filtro visual (FX Studio)
          </label>
        </div>

        {/* Portada */}
        <div className="flex flex-col gap-2">
          <label className={fieldLabel}>Foto de portada</label>
          <div className="max-w-[240px]">
            <FotoUpload url={f.cover} onUrl={u => setF(p => ({ ...p, cover: u }))} />
          </div>
        </div>

        {/* Galería */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 mb-1">
            <label className={fieldLabel}>
              Galería <span className="text-ink/25 normal-case tracking-normal ml-2">{(f.images ?? []).length}/15 fotos</span>
            </label>
            {(f.images ?? []).length < 15 && (
              <button type="button" disabled={galBusy > 0} onClick={() => galeriaRef.current?.click()}
                className="font-mono text-[0.55rem] tracking-[0.12em] uppercase text-burgundy bg-transparent border border-burgundy/25 px-3 py-1.5 cursor-pointer transition-all hover:bg-burgundy hover:text-white disabled:opacity-40">
                + Agregar
              </button>
            )}
            {galBusy > 0 && (
              <span className="flex items-center gap-2 font-mono text-[0.55rem] tracking-[0.14em] uppercase text-terra">
                <span className="w-3 h-3 border-2 border-terra/30 border-t-terra rounded-full animate-spin" />
                Subiendo {galBusy}…
              </span>
            )}
            <input ref={galeriaRef} type="file" accept="image/*" multiple hidden
              onChange={async e => {
                const files = Array.from(e.target.files ?? []).slice(0, 15 - (f.images ?? []).length)
                setGalBusy(files.length)
                for (const file of files) { await addGaleria(file); setGalBusy(n => n - 1) }
                e.target.value = ''
              }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(f.images ?? []).map((u, i) => (
              <div key={i} className="relative w-[90px] h-[112px] group">
                <img src={imgUrl(u, 'w_160,h_200,c_fill,q_auto')} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeGaleria(i)}
                  className="absolute top-[3px] right-[3px] w-[22px] h-[22px] bg-ink/60 text-white border-none text-[0.55rem] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </button>
              </div>
            ))}
            {(f.images ?? []).length < 15 && (
              <div onClick={() => galeriaRef.current?.click()}
                className="w-[90px] h-[112px] border-[1.5px] border-dashed border-ink/15 flex items-center justify-center text-[1.4rem] text-ink/20 cursor-pointer transition-all hover:border-burgundy hover:text-burgundy">
                +
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-ink/8">
        <button type="button" onClick={onCancel}
          className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-ink/38 bg-transparent border-none py-3.5 cursor-pointer transition-colors hover:text-ink">
          Cancelar
        </button>
        <button type="button" onClick={submit} disabled={saving || !f.title || !f.cover}
          className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-cream-2 bg-burgundy border-none px-9 py-3.5 cursor-pointer transition-colors hover:bg-ink disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? 'Guardando…' : '✓ Guardar'}
        </button>
      </div>
    </div>
  )
}

/* ── Admin principal ───────────────────────────────────────── */
export default function Admin() {
  const [session, setSession]   = useState<boolean | null>(null)
  const [talentos, setTalentos] = useState<Talento[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [tab, setTab]           = useState<'talentos' | 'solicitudes' | 'producciones'>('talentos')
  const [editing, setEditing]   = useState<Talento | null>(null)
  const [adding, setAdding]     = useState(false)
  const [filter, setFilter]     = useState<string>('todos')
  const [loading, setLoading]   = useState(true)

  // Producciones state
  const [producciones, setProducciones] = useState<Produccion[]>([])
  const [editingProd, setEditingProd]   = useState<Produccion | null>(null)
  const [addingProd, setAddingProd]     = useState(false)
  const [filterProd, setFilterProd]     = useState<string>('todos')

  const ROL_POR_CAT: Record<Categoria, string> = {
    modelos: 'Modelo', fotografos: 'Fotógrafx', maquilladores: 'Maquilladorx',
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session))
    supabase.auth.onAuthStateChange((_, s) => setSession(!!s))
  }, [])

  const fetchAll = async () => {
    const [t, s, p] = await Promise.all([
      supabase.from('talentos').select('*').order('nombre'),
      supabase.from('solicitudes').select('*').order('created_at', { ascending: false }),
      supabase.from('producciones').select('*').order('created_at', { ascending: false }),
    ])
    setTalentos(t.data ?? [])
    setSolicitudes(s.data ?? [])
    setProducciones(p.data ?? [])
    setLoading(false)
  }
  useEffect(() => { if (session) fetchAll() }, [session])

  const save = async (data: Omit<Talento, 'id' | 'created_at'>) => {
    if (editing) await supabase.from('talentos').update(data).eq('id', editing.id)
    else         await supabase.from('talentos').insert(data)
    setEditing(null); setAdding(false); fetchAll()
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este talento?')) return
    await supabase.from('talentos').delete().eq('id', id)
    fetchAll()
  }

  /* Aceptar solicitud → la convierte en talento */
  const aceptar = async (s: Solicitud) => {
    const { id, created_at, contacto, ...campos } = s
    await supabase.from('talentos').insert({ ...campos, rol: ROL_POR_CAT[s.categoria] })
    await supabase.from('solicitudes').delete().eq('id', id)
    fetchAll()
  }

  const rechazar = async (id: string) => {
    if (!confirm('¿Rechazar y eliminar esta solicitud?')) return
    await supabase.from('solicitudes').delete().eq('id', id)
    fetchAll()
  }

  const saveProd = async (data: Omit<Produccion, 'id' | 'created_at'>) => {
    if (editingProd) await supabase.from('producciones').update(data).eq('id', editingProd.id)
    else             await supabase.from('producciones').insert(data)
    setEditingProd(null); setAddingProd(false); fetchAll()
  }

  const removeProd = async (id: string) => {
    if (!confirm('¿Eliminar esta producción/evento?')) return
    await supabase.from('producciones').delete().eq('id', id)
    fetchAll()
  }

  if (session === null) return null
  if (!session) return <Login onLogin={() => setSession(true)} />

  const lista = filter === 'todos' ? talentos : talentos.filter(t => t.categoria === filter)
  const listaProd = filterProd === 'todos' ? producciones : producciones.filter(p => p.categoria === filterProd)

  /* ── Wizard Talento ─────────────────────────────────── */
  if (adding || editing) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="flex items-center gap-8 px-8 py-4 bg-burgundy">
          <span className="font-display italic text-[1.1rem] text-cream-2">MUDA Admin</span>
          <span className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-cream-2/45">
            {editing ? `Editando — ${editing.nombre}` : 'Nuevo talento'}
          </span>
        </div>
        <Wizard
          initial={editing ?? TALENTO_VACIO}
          onSave={save}
          onCancel={() => { setEditing(null); setAdding(false) }}
        />
      </div>
    )
  }

  /* ── Wizard Producción ─────────────────────────────── */
  if (addingProd || editingProd) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="flex items-center gap-8 px-8 py-4 bg-burgundy">
          <span className="font-display italic text-[1.1rem] text-cream-2">MUDA Admin</span>
          <span className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-cream-2/45">
            {editingProd ? `Editando — ${editingProd.title}` : 'Nueva producción / evento'}
          </span>
        </div>
        <WizardProduccion
          initial={editingProd ?? PRODUCCION_VACIA}
          onSave={saveProd}
          onCancel={() => { setEditingProd(null); setAddingProd(false) }}
        />
      </div>
    )
  }

  /* ── Lista ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-8 py-4 bg-burgundy sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <h1 className="font-display text-[1.2rem] font-light text-cream-2 m-0">
            MUDA <span className="italic text-terra">Admin</span>
          </h1>
          <div className="flex gap-1">
            <button onClick={() => setTab('talentos')}
              className={`font-mono text-[0.58rem] tracking-[0.14em] uppercase px-3 py-1.5 cursor-pointer transition-colors
                ${tab === 'talentos' ? 'text-cream-2 border-b-2 border-terra' : 'text-cream-2/45 border-b-2 border-transparent hover:text-cream-2/80'}`}>
              Talentos
            </button>
            <button onClick={() => setTab('producciones')}
              className={`font-mono text-[0.58rem] tracking-[0.14em] uppercase px-3 py-1.5 cursor-pointer transition-colors
                ${tab === 'producciones' ? 'text-cream-2 border-b-2 border-terra' : 'text-cream-2/45 border-b-2 border-transparent hover:text-cream-2/80'}`}>
              Producciones
            </button>
            <button onClick={() => setTab('solicitudes')}
              className={`relative font-mono text-[0.58rem] tracking-[0.14em] uppercase px-3 py-1.5 cursor-pointer transition-colors
                ${tab === 'solicitudes' ? 'text-cream-2 border-b-2 border-terra' : 'text-cream-2/45 border-b-2 border-transparent hover:text-cream-2/80'}`}>
              Solicitudes
              {solicitudes.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-terra text-ink text-[0.5rem] align-middle">
                  {solicitudes.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => setSession(false))}
          className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-cream-2/55 bg-transparent border border-cream-2/20 px-3.5 py-1.5 cursor-pointer transition-all hover:text-cream-2 hover:border-cream-2/50">
          Salir
        </button>
      </header>

      {tab === 'talentos' ? (
        <>
          <div className="flex items-center justify-between px-8 py-5 border-b border-ink/8">
            <div className="flex gap-1">
              {['todos', 'modelos', 'fotografos', 'maquilladores'].map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className={`font-mono text-[0.58rem] tracking-[0.12em] uppercase px-4 py-1.5 border cursor-pointer transition-all
                    ${filter === c ? 'text-burgundy border-burgundy/30' : 'text-ink/38 border-transparent hover:text-ink'}`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => setAdding(true)}
              className="font-mono text-[0.62rem] tracking-[0.16em] uppercase text-cream-2 bg-burgundy border-none px-6 py-2.5 cursor-pointer transition-colors hover:bg-ink">
              + Nuevo talento
            </button>
          </div>

          {loading ? (
            <p className="text-center py-24 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-ink/22">Cargando…</p>
          ) : lista.length === 0 ? (
            <p className="text-center py-24 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-ink/22">No hay talentos todavía.</p>
          ) : (
            <div className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-px bg-ink/8 p-px">
              {lista.map(t => (
                <div key={t.id} className="bg-cream relative group">
                  <div className="w-full aspect-[3/4] overflow-hidden bg-ink/5">
                    {t.portada_1
                      ? <img src={imgUrl(t.portada_1, 'w_300,h_380,c_fill,q_auto')} alt={t.nombre}
                          className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]" />
                      : <div className="w-full h-full flex items-center justify-center font-display italic text-[3rem] text-burgundy/25">{t.nombre[0]}</div>}
                  </div>
                  <div className="px-[0.9rem] pt-3 pb-2.5">
                    <p className="font-display italic text-base text-ink">{t.nombre}</p>
                    <p className="font-mono text-[0.55rem] tracking-[0.12em] uppercase text-terra mt-0.5">{t.rol || t.categoria}</p>
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(t)}
                      className="font-mono text-[0.52rem] tracking-[0.1em] uppercase bg-white text-burgundy border-none px-2.5 py-1.5 cursor-pointer transition-colors hover:bg-burgundy hover:text-white">
                      Editar
                    </button>
                    <button onClick={() => remove(t.id)}
                      className="w-[26px] h-[26px] bg-white text-ink/40 border-none cursor-pointer text-[0.65rem] transition-colors hover:bg-[#c0392b] hover:text-white">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : tab === 'producciones' ? (
        /* ── Producciones ──────────────────────────────────── */
        <>
          <div className="flex items-center justify-between px-8 py-5 border-b border-ink/8">
            <div className="flex gap-1">
              {['todos', 'produccion', 'evento'].map(c => (
                <button key={c} onClick={() => setFilterProd(c)}
                  className={`font-mono text-[0.58rem] tracking-[0.12em] uppercase px-4 py-1.5 border cursor-pointer transition-all
                    ${filterProd === c ? 'text-burgundy border-burgundy/30' : 'text-ink/38 border-transparent hover:text-ink'}`}>
                  {c === 'todos' ? 'Todos' : c === 'produccion' ? 'Producciones' : 'Eventos'}
                </button>
              ))}
            </div>
            <button onClick={() => setAddingProd(true)}
              className="font-mono text-[0.62rem] tracking-[0.16em] uppercase text-cream-2 bg-burgundy border-none px-6 py-2.5 cursor-pointer transition-colors hover:bg-ink">
              + Nueva producción / evento
            </button>
          </div>

          {loading ? (
            <p className="text-center py-24 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-ink/22">Cargando…</p>
          ) : listaProd.length === 0 ? (
            <p className="text-center py-24 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-ink/22">No hay producciones todavía.</p>
          ) : (
            <div className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-px bg-ink/8 p-px">
              {listaProd.map(p => (
                <div key={p.id} className="bg-cream relative group">
                  <div className="w-full aspect-[3/4] overflow-hidden bg-ink/5">
                    {p.cover
                      ? <img src={imgUrl(p.cover, 'w_300,h_380,c_fill,q_auto')} alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]" />
                      : <div className="w-full h-full flex items-center justify-center font-display italic text-[3rem] text-burgundy/25">{p.title[0]}</div>}
                  </div>
                  <div className="px-[0.9rem] pt-3 pb-2.5">
                    <p className="font-display italic text-base text-ink">{p.title}</p>
                    <p className="font-mono text-[0.55rem] tracking-[0.12em] uppercase text-terra mt-0.5">
                      {p.tipo} · {p.year}
                    </p>
                    <p className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-ink/30 mt-0.5">
                      {p.categoria === 'produccion' ? 'Producción' : 'Evento'} · {(p.images ?? []).length} fotos
                    </p>
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingProd(p)}
                      className="font-mono text-[0.52rem] tracking-[0.1em] uppercase bg-white text-burgundy border-none px-2.5 py-1.5 cursor-pointer transition-colors hover:bg-burgundy hover:text-white">
                      Editar
                    </button>
                    <button onClick={() => removeProd(p.id)}
                      className="w-[26px] h-[26px] bg-white text-ink/40 border-none cursor-pointer text-[0.65rem] transition-colors hover:bg-[#c0392b] hover:text-white">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Solicitudes ──────────────────────────────────── */
        loading ? (
          <p className="text-center py-24 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-ink/22">Cargando…</p>
        ) : solicitudes.length === 0 ? (
          <p className="text-center py-24 font-mono text-[0.62rem] tracking-[0.16em] uppercase text-ink/22">No hay solicitudes pendientes.</p>
        ) : (
          <div className="max-w-[900px] mx-auto px-8 py-8 flex flex-col gap-4">
            {solicitudes.map(s => <SolicitudCard key={s.id} s={s} onAceptar={aceptar} onRechazar={rechazar} />)}
          </div>
        )
      )}
    </div>
  )
}

/* ── Card de solicitud ─────────────────────────────────────── */
function SolicitudCard({
  s, onAceptar, onRechazar,
}: { s: Solicitud; onAceptar: (s: Solicitud) => void; onRechazar: (id: string) => void }) {
  const [busy, setBusy] = useState(false)
  const fotos = [s.portada_1, s.portada_2, ...(s.galeria ?? [])].filter(Boolean)

  const medidas = s.categoria === 'modelos'
    ? [s.altura, s.hombros && `H${s.hombros}`, (s.busto && s.cintura && s.cadera) && `${s.busto}-${s.cintura}-${s.cadera}`,
       s.talle_calzado && `Cal.${s.talle_calzado}`, s.ubicacion].filter(Boolean).join(' · ')
    : s.estilo

  return (
    <div className="bg-white border border-ink/10 p-5 flex gap-5">
      {/* Fotos */}
      <div className="flex gap-1.5 shrink-0">
        {fotos.slice(0, 3).map((u, i) => (
          <img key={i} src={imgUrl(u, 'w_120,h_160,c_fill,q_auto')} alt=""
            className="w-[70px] h-[94px] object-cover" />
        ))}
        {fotos.length === 0 && (
          <div className="w-[70px] h-[94px] bg-ink/5 flex items-center justify-center font-display italic text-2xl text-burgundy/25">
            {s.nombre[0]}
          </div>
        )}
      </div>

      {/* Datos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="font-display italic text-xl text-ink">{s.nombre}</p>
          {s.edad && <span className="font-mono text-[0.6rem] text-ink/45">{s.edad} años</span>}
          <span className="font-mono text-[0.52rem] tracking-[0.14em] uppercase text-terra">{s.categoria}</span>
        </div>
        {medidas && <p className="font-mono text-[0.62rem] text-ink/55 mt-1.5 leading-relaxed">{medidas}</p>}
        <p className="font-mono text-[0.6rem] text-ink/45 mt-2">
          <span className="text-ink/30 uppercase tracking-[0.12em]">Contacto:</span> {s.contacto}
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-2 shrink-0 self-center">
        <button disabled={busy}
          onClick={async () => { setBusy(true); await onAceptar(s) }}
          className="font-mono text-[0.55rem] tracking-[0.14em] uppercase text-cream-2 bg-burgundy border-none px-4 py-2 cursor-pointer transition-colors hover:bg-ink disabled:opacity-50">
          {busy ? '…' : '✓ Aceptar'}
        </button>
        <button disabled={busy} onClick={() => onRechazar(s.id)}
          className="font-mono text-[0.55rem] tracking-[0.14em] uppercase text-ink/45 bg-transparent border border-ink/15 px-4 py-2 cursor-pointer transition-all hover:text-[#c0392b] hover:border-[#c0392b]/40 disabled:opacity-50">
          Rechazar
        </button>
      </div>
    </div>
  )
}
