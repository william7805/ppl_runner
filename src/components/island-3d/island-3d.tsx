'use client'

import dynamic from 'next/dynamic'
import type { PlaceSubtitles } from '@/lib/places'

// La scène n'est chargée que dans le navigateur (WebGL n'existe pas côté
// serveur), et seulement quand ce composant s'affiche : Three.js n'alourdit
// donc aucune autre page
const IslandScene = dynamic(() => import('./island-scene'), {
  ssr: false,
  loading: () => (
    <p className="flex h-full items-center justify-center opacity-70">
      Chargement de l&apos;île…
    </p>
  ),
})

export function Island3D({ subtitles }: { subtitles: PlaceSubtitles }) {
  return (
    <div className="h-[100dvh] w-full">
      <IslandScene subtitles={subtitles} />
    </div>
  )
}
