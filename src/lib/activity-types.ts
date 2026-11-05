// Source unique de vérité pour les types d'activité.
// Ce fichier n'importe rien de la base : il peut être utilisé côté client.
export const ACTIVITY_TYPES = ['run', 'strength'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  run: 'Course à pied',
  strength: 'Musculation',
}

// Types qui peuvent être importés depuis un fichier GPX
// (la muscu n'a pas de trace GPS : elle aura sa propre saisie manuelle)
export const GPX_ACTIVITY_TYPES = [
  'run',
] as const satisfies readonly ActivityType[]
export type GpxActivityType = (typeof GPX_ACTIVITY_TYPES)[number]

export function isGpxActivityType(value: unknown): value is GpxActivityType {
  return (
    typeof value === 'string' &&
    (GPX_ACTIVITY_TYPES as readonly string[]).includes(value)
  )
}
