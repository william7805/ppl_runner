import { describe, expect, it } from 'vitest'
import { formatPace } from './pace'

describe('formatPace', () => {
  it('calcule une allure ronde', () => {
    // 10 km en 50 min
    expect(formatPace(10_000, 3_000)).toBe('5:00 /km')
  })

  it('calcule une allure avec des secondes', () => {
    // 5 km en 27 min 30
    expect(formatPace(5_000, 1_650)).toBe('5:30 /km')
  })

  it('ajoute un zéro devant les secondes inférieures à 10', () => {
    // 1 km en 5 min 02
    expect(formatPace(1_000, 302)).toBe('5:02 /km')
  })

  it('arrondit à la seconde la plus proche', () => {
    // 3 km en 1000 s, soit 333,33 s/km
    expect(formatPace(3_000, 1_000)).toBe('5:33 /km')
  })

  it('retourne null si la distance est nulle (séance de muscu)', () => {
    expect(formatPace(0, 3_600)).toBeNull()
  })

  it('retourne null si une valeur est négative', () => {
    expect(formatPace(-1_000, 300)).toBeNull()
    expect(formatPace(1_000, -300)).toBeNull()
  })
})
