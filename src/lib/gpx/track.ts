import type { GeoPoint } from './distance'
import { encodePolyline } from './polyline'
import { trimPrivacyZone } from './privacy'
import { simplifyTrack } from './simplify'

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
