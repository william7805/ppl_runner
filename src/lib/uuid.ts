const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Vérifie qu'une chaîne venue de l'URL est bien un UUID avant de la passer
 * à PostgreSQL. Sinon, la requête planterait (erreur 22P02) au lieu d'un 404.
 */
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}
