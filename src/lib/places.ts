// Les lieux de l'île : source unique pour la scène 3D et le menu des dashboards
export type PlaceId = 'run' | 'swim' | 'muscu' | 'health' | 'quests'

export type Place = {
  id: PlaceId
  label: string
  href: string | null // null : lieu pas encore disponible
  // Nom du groupe de ce lieu dans le modèle 3D (public/models/ile-volante.glb)
  node: string
  // Point d'accroche de l'étiquette dans la scène (x, y, z), en mètres
  anchor: [number, number, number]
}

export const PLACES: Place[] = [
  {
    id: 'run',
    label: "Piste d'athlétisme",
    href: '/dashboard',
    node: 'Track',
    anchor: [-9.6, 5.4, -7.4],
  },
  {
    id: 'swim',
    label: 'Piscine',
    href: '/swimming',
    node: 'Pool',
    anchor: [12.4, 4.8, -6.6],
  },
  {
    id: 'muscu',
    label: 'Espace musculation',
    href: '/muscu',
    node: 'Gym',
    anchor: [10.6, 5.3, 9],
  },
  {
    id: 'health',
    label: 'Centre de santé',
    href: null,
    node: 'Hospital',
    anchor: [-10.4, 8.2, 9.2],
  },
  {
    id: 'quests',
    label: 'Tableau des quêtes',
    href: null,
    node: 'QuestBoard',
    anchor: [0, 7.2, 0],
  },
]

// Texte affiché sous le nom d'un lieu (ex. « Dernière séance : il y a 5 j »)
export type PlaceSubtitles = Partial<Record<PlaceId, string>>