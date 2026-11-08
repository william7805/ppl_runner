import { describe, expect, it } from 'vitest'
import {
  formatDistance,
  formatDuration,
  formatPace,
  paceSecondsPerKm,
  trend,
} from './format'

describe('paceSecondsPerKm', () => {
  it('calcule une allure de 5:00 /km pour 10 km en 50 min', () => {
    expect(paceSecondsPerKm(10000, 3000)).toBe(300)
  })
  it('renvoie null si la distance ou la durée est nulle', () => {
    expect(paceSecondsPerKm(0, 3000)).toBeNull()
    expect(paceSecondsPerKm(10000, 0)).toBeNull()
  })
})

describe('formatPace', () => {
  it('formate les secondes avec deux chiffres', () => {
    expect(formatPace(302)).toBe('5:02 /km')
  })
  it("arrondit sans produire de ':60'", () => {
    expect(formatPace(359.7)).toBe('6:00 /km')
  })
  it('affiche un tiret si pas de valeur', () => {
    expect(formatPace(null)).toBe('-')
  })
})

describe('formatDuration', () => {
  it('affiche minutes:secondes sous une heure', () => {
    expect(formatDuration(2710)).toBe('45:10')
  })
  it('affiche les heures au-delà', () => {
    expect(formatDuration(3735)).toBe('1:02:15')
  })
})

describe('formatDistance', () => {
  it('utilise la virgule française', () => {
    expect(formatDistance(10500)).toBe('10,50 km')
  })
})

describe('trend', () => {
  it('détecte hausse, baisse et égalité', () => {
    expect(trend(20, 15)).toBe('up')
    expect(trend(10, 15)).toBe('down')
    expect(trend(15, 15)).toBe('same')
  })
})
