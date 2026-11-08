import { describe, expect, it } from 'vitest'
import { simplifyTrack } from './simplify'

describe('simplifyTrack', () => {
  it('réduit une ligne droite à ses deux extrémités', () => {
    const points = Array.from({ length: 100 }, (_, i) => ({
      lat: 48.85 + i * 0.0001,
      lon: 2.3,
    }))
    expect(simplifyTrack(points)).toEqual([points[0], points[99]])
  })

  it("garde le sommet d'un virage", () => {
    const a = { lat: 48.85, lon: 2.3 }
    const corner = { lat: 48.851, lon: 2.3 } // 111 m au nord
    const b = { lat: 48.851, lon: 2.3015 } // puis 110 m à l'est
    expect(simplifyTrack([a, corner, b])).toEqual([a, corner, b])
  })

  it("supprime un point qui s'écarte de moins de la tolérance", () => {
    const a = { lat: 48.85, lon: 2.3 }
    const middle = { lat: 48.8505, lon: 2.30002 } // environ 1,5 m de décalage
    const b = { lat: 48.851, lon: 2.3 }
    expect(simplifyTrack([a, middle, b])).toEqual([a, b])
  })

  it('renvoie la trace telle quelle avec deux points ou moins', () => {
    const points = [
      { lat: 48.85, lon: 2.3 },
      { lat: 48.86, lon: 2.3 },
    ]
    expect(simplifyTrack(points)).toBe(points)
  })
})
