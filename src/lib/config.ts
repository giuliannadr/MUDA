// El número se configura en .env como VITE_WHATSAPP
// Formato internacional sin + ni espacios. Ej: 5491155551234
export const WHATSAPP = (import.meta.env.VITE_WHATSAPP as string) || ''

// Mail de MUDA donde llegan las consultas (.env → VITE_MUDA_EMAIL)
export const MUDA_EMAIL =
  (import.meta.env.VITE_MUDA_EMAIL as string) || ''

export const whatsappLink = (mensaje: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`

/* ── Formulario de consultas (Web3Forms) ──────────────────────────────
   Para que las consultas lleguen por mail:
   1) Entrá a https://web3forms.com  → poné el mail donde querés recibirlas
   2) Te mandan una "Access Key" (un código tipo xxxxxxxx-xxxx-...)
   3) Pegala acá abajo (o mejor: en Vercel como variable VITE_WEB3FORMS_KEY)
   Mientras no haya key, el form muestra un aviso y ofrece el WhatsApp.        */
export const WEB3FORMS_KEY =
  (import.meta.env.VITE_WEB3FORMS_KEY as string) || ''
