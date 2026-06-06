/* Fotos del estudio — viven en Cloudinary (cuenta MUDA).
   Para cambiar/agregar: subí la imagen a Cloudinary y pegá su public_id acá.
   El orden es el que se ve en la galería (la 1ª es la principal/hero).
   'land' marca las fotos horizontales (apaisadas); el resto se asumen verticales. */
/* Filtro de color para las fotos del estudio (mucha luz → salían lavadas).
   Baja brillo, sube contraste y da un toque cálido. Se antepone a las
   transformaciones de tamaño en cada imgUrl. */
export const ESTUDIO_FX = 'e_brightness:-16,e_contrast:24,e_saturation:10'

export type EstudioFoto = { id: string; label: string; land?: boolean }

export const estudioFotos: EstudioFoto[] = [
  { id: 'espacio5_fqt5ug',  label: 'Sala Infinito', land: true },
  { id: 'espacio1_wmgx1f',  label: 'El set' },
  { id: 'espacio2_b7rpbk',  label: 'Vestuario' },
  { id: 'espacio3_wiwpo3',  label: 'Producción' },
  { id: 'espacio4_xggrbc',  label: 'Maquillaje' },
  { id: 'espacio66_rbymzi', label: 'El espacio' },
]
