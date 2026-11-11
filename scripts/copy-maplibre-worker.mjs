// Copie le worker de MapLibre GL dans public/ : depuis la v6, MapLibre le charge
// depuis un fichier séparé que Turbopack ne sait pas retrouver tout seul.
// Lancé automatiquement avant `npm run dev` et `npm run build`.
import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('public/maplibre', { recursive: true })
copyFileSync(
  'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs',
  'public/maplibre/maplibre-gl-worker.mjs'
)
