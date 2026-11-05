// Les lieux de l'île. Les positions sont en pourcentage de l'image
// public/island.webp : elles restent justes quelle que soit la taille d'écran.
export type PlaceId = 'run' | 'swim' | 'strength' | 'health'

export type Place = {
  id: PlaceId
  label: string
  icon: string
  left: number // % depuis le bord gauche de l'image
  top: number // % depuis le haut de l'image
  href: string | null // null : lieu pas encore disponible
}

export const PLACES: Place[] = [
  {
    id: 'run',
    label: "Piste d'athlétisme",
    icon: '🏃',
    left: 37,
    top: 27,
    href: '/dashboard',
  },
  { id: 'swim', label: 'Piscine', icon: '🏊', left: 74, top: 37, href: null },
  {
    id: 'strength',
    label: 'Espace musculation',
    icon: '🏋️',
    left: 51,
    top: 51,
    href: null,
  },
  {
    id: 'health',
    label: 'Maison santé',
    icon: '❤️',
    left: 23.5,
    top: 52,
    href: null,
  },
]
