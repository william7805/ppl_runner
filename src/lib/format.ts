// Fonctions d'affichage partagées par le dashboard et la page de détail.
// Toutes les dates sont stockées en UTC et affichées à l'heure de Paris.
export const TIME_ZONE = 'Europe/Paris'

const pad = (n: number) => String(n).padStart(2, '0')

/** 3146 → "52:26", 3725 → "1:02:05" */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}

const kmFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 8362 → "8,36 km" */
export function formatDistance(meters: number): string {
  return `${kmFormatter.format(meters / 1000)} km`
}

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: TIME_ZONE,
  dateStyle: 'full',
  timeStyle: 'short',
})

/** 2026-10-31T18:28:48Z → "samedi 31 octobre 2026 à 19:28" */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date)
}
