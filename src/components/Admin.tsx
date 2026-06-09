import { useState, useEffect } from 'react'
import { supabase, TALENTO_VACIO, type Talento, type Categoria } from '../lib/supabase'
import { uploadImage, imgUrl } from '../lib/cloudinary'
import styles from './Admin.module.css'

const CATS: Categoria[] = ['modelos', 'fotografos', 'maquilladores']

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
    <div className={styles.loginWrap}>
      <h1 className={styles.loginTitle}>MUDA<br /><em>Admin</em></h1>
      <form className={styles.loginForm} onSubmit={submit}>
        <input className={styles.input} type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input className={styles.input} type="password" placeholder="Contraseña"
          value={pass} onChange={e => setPass(e.target.value)} required />
        {err && <p className={styles.error}>{err}</p>}
        <button className={styles.btn} disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </div>
  )
}

/* ── Upload helper ─────────────────────────────────────────── */
function ImgUpload({ label, url, onUrl }: { label: string; url: string; onUrl: (u: string) => void }) {
  const [busy, setBusy] = useState(false)
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setBusy(true)
    const u = await uploadImage(f)
    onUrl(u); setBusy(false)
  }
  return (
    <div className={styles.field}>
      <label>{label}</label>
      {url && <img src={imgUrl(url, 'w_120,h_160,c_fill,q_auto')} className={styles.preview} alt="" />}
      <input type="file" accept="image/*" onChange={handle} className={styles.fileInput} />
      {busy && <span className={styles.uploading}>Subiendo…</span>}
    </div>
  )
}

/* ── Galería upload ────────────────────────────────────────── */
function GaleriaUpload({ urls, onUrls }: { urls: string[]; onUrls: (u: string[]) => void }) {
  const [busy, setBusy] = useState(false)

  const add = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setBusy(true)
    const nuevas = await Promise.all(files.map(uploadImage))
    onUrls([...urls, ...nuevas].slice(0, 6))
    setBusy(false)
  }

  const remove = (i: number) => onUrls(urls.filter((_, idx) => idx !== i))

  return (
    <div className={styles.field}>
      <label>Galería (máx. 6 fotos)</label>
      <div className={styles.galeriaGrid}>
        {urls.map((u, i) => (
          <div key={i} className={styles.galeriaItem}>
            <img src={imgUrl(u, 'w_100,h_100,c_fill,q_auto')} alt="" />
            <button type="button" className={styles.removeBtn} onClick={() => remove(i)}>✕</button>
          </div>
        ))}
        {urls.length < 6 && (
          <label className={styles.addPhoto}>
            <span>+ Foto</span>
            <input type="file" accept="image/*" multiple onChange={add} hidden />
          </label>
        )}
      </div>
      {busy && <span className={styles.uploading}>Subiendo…</span>}
    </div>
  )
}

/* ── Formulario ────────────────────────────────────────────── */
function Form({
  initial, onSave, onCancel,
}: {
  initial: Omit<Talento, 'id' | 'created_at'>
  onSave: (d: Omit<Talento, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF]     = useState(initial)
  const [busy, setBusy] = useState(false)

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF(p => ({ ...p, [k]: e.target.value }))

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setBusy(true)
    await onSave(f); setBusy(false)
  }

  const isModelo = f.categoria === 'modelos'

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>

        {/* Campos comunes */}
        <div className={styles.field}>
          <label>Nombre completo *</label>
          <input className={styles.input} value={f.nombre} onChange={set('nombre')} required />
        </div>
        <div className={styles.field}>
          <label>Edad</label>
          <input className={styles.input} type="number" value={f.edad ?? ''} onChange={set('edad')} min={0} max={99} />
        </div>
        <div className={styles.field}>
          <label>Categoría *</label>
          <select className={styles.input} value={f.categoria} onChange={set('categoria')}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Título / Rol</label>
          <input className={styles.input} value={f.rol} onChange={set('rol')} placeholder="Modelo, Fotógrafa…" />
        </div>

        {/* Solo modelos */}
        {isModelo && <>
          <div className={styles.field}>
            <label>Altura</label>
            <input className={styles.input} value={f.altura} onChange={set('altura')} placeholder="1,73 m" />
          </div>
          <div className={styles.field}>
            <label>Busto</label>
            <input className={styles.input} value={f.busto} onChange={set('busto')} placeholder="87" />
          </div>
          <div className={styles.field}>
            <label>Cintura</label>
            <input className={styles.input} value={f.cintura} onChange={set('cintura')} placeholder="63" />
          </div>
          <div className={styles.field}>
            <label>Cadera</label>
            <input className={styles.input} value={f.cadera} onChange={set('cadera')} placeholder="90" />
          </div>
          <div className={styles.field}>
            <label>Talle ropa</label>
            <input className={styles.input} value={f.talle_ropa} onChange={set('talle_ropa')} placeholder="M / 38" />
          </div>
          <div className={styles.field}>
            <label>Talle calzado</label>
            <input className={styles.input} value={f.talle_calzado} onChange={set('talle_calzado')} placeholder="38" />
          </div>
          <div className={styles.field}>
            <label>Pelo</label>
            <input className={styles.input} value={f.pelo} onChange={set('pelo')} placeholder="Castaño claro, lacio" />
          </div>
          <div className={styles.field}>
            <label>Ojos</label>
            <input className={styles.input} value={f.ojos} onChange={set('ojos')} placeholder="Celestes" />
          </div>
        </>}

        {/* Solo fotógrafos / maquilladores */}
        {!isModelo && (
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Estilo de trabajo</label>
            <textarea className={styles.textarea} rows={3} value={f.estilo} onChange={set('estilo')}
              placeholder="Editorial, retrato, moda…  /  Maquillaje de novia, editorial, FX…" />
          </div>
        )}

        {/* Portadas */}
        <ImgUpload label="Foto de portada 1" url={f.portada_1}
          onUrl={u => setF(p => ({ ...p, portada_1: u }))} />
        <ImgUpload label="Foto de portada 2" url={f.portada_2}
          onUrl={u => setF(p => ({ ...p, portada_2: u }))} />

        {/* Galería */}
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <GaleriaUpload urls={f.galeria ?? []} onUrls={u => setF(p => ({ ...p, galeria: u }))} />
        </div>

      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.btn} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  )
}

