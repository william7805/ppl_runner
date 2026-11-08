import { describe, expect, it } from 'vitest'
import { decodePolyline, encodePolyline } from './polyline'

// Exemple officiel de la documentation Google
const GOOGLE_POINTS = [
  { lat: 38.5, lon: -120.2 },
  { lat: 40.7, lon: -120.95 },
  { lat: 43.252, lon: -126.453 },
]
const GOOGLE_ENCODED = '_p~iF~ps|U_ulLnnqC_mqNvxq`@'

describe('encodePolyline', () => {
  it("donne le même résultat que l'exemple de Google", () => {
    expect(encodePolyline(GOOGLE_POINTS)).toBe(GOOGLE_ENCODED)
  })

  it('renvoie une chaîne vide pour une trace vide', () => {
    expect(encodePolyline([])).toBe('')
  })
})

describe('decodePolyline', () => {
  it("décode l'exemple de Google", () => {
    expect(decodePolyline(GOOGLE_ENCODED)).toEqual(GOOGLE_POINTS)
  })

  it('retrouve les points à 5 décimales près après un aller-retour', () => {
    const points = [
      { lat: 48.856614, lon: 2.352222 },
      { lat: 48.857123, lon: 2.351987 },
      { lat: 48.855001, lon: 2.349876 },
    ]
    const decoded = decodePolyline(encodePolyline(points))
    decoded.forEach((point, i) => {
      expect(point.lat).toBeCloseTo(points[i].lat, 5)
      expect(point.lon).toBeCloseTo(points[i].lon, 5)
    })
  })

  it('refuse une chaîne tronquée', () => {
    expect(() => decodePolyline('_p~iF~ps|U_')).toThrow('tronquée')
  })

  it('refuse un caractère invalide', () => {
    expect(() => decodePolyline('_p~iF ps|U')).toThrow('caractère invalide')
  })
})
