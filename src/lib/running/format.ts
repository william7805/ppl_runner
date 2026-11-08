export type Trend = 'up' | 'down' | 'same'

/** Allure en secondes par km, ou null si les données sont invalides. */
export function paceSecondsPerKm(
  distanceM: number,
  durationS: number
): number | null {
  if (distanceM <= 0 || durationS <= 0) return null
  return durationS / (distanceM / 1000)
}

/** 332 secondes/km donne "5:32 /km". */
export function formatPace(secondsPerKm: number | null): string {
  if (secondsPerKm === null || !Number.isFinite(secondsPerKm)) return '-'
  const total = Math.round(secondsPerKm)
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${min}:${String(sec).padStart(2, '0')} /km`
}

/** 2710 secondes donne "45:10", 3735 secondes donne "1:02:15". */
export function formatDuration(durationS: number): string {
  const total = Math.round(durationS)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`
  return `${m}:${ss}`
}

/** 10500 mètres donne "10,50 km". */
export function formatDistance(distanceM: number): string {
  const km = distanceM / 1000
  return `${km.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} km`
}

/** Compare cette semaine à la précédente, pour les flèches des vignettes. */
export function trend(current: number, previous: number): Trend {
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'same'
}
