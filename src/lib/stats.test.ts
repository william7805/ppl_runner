import { describe, expect, it } from 'vitest'
import {
  computeDistanceStats,
  computeWeekStats,
  computeWeeklyDistance,
} from './stats'
// Jeudi 5 novembre 2026, 19 h à Paris
const NOW = new Date('2026-11-05T18:00:00Z')

describe('computeDistanceStats', () => {
  it('renvoie des zéros sans activité', () => {
    expect(computeDistanceStats([], NOW)).toEqual({
      weekMeters: 0,
      monthMeters: 0,
      totalMeters: 0,
      totalCount: 0,
    })
  })

  it('compte une activité de la semaine dans la semaine, le mois et le total', () => {
    const stats = computeDistanceStats(
      [{ startedAt: new Date('2026-11-03T07:00:00Z'), distanceMeters: 5000 }],
      NOW
    )
    expect(stats).toEqual({
      weekMeters: 5000,
      monthMeters: 5000,
      totalMeters: 5000,
      totalCount: 1,
    })
  })

  it("range une course du lundi 0 h 30 (Paris) dans la semaine, même si c'est dimanche en UTC", () => {
    // Lundi 2 novembre, 0 h 30 à Paris = dimanche 1er novembre, 23 h 30 UTC
    const stats = computeDistanceStats(
      [{ startedAt: new Date('2026-11-01T23:30:00Z'), distanceMeters: 1000 }],
      NOW
    )
    expect(stats.weekMeters).toBe(1000)
  })

  it('exclut le dimanche soir précédent de la semaine', () => {
    // Dimanche 1er novembre, 23 h 30 à Paris
    const stats = computeDistanceStats(
      [{ startedAt: new Date('2026-11-01T22:30:00Z'), distanceMeters: 1000 }],
      NOW
    )
    expect(stats.weekMeters).toBe(0)
    expect(stats.monthMeters).toBe(1000)
  })

  it('exclut le mois précédent du mois en cours', () => {
    // Samedi 31 octobre, 19 h 28 à Paris
    const stats = computeDistanceStats(
      [{ startedAt: new Date('2026-10-31T18:28:48Z'), distanceMeters: 8362 }],
      NOW
    )
    expect(stats.monthMeters).toBe(0)
    expect(stats.totalMeters).toBe(8362)
  })

  it('compte une activité sans distance (muscu) sans fausser les totaux', () => {
    const stats = computeDistanceStats(
      [{ startedAt: new Date('2026-11-04T17:00:00Z'), distanceMeters: null }],
      NOW
    )
    expect(stats.totalCount).toBe(1)
    expect(stats.totalMeters).toBe(0)
  })
})

describe('computeWeekStats', () => {
  const run = (
    iso: string,
    distanceMeters: number | null,
    seconds: number
  ) => ({
    startedAt: new Date(iso),
    distanceMeters,
    durationSeconds: seconds,
  })

  it("renvoie des zéros et pas d'allure sans activité", () => {
    expect(computeWeekStats([], NOW)).toEqual({
      current: { count: 0, meters: 0 },
      previous: { count: 0, meters: 0 },
      pace: null,
    })
  })

  it('sépare la semaine en cours de la précédente', () => {
    const stats = computeWeekStats(
      [
        run('2026-11-03T07:00:00Z', 5000, 1500), // mardi de cette semaine
        run('2026-10-28T07:00:00Z', 8000, 2400), // mercredi précédent
        run('2026-10-20T07:00:00Z', 10000, 3000), // il y a deux semaines
      ],
      NOW
    )
    expect(stats.current).toEqual({ count: 1, meters: 5000 })
    expect(stats.previous).toEqual({ count: 1, meters: 8000 })
  })

  it('calcule une allure pondérée par la distance', () => {
    // 5 km en 25 min + 10 km en 55 min = 15 km en 80 min → 5:20 /km
    const stats = computeWeekStats(
      [
        run('2026-11-02T07:00:00Z', 5000, 1500),
        run('2026-11-04T07:00:00Z', 10000, 3300),
      ],
      NOW
    )
    expect(stats.pace).toBe('5:20 /km')
  })

  it("ignore les séances sans distance pour l'allure", () => {
    const stats = computeWeekStats(
      [
        run('2026-11-02T07:00:00Z', 5000, 1500),
        run('2026-11-04T07:00:00Z', null, 3600),
      ],
      NOW
    )
    expect(stats.current.count).toBe(2)
    expect(stats.pace).toBe('5:00 /km')
  })
})

describe('computeWeeklyDistance', () => {
  const run = (iso: string, distanceMeters: number | null) => ({
    startedAt: new Date(iso),
    distanceMeters,
  })

  it('renvoie 12 semaines à 0 km sans activité, la plus récente en dernier', () => {
    const weeks = computeWeeklyDistance([], 12, NOW)
    expect(weeks).toHaveLength(12)
    expect(weeks.every((w) => w.km === 0)).toBe(true)
    expect(weeks[11].label).toBe('2 nov.') // lundi de la semaine en cours
    expect(weeks[0].label).toBe('17 août')
  })

  it('range chaque course dans sa semaine et arrondit à une décimale', () => {
    const weeks = computeWeeklyDistance(
      [
        run('2026-11-03T07:00:00Z', 5000), // semaine en cours
        run('2026-11-04T07:00:00Z', 7340), // semaine en cours
        run('2026-10-28T07:00:00Z', 8000), // semaine précédente
      ],
      12,
      NOW
    )
    expect(weeks[11].km).toBe(12.3)
    expect(weeks[10].km).toBe(8)
  })

  it('ignore les courses trop anciennes', () => {
    const weeks = computeWeeklyDistance(
      [run('2026-08-10T07:00:00Z', 10000)],
      12,
      NOW
    )
    expect(weeks.every((w) => w.km === 0)).toBe(true)
  })

  it("utilise le lundi à Paris, même si c'est dimanche en UTC", () => {
    // Lundi 2 novembre, 0 h 30 à Paris = dimanche 1er novembre, 23 h 30 UTC
    const weeks = computeWeeklyDistance(
      [run('2026-11-01T23:30:00Z', 1000)],
      12,
      NOW
    )
    expect(weeks[11].km).toBe(1)
  })
})