/* ── Admin principal ───────────────────────────────────────── */
export default function Admin() {
  const [session, setSession]   = useState<boolean | null>(null)
  const [talentos, setTalentos] = useState<Talento[]>([])
  const [editing, setEditing]   = useState<Talento | null>(null)
  const [adding, setAdding]     = useState(false)
  const [filter, setFilter]     = useState<string>('todos')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session))
    supabase.auth.onAuthStateChange((_, s) => setSession(!!s))
  }, [])

  const fetch = async () => {
    const { data } = await supabase.from('talentos').select('*').order('nombre')
    setTalentos(data ?? []); setLoading(false)
  }

  useEffect(() => { if (session) fetch() }, [session])

  const save = async (data: Omit<Talento, 'id' | 'created_at'>) => {
    if (editing) await supabase.from('talentos').update(data).eq('id', editing.id)
    else         await supabase.from('talentos').insert(data)
    setEditing(null); setAdding(false); fetch()
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este talento?')) return
    await supabase.from('talentos').delete().eq('id', id)
    fetch()
  }

  if (session === null) return null
  if (!session) return <Login onLogin={() => setSession(true)} />

  const lista = filter === 'todos' ? talentos : talentos.filter(t => t.categoria === filter)

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>MUDA <em>Admin</em></h1>
        <div className={styles.headerRight}>
          <span className={styles.count}>{talentos.length} talentos</span>
          <button className={styles.btnSecondary} onClick={() => supabase.auth.signOut().then(() => setSession(false))}>
            Salir
          </button>
        </div>
      </header>

      {(adding || editing) ? (
        <div className={styles.formWrap}>
          <h2 className={styles.sectionTitle}>{editing ? 'Editar talento' : 'Nuevo talento'}</h2>
          <Form
            initial={editing ?? TALENTO_VACIO}
            onSave={save}
            onCancel={() => { setEditing(null); setAdding(false) }}
          />
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              {['todos', ...CATS].map(c => (
                <button key={c}
                  className={`${styles.filterBtn} ${filter === c ? styles.filterActive : ''}`}
                  onClick={() => setFilter(c)}>{c}
                </button>
              ))}
            </div>
            <button className={styles.btn} onClick={() => setAdding(true)}>+ Nuevo talento</button>
          </div>

          {loading ? <p className={styles.empty}>Cargando…</p>
          : lista.length === 0 ? <p className={styles.empty}>No hay talentos todavía.</p>
          : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Foto</span><span>Nombre</span><span>Edad</span>
                <span>Categoría</span><span>Rol</span><span></span>
              </div>
              {lista.map(t => (
                <div key={t.id} className={styles.tableRow}>
                  <div className={styles.tableImg}>
                    {t.portada_1
                      ? <img src={imgUrl(t.portada_1, 'w_60,h_60,c_fill,q_auto')} alt={t.nombre} />
                      : <div className={styles.imgPlaceholder}>{t.nombre[0]}</div>}
                  </div>
                  <span className={styles.tableName}>{t.nombre}</span>
                  <span className={styles.tableCell}>{t.edad ?? '—'}</span>
                  <span className={styles.tableCell}>{t.categoria}</span>
                  <span className={styles.tableCell}>{t.rol}</span>
                  <div className={styles.tableActions}>
                    <button className={styles.editBtn} onClick={() => setEditing(t)}>Editar</button>
                    <button className={styles.deleteBtn} onClick={() => remove(t.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
