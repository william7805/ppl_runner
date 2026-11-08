// Carte en verre dépoli, même style que les étiquettes de l'île
export function Card({
  title,
  className = '',
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={title}
      className={`rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur ${className}`}
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/70">
        {title}
      </h2>
      {children}
    </section>
  )
}
