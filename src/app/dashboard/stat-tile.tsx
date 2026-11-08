type StatTileProps = {
  label: string
  value: string
  // Écart avec la semaine précédente : le signe donne le sens de la flèche
  delta?: number
  deltaLabel?: string
  className?: string
}

// Flèche + texte + couleur : le sens reste lisible sans les couleurs
// (bleu pour la hausse, orange pour la baisse, jamais rouge/vert)
function Trend({ delta, label }: { delta: number; label: string }) {
  if (delta === 0) {
    return <p className="mt-2 text-sm text-white/60">= {label}</p>
  }
  const up = delta > 0
  return (
    <p className={`mt-2 text-sm ${up ? 'text-sky-300' : 'text-orange-300'}`}>
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      <span className="sr-only">{up ? 'En hausse :' : 'En baisse :'}</span>{' '}
      {label}
    </p>
  )
}

export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  className = '',
}: StatTileProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur ${className}`}
    >
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {delta !== undefined && deltaLabel && (
        <Trend delta={delta} label={deltaLabel} />
      )}
    </div>
  )
}
