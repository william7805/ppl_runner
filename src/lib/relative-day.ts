import { parisDay } from './stats'

/**
 * Écart en jours calendaires (à l'heure de Paris) entre une date et maintenant.
 * Une séance d'hier soir à 23 h affichera « hier », même 2 heures après.
 */
export function formatDaysAgo(date: Date, now: Date = new Date()): string {
  const days = parisDay(now).dayNumber - parisDay(date).dayNumber
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  return `il y a ${days} j`
}
