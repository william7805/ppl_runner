import { describe, expect, it } from 'vitest'
import { formatDaysAgo } from './relative-day'

// Jeudi 5 novembre 2026, 19 h à Paris
const NOW = new Date('2026-11-05T18:00:00Z')

describe('formatDaysAgo', () => {
  it("affiche « aujourd'hui » pour une séance du jour", () => {
    expect(formatDaysAgo(new Date('2026-11-05T07:00:00Z'), NOW)).toBe(
      "aujourd'hui"
    )
  })

  it('affiche « hier » pour une séance de la veille au soir', () => {
    // Mercredi 4 novembre, 23 h à Paris
    expect(formatDaysAgo(new Date('2026-11-04T22:00:00Z'), NOW)).toBe('hier')
  })

  it('compte les jours calendaires à Paris, pas les tranches de 24 h', () => {
    // Samedi 31 octobre, 19 h 28 à Paris
    expect(formatDaysAgo(new Date('2026-10-31T18:28:48Z'), NOW)).toBe(
      'il y a 5 j'
    )
  })
})
