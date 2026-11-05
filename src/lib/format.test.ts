import { describe, expect, it } from 'vitest'
import { formatDateTime, formatDistance, formatDuration } from './format'

describe('formatDuration', () => {
  it('affiche minutes et secondes sous une heure', () => {
    expect(formatDuration(3146)).toBe('52:26')
  })

  it("ajoute les heures au-delà d'une heure", () => {
    expect(formatDuration(3725)).toBe('1:02:05')
  })

  it('ajoute un zéro devant les secondes', () => {
    expect(formatDuration(65)).toBe('1:05')
  })
})

describe('formatDistance', () => {
  it('convertit en kilomètres avec une virgule', () => {
    expect(formatDistance(8362)).toBe('8,36 km')
  })

  it('garde deux décimales', () => {
    expect(formatDistance(5000)).toBe('5,00 km')
  })
})

describe('formatDateTime', () => {
  it("affiche l'heure de Paris en hiver (UTC+1)", () => {
    const text = formatDateTime(new Date('2026-11-05T18:00:00Z'))
    expect(text).toContain('jeudi 5 novembre 2026')
    expect(text).toContain('19:00')
  })

  it("affiche l'heure de Paris en été (UTC+2)", () => {
    expect(formatDateTime(new Date('2026-07-01T18:00:00Z'))).toContain('20:00')
  })
})
