import type { GeoPoint } from './distance'

const EARTH_RADIUS_METERS = 6_371_000

/** Tolérance par défaut : un écart de moins de 5 m ne se voit pas sur la carte */
export const SIMPLIFY_TOLERANCE_METERS = 5

/**
 * Distance en mètres entre le point p et le segment [a, b].
 * Sur quelques kilomètres, on peut considérer la Terre comme plate :
 * on projette les degrés en mètres autour de la latitude de a.
 */
function distanceToSegment(p: GeoPoint, a: GeoPoint, b: GeoPoint): number {
  const toMeters = (Math.PI / 180) * EARTH_RADIUS_METERS
  const cosLat = Math.cos((a.lat * Math.PI) / 180)
  const project = (q: GeoPoint) => ({
    x: (q.lon - a.lon) * cosLat * toMeters,
    y: (q.lat - a.lat) * toMeters,
  })

  const P = project(p)
  const B = project(b)
  const lengthSquared = B.x ** 2 + B.y ** 2
  if (lengthSquared === 0) return Math.hypot(P.x, P.y)

  // Position du projeté de P sur le segment, bornée entre a (0) et b (1)
  const t = Math.max(0, Math.min(1, (P.x * B.x + P.y * B.y) / lengthSquared))
  return Math.hypot(P.x - t * B.x, P.y - t * B.y)
}

/**
 * Simplifie une trace avec l'algorithme de Douglas-Peucker : on garde le
 * premier et le dernier point, puis on ajoute le point le plus éloigné de la
 * ligne qui les relie s'il s'en écarte de plus de `tolerance` mètres, et on
 * recommence sur chaque moitié. Les lignes droites perdent presque tous leurs
 * points, les virages gardent les leurs.
 */
export function simplifyTrack<T extends GeoPoint>(
  points: T[],
  tolerance: number = SIMPLIFY_TOLERANCE_METERS
): T[] {
  if (points.length <= 2) return points

  const keep = new Array<boolean>(points.length).fill(false)
  keep[0] = true
  keep[points.length - 1] = true

  // Pile de segments à traiter, plutôt qu'une fonction récursive :
  // une trace de plusieurs milliers de points pourrait saturer la pile d'appels
  const stack: [number, number][] = [[0, points.length - 1]]
  while (stack.length > 0) {
    const [start, end] = stack.pop()!
    let maxDistance = 0
    let index = -1
    for (let i = start + 1; i < end; i++) {
      const d = distanceToSegment(points[i], points[start], points[end])
      if (d > maxDistance) {
        maxDistance = d
        index = i
      }
    }
    if (maxDistance > tolerance) {
      keep[index] = true
      stack.push([start, index], [index, end])
    }
  }

  return points.filter((_, i) => keep[i])
}
