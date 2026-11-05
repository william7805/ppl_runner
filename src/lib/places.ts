// Les lieux de l'île, source unique pour la carte 2D et la scène 3D.
export type PlaceId = 'run' | 'swim' | 'strength' | 'health'

export type Place = {
  id: PlaceId
  label: string
  icon: string
  href: string | null // null : lieu pas encore disponible
  // Carte 2D : position en % de l'image public/island.webp
  left: number
  top: number
  // Scène 3D : modèle et position sur l'île
  model: string // chemin dans public/
  position3d: [number, number] // coordonnées (x, y) sur le plateau de l'île
  labelHeight: number // hauteur de l'étiquette au-dessus du sol
}

export const PLACES: Place[] = [
  {
    id: 'run',
    label: "Piste d'athlétisme",
    icon: '🏃',
    href: '/dashboard',
    left: 37,
    top: 27,
    model: '/models/running_track.glb',
    // Piste
    position3d: [-5.2, 4.6],
    labelHeight: 2.4,
  },
  {
    id: 'swim',
    label: 'Piscine',
    icon: '🏊',
    href: null,
    left: 74,
    top: 37,
    model: '/models/swimming_pool.glb',
    // Piscine
    position3d: [6.2, 4.4],
    labelHeight: 2.4,
  },
  {
    id: 'strength',
    label: 'Espace musculation',
    icon: '🏋️',
    href: null,
    left: 51,
    top: 51,
    model: '/models/gym_lowpoly.glb',
    // Espace musculation
    position3d: [5.4, -4.8],
    labelHeight: 3,
  },
  {
    id: 'health',
    label: 'Maison santé',
    icon: '❤️',
    href: null,
    left: 23.5,
    top: 52,
    model: '/models/health_house.glb',
    // Maison santé
    position3d: [-6.4, -4.6],
    labelHeight: 3.2,
  },
]
