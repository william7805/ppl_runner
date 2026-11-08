import { describe, expect, it } from 'vitest'
import { distanceBetween } from './distance'
import { trimPrivacyZone } from './privacy'

// Une ligne droite vers le nord : 0,001° de latitude ≈ 111 m
const line = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    lat: 48.85 + i * 0.001,
    lon: 2.3,
  }))

describe('trimPrivacyZone', () => {
  it('retire environ 300 m au début et à la fin', () => {
    const points = line(21) // environ 2,2 km
    const trimmed = trimPrivacyZone(points)

    expect(distanceBetween(points[0], trimmed[0])).toBeGreaterThanOrEqual(300)
    expect(
      distanceBetween(points[points.length - 1], trimmed[trimmed.length - 1])
    ).toBeGreaterThanOrEqual(300)
  })

  it("ne garde jamais le point de départ ni celui d'arrivée", () => {
    const points = line(21)
    const trimmed = trimPrivacyZone(points)
    expect(trimmed).not.toContain(points[0])
    expect(trimmed).not.toContain(points[points.length - 1])
  })

  it('renvoie une trace vide si la course est trop courte', () => {
    expect(trimPrivacyZone(line(6))).toEqual([]) // environ 550 m
  })

  it('renvoie une trace vide avec moins de deux points', () => {
    expect(trimPrivacyZone([{ lat: 48.85, lon: 2.3 }])).toEqual([])
  })
})
