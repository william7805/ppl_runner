import { describe, expect, it } from 'vitest'
import { distanceBetween } from './distance'

describe('distanceBetween', () => {
  it('renvoie 0 pour deux points identiques', () => {
    expect(
      distanceBetween({ lat: 48.85, lon: 2.35 }, { lat: 48.85, lon: 2.35 })
    ).toBe(0)
  })

  it("calcule environ 111,19 m pour 0,001° de longitude à l'équateur", () => {
    expect(
      distanceBetween({ lat: 0, lon: 0 }, { lat: 0, lon: 0.001 })
    ).toBeCloseTo(111.19, 1)
  })

  it('est symétrique', () => {
    const a = { lat: 45, lon: 5 }
    const b = { lat: 45.01, lon: 5.02 }
    expect(distanceBetween(a, b)).toBeCloseTo(distanceBetween(b, a), 6)
  })
})
