import type { GeoPoint } from './distance'

// Précision de 5 décimales (≈ 1 m) : le format standard de Google,
// compris par la plupart des outils cartographiques
const FACTOR = 1e5

/** Encode un nombre entier signé en caractères ASCII (32 à 126) */
function encodeValue(value: number): string {
  // Le bit de signe passe à droite : les petits nombres négatifs restent courts
  let v = value < 0 ? ~(value << 1) : value << 1
  let output = ''
  // Découpe en paquets de 5 bits ; 0x20 indique « un paquet suit »
  while (v >= 0x20) {
    output += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  return output + String.fromCharCode(v + 63)
}

/**
 * Encode une trace en "encoded polyline" : on stocke l'écart avec le point
 * précédent plutôt que les coordonnées complètes, ce qui donne une chaîne
 * courte (quelques Ko pour une course entière).
 */
export function encodePolyline(points: GeoPoint[]): string {
  let previousLat = 0
  let previousLon = 0
  let output = ''
  for (const point of points) {
    const lat = Math.round(point.lat * FACTOR)
    const lon = Math.round(point.lon * FACTOR)
    output += encodeValue(lat - previousLat) + encodeValue(lon - previousLon)
    previousLat = lat
    previousLon = lon
  }
  return output
}

/** Opération inverse. Lève une erreur si la chaîne est mal formée. */
export function decodePolyline(encoded: string): GeoPoint[] {
  const points: GeoPoint[] = []
  let index = 0
  let lat = 0
  let lon = 0

  const readValue = (): number => {
    let result = 0
    let shift = 0
    let byte: number
    do {
      if (index >= encoded.length) {
        throw new Error('Polyline mal formée : chaîne tronquée')
      }
      byte = encoded.charCodeAt(index++) - 63
      if (byte < 0 || byte > 0x3f) {
        throw new Error('Polyline mal formée : caractère invalide')
      }
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }

  while (index < encoded.length) {
    lat += readValue()
    lon += readValue()
    points.push({ lat: lat / FACTOR, lon: lon / FACTOR })
  }
  return points
}
