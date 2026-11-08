import { TIME_ZONE, formatShortDate } from './format'
import { formatPace } from './pace'

type StatInput = { startedAt: Date; distanceMeters: number | null }

export type DistanceStats = {
  weekMeters: number
  monthMeters: number
  totalMeters: number
  totalCount: number
}

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const MS_PER_DAY = 86_400_000

/**
 * Jour calendaire d'une date, vu depuis Paris.
 * Une course le lundi à 0 h 30 à Paris est le dimanche à 23 h 30 en UTC :
 * il faut raisonner en heure de Paris pour la ranger dans la bonne semaine.
 */

export function parisDay(date: Date) {
  const parts = dayFormatter.formatToParts(date)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  const year = get('year')
  const month = get('month')
  const day = get('day')
  const utcMidnight = Date.UTC(year, month - 1, day)
  return {
    year,
    month,
    dayNumber: utcMidnight / MS_PER_DAY, // nombre de jours depuis 1970
    weekdayFromMonday: (new Date(utcMidnight).getUTCDay() + 6) % 7, // lundi = 0
  }
}

/** Distances de la semaine (du lundi), du mois en cours et au total. */
export function computeDistanceStats(
  items: StatInput[],
  now: Date = new Date()
): DistanceStats {
  const today = parisDay(now)
  const weekStart = today.dayNumber - today.weekdayFromMonday

  const stats: DistanceStats = {
    weekMeters: 0,
    monthMeters: 0,
    totalMeters: 0,
    totalCount: 0,
  }

  for (const item of items) {
    const meters = item.distanceMeters ?? 0
    const day = parisDay(item.startedAt)

    stats.totalCount += 1
    stats.totalMeters += meters
    if (day.dayNumber >= weekStart && day.dayNumber <= today.dayNumber) {
      stats.weekMeters += meters
    }
    if (day.year === today.year && day.month === today.month) {
      stats.monthMeters += meters
    }
  }

  return stats
}

type WeekInput = {
  startedAt: Date
  distanceMeters: number | null
  durationSeconds: number
}

export type WeekTotals = { count: number; meters: number }

export type WeekStats = {
  current: WeekTotals
  previous: WeekTotals
  /** Allure moyenne de la semaine en cours, null sans distance */
  pace: string | null
}

/**
 * Nombre de séances et distance de la semaine en cours (du lundi) et de la
 * semaine précédente, pour afficher l'évolution dans les vignettes.
 */
export function computeWeekStats(
  items: WeekInput[],
  now: Date = new Date()
): WeekStats {
  const today = parisDay(now)
  const weekStart = today.dayNumber - today.weekdayFromMonday
  const previousWeekStart = weekStart - 7

  const current: WeekTotals = { count: 0, meters: 0 }
  const previous: WeekTotals = { count: 0, meters: 0 }
  // Seules les séances avec une distance comptent pour l'allure
  let pacedMeters = 0
  let pacedSeconds = 0

  for (const item of items) {
    const day = parisDay(item.startedAt).dayNumber
    const meters = item.distanceMeters ?? 0

    if (day >= weekStart && day <= today.dayNumber) {
      current.count += 1
      current.meters += meters
      if (meters > 0) {
        pacedMeters += meters
        pacedSeconds += item.durationSeconds
      }
    } else if (day >= previousWeekStart && day < weekStart) {
      previous.count += 1
      previous.meters += meters
    }
  }

  return {
    current,
    previous,
    // Allure pondérée : temps total / distance totale, et non la moyenne
    // des allures (une sortie de 20 km pèse plus qu'un footing de 5 km)
    pace: formatPace(pacedMeters, pacedSeconds),
  }
}

export type WeeklyDistance = {
  /** Lundi de la semaine, ex. "2 nov." */
  label: string
  km: number
}

const weekLabelFormatter = new Intl.DateTimeFormat('fr-FR', {
  // dayNumber correspond déjà au jour de Paris : on l'affiche tel quel en UTC
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
})

/**
 * Kilomètres par semaine (du lundi) sur les `weeks` dernières semaines,
 * semaine en cours comprise, de la plus ancienne à la plus récente.
 * Les semaines sans course apparaissent avec 0 km.
 */
export function computeWeeklyDistance(
  items: StatInput[],
  weeks = 12,
  now: Date = new Date()
): WeeklyDistance[] {
  const today = parisDay(now)
  const currentWeekStart = today.dayNumber - today.weekdayFromMonday
  const firstWeekStart = currentWeekStart - (weeks - 1) * 7

  const meters = new Array<number>(weeks).fill(0)
  for (const item of items) {
    const day = parisDay(item.startedAt).dayNumber
    if (day < firstWeekStart || day > today.dayNumber) continue
    const index = Math.floor((day - firstWeekStart) / 7)
    meters[index] += item.distanceMeters ?? 0
  }

  return meters.map((m, i) => ({
    label: weekLabelFormatter.format(
      new Date((firstWeekStart + i * 7) * MS_PER_DAY)
    ),
    km: Math.round(m / 100) / 10, // une décimale
  }))
}

type RunInput = {
  startedAt: Date
  distanceMeters: number | null
  durationSeconds: number
  avgHeartRate: number | null
}

export type RunPoint = {
  /** Date courte, ex. "sam. 7 nov." */
  label: string
  /** Allure en secondes par km */
  paceSeconds: number
  avgHeartRate: number | null
}

/**
 * Allure et FC moyenne des `limit` dernières courses, de la plus ancienne
 * à la plus récente. Attend des courses triées de la plus récente à la plus
 * ancienne (l'ordre de la requête du dashboard). Les courses sans distance
 * sont ignorées : impossible d'en calculer l'allure.
 */
export function computeRunSeries(items: RunInput[], limit = 20): RunPoint[] {
  return items
    .filter(
      (item) => (item.distanceMeters ?? 0) > 0 && item.durationSeconds > 0
    )
    .slice(0, limit)
    .reverse()
    .map((item) => ({
      label: formatShortDate(item.startedAt),
      paceSeconds: Math.round(
        item.durationSeconds / ((item.distanceMeters ?? 0) / 1000)
      ),
      avgHeartRate: item.avgHeartRate,
    }))
}
