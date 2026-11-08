import { distanceBetween, type GeoPoint } from './distance'

/** Distance coupée au début et à la fin de chaque trace, en mètres */
export const PRIVACY_DISTANCE_METERS = 300

/**
 * Retire les `meters` premiers et derniers mètres d'une trace, pour ne pas
 * révéler le point de départ ni d'arrivée (souvent le domicile).
 * Renvoie une trace vide si la course est trop courte pour garder quelque
 * chose : mieux vaut pas de carte qu'une carte qui montre le domicile.
 */
export function trimPrivacyZone<T extends GeoPoint>(
  points: T[],
  meters: number = PRIVACY_DISTANCE_METERS
): T[] {
  if (points.length < 2) return []

  // Distance cumulée depuis le départ, pour chaque point
  const cumulative = [0]
  for (let i = 1; i < points.length; i++) {
    cumulative.push(
      cumulative[i - 1] + distanceBetween(points[i - 1], points[i])
    )
  }
  const total = cumulative[cumulative.length - 1]

  const kept = points.filter(
    (_, i) => cumulative[i] >= meters && cumulative[i] <= total - meters
  )
  return kept.length >= 2 ? kept : []
}
