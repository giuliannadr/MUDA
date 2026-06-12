import type { View } from '../App'

export const SITE_URL = 'https://mudaagency.com'

/* ── Mapa sección ⇄ URL ──────────────────────────────────────────
   Cada sección tiene su propia URL real para que Google la indexe
   como página separada (mejor SEO que todo en "/").                 */
export const VIEW_PATH: Record<View, string> = {
  inicio:               '/',
  quienes:              '/quienes-somos',
  produccion:           '/produccion',
  'foto-video':         '/produccion/foto-y-video',
  'direccion-creativa': '/produccion/direccion-creativa',
  'contenido-redes':    '/produccion/contenido-para-redes',
  eventos:              '/eventos',
  agencia:              '/agencia',
  estudio:              '/estudio',
  contacto:             '/contacto',
  sumate:               '/sumate',
}

const PATH_VIEW: Record<string, View> = Object.fromEntries(
  Object.entries(VIEW_PATH).map(([view, path]) => [path, view as View])
) as Record<string, View>

export const pathToView = (path: string): View => {
  const clean = path.replace(/\/+$/, '') || '/'
  return PATH_VIEW[clean] ?? 'inicio'
}

export const viewToPath = (view: View): string => VIEW_PATH[view]

/* ── Título + descripción por página (Google los usa por URL) ──── */
type Meta = { title: string; description: string }

const BASE_DESC =
  'Productora creativa integral en Palermo, Buenos Aires. Producción de foto y video, dirección creativa, agencia de talentos, eventos y alquiler de estudio.'

export const META: Record<View, Meta> = {
  inicio: {
    title: 'MUDA — Productora creativa de moda e imagen | Buenos Aires',
    description: BASE_DESC,
  },
  quienes: {
    title: 'Quiénes somos — MUDA',
    description:
      'Somos Justina Porta y Lucila Beltramino, productoras de moda. Creamos MUDA para resolver de forma integral todo lo que necesitás para proyectar tu imagen.',
  },
  produccion: {
    title: 'Producción de foto y video — MUDA',
    description:
      'Producción y dirección integral de foto y video: shooting, locación, arte, estilismo y concepto visual. Cada proyecto, su propio mundo visual.',
  },
  'foto-video': {
    title: 'Producción de fotos & video — MUDA',
    description:
      'Servicio integral de producción y dirección: organizamos, planificamos y producimos tu shooting de principio a fin en Buenos Aires.',
  },
  'direccion-creativa': {
    title: 'Dirección creativa visual — MUDA',
    description:
      'Conceptualización estética y visual de campañas, videoclips y perfiles. Tu soporte creativo desde la idea inicial hasta la dirección del proyecto.',
  },
  'contenido-redes': {
    title: 'Contenido para redes — MUDA',
    description:
      'Producción y dirección creativa de contenido estratégico para tu presencia digital en redes sociales: marcas, artistas y creativos.',
  },
  eventos: {
    title: 'Eventos — MUDA',
    description:
      'Experiencias visuales y conceptuales, de la idea inicial a la ejecución. Conceptualización, ambientación y coordinación de eventos en Buenos Aires.',
  },
  agencia: {
    title: 'Agencia de talentos — MUDA',
    description:
      'Base de modelos, fotógrafxs y maquilladorxs para contratar de forma independiente. Sumate a la base de talentos de MUDA.',
  },
  estudio: {
    title: 'Alquiler de estudio en Palermo — MUDA',
    description:
      'Estudio en Palermo para producciones fotográficas, audiovisuales y proyectos creativos. Sala de fondo infinito, salas privadas y café.',
  },
  contacto: {
    title: 'Contacto — MUDA',
    description:
      'Hablemos de tu proyecto. Escribinos por WhatsApp o mail. MUDA — productora creativa en Palermo, Buenos Aires.',
  },
  sumate: {
    title: 'Sumate a la base de talentos — MUDA',
    description:
      'Formá parte de MUDA. Completá tus datos para entrar a nuestra base de talentos: modelos, fotógrafxs y maquilladorxs.',
  },
}

/* Actualiza title, meta description, canonical y og:url según la sección.
   Google ejecuta JS y lee estos valores por URL → cada página posiciona aparte. */
export function applySeo(view: View) {
  const meta = META[view]
  const url = SITE_URL + (viewToPath(view) === '/' ? '/' : viewToPath(view))

  document.title = meta.title

  const set = (selector: string, attr: string, value: string) => {
    const el = document.head.querySelector(selector)
    if (el) el.setAttribute(attr, value)
  }
  set('meta[name="description"]', 'content', meta.description)
  set('link[rel="canonical"]', 'href', url)
  set('meta[property="og:url"]', 'content', url)
  set('meta[property="og:title"]', 'content', meta.title)
  set('meta[property="og:description"]', 'content', meta.description)
  set('meta[name="twitter:title"]', 'content', meta.title)
  set('meta[name="twitter:description"]', 'content', meta.description)
}
