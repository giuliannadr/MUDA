import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type Categoria = 'modelos' | 'fotografos' | 'maquilladores'

export type Talento = {
  id: string
  nombre: string
  edad: number | null
  categoria: Categoria
  rol: string

  // Solo modelos
  altura: string
  hombros: string
  busto: string
  busto_label: string
  cintura: string
  cadera: string
  talle_ropa: string
  talle_pantalon: string
  talle_calzado: string
  pelo: string
  ojos: string
  ubicacion: string
  formacion: string

  // Solo fotógrafos / maquilladores
  estilo: string

  // Imágenes
  portada_1: string
  portada_2: string
  galeria: string[]

  created_at: string
}

export const TALENTO_VACIO: Omit<Talento, 'id' | 'created_at'> = {
  nombre: '', edad: null, categoria: 'modelos', rol: '',
  altura: '', hombros: '', busto: '', busto_label: 'Busto', cintura: '', cadera: '',
  talle_ropa: '', talle_pantalon: '', talle_calzado: '', pelo: '', ojos: '', ubicacion: '', formacion: '',
  estilo: '',
  portada_1: '', portada_2: '', galeria: [],
}
