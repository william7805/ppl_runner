/**
 * Calcule l'allure au format "m:ss /km".
 * Retourne null si la distance ou la durée ne permettent pas le calcul.
 */
export function formatPace(
  distanceMeters: number,
  durationSeconds: number
): string | null {
  if (distanceMeters <= 0 || durationSeconds <= 0) {
    return null
  }

  const secondsPerKm = Math.round(durationSeconds / (distanceMeters / 1000))
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = secondsPerKm % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
}
