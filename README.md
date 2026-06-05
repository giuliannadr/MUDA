# MUDA

Productora creativa — sitio público + panel de administración.

Monorepo con dos aplicaciones que comparten la misma base de datos (Supabase) y
almacenamiento de imágenes (Cloudinary), con el código común en una sola fuente.

## Estructura

```
MUDA/
├── src/            # Sitio público (Vite + React + TS, CSS Modules)   → puerto 3000
│   └── lib/        #   cliente Supabase + tipos + helpers de Cloudinary
├── admin/          # Panel de administración (Vite + React + Tailwind) → puerto 3001
│   └── src/lib/    #   misma capa (supabase.ts, cloudinary.ts)
├── supabase/       # Scripts SQL del esquema (ejecutar en el editor de Supabase)
└── ...
```

### ¿Por qué dos apps separadas?

Es intencional y por **seguridad**: el código y la lógica del admin nunca se
envían al navegador de los visitantes del sitio público, y cada app se despliega
por separado (el admin detrás de login, en una URL privada).

Cada app es **autocontenida** (tiene su propio `src/lib` con el cliente de
Supabase, los tipos y los helpers de Cloudinary). Se mantienen en sync a mano
porque comparten el mismo esquema de base de datos. Se eligió así —en vez de un
paquete compartido— para que cada app despliegue de forma independiente y simple
en Vercel (Root Directory por proyecto), sin imports cruzados que compliquen el
build. Si en el futuro se quisiera una única fuente de verdad, el camino correcto
sería un monorepo con workspaces (npm/pnpm) y `shared` como paquete instalado.

## Requisitos

- Node 18+
- Cuenta de Supabase y de Cloudinary

## Configuración

Copiá los `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env             # sitio público
cp admin/.env.example admin/.env # panel admin
```

Variables:

| Variable                          | Web | Admin | Descripción                        |
|-----------------------------------|:---:|:-----:|------------------------------------|
| `VITE_SUPABASE_URL`               |  ✓  |   ✓   | URL del proyecto Supabase          |
| `VITE_SUPABASE_ANON_KEY`          |  ✓  |   ✓   | Clave pública (anon) de Supabase   |
| `VITE_CLOUDINARY_CLOUD_NAME`      |  ✓  |   ✓   | Cloud name de Cloudinary           |
| `VITE_CLOUDINARY_UPLOAD_PRESET`   |     |   ✓   | Preset unsigned para subir imágenes|
| `VITE_WHATSAPP`                   |  ✓  |       | Número de WhatsApp para contacto   |

> La `ANON_KEY` es pública por diseño (la seguridad real la dan las políticas
> RLS de Supabase). Aun así, los `.env` no se versionan.

## Correr en local

```bash
# Sitio público
npm install
npm run dev            # http://localhost:3000

# Panel admin
cd admin
npm install
npm run dev            # http://localhost:3001
```

## Build de producción

```bash
npm run build          # sitio público → dist/
cd admin && npm run build   # admin → admin/dist/
```

## Base de datos

Los scripts de `supabase/` crean las tablas y columnas. Ejecutalos en el
SQL Editor de Supabase (empezando por `supabase-setup.sql`).
