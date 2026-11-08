import type { GeoPoint } from './distance'
import { trimPrivacyZone } from './privacy'
import { simplifyTrack } from './simplify'
import { decodePolyline, encodePolyline } from './polyline'

/**
 * Prépare la trace à stocker en base (ADR 0014) :
 * 1. on coupe la zone de confidentialité (début et fin de la course),
 * 2. on simplifie la trace,
 * 3. on l'encode en polyline.
 * L'ordre compte : on coupe d'abord, sur la trace complète, pour que la
 * distance retirée soit exacte. Renvoie null s'il ne reste rien à afficher.
 */
export function buildTrack(points: GeoPoint[]): string | null {
  const trimmed = trimPrivacyZone(points)
  if (trimmed.length < 2) return null
  return encodePolyline(simplifyTrack(trimmed))
}

/**
 * Décode une trace stockée en points [longitude, latitude], l'ordre attendu
 * par MapLibre (et par GeoJSON). Renvoie null si la trace est absente ou
 * illisible : la page affiche alors un message au lieu de planter.
 */
export function trackToCoordinates(
  track: string | null
): [number, number][] | null {
  if (!track) return null
  try {
    const points = decodePolyline(track)
    return points.length >= 2 ? points.map((p) => [p.lon, p.lat]) : null
  } catch {
    return null
  }
}
