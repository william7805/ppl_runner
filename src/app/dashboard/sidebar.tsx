import Link from 'next/link'
import { PLACES, type PlaceId } from '@/lib/places'
import { SignOutButton } from './sign-out-button'

const itemBase =
  'flex items-center gap-3 rounded-xl px-3 py-2 font-semibold transition'

export function Sidebar({
  current,
  email,
}: {
  current: PlaceId
  email: string
}) {
  return (
    <nav
      aria-label="Navigation principale"
      className="flex flex-col gap-4 border-b border-white/10 bg-slate-900/70 p-4 backdrop-blur lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0"
    >
      <Link
        href="/"
        className={`${itemBase} border-2 border-white/30 hover:border-white`}
      >
        <span aria-hidden="true">←</span> Retour à l&apos;île
      </Link>

      <ul className="flex flex-wrap gap-2 lg:flex-col">
        {PLACES.map((place) => (
          <li key={place.id}>
            {place.href ? (
              <Link
                href={place.href}
                aria-current={place.id === current ? 'page' : undefined}
                className={`${itemBase} hover:bg-white/10 aria-[current=page]:bg-violet-600`}
              >
                <span aria-hidden="true">{place.icon}</span>
                {place.label}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className={`${itemBase} text-white/50`}
              >
                <span aria-hidden="true">{place.icon}</span>
                {place.label}
                <span className="rounded-full border border-dashed border-white/30 px-2 text-xs font-normal">
                  Bientôt
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center gap-3 lg:flex-col lg:items-start">
        <p className="truncate text-sm text-white/60">{email}</p>
        <SignOutButton />
      </div>
    </nav>
  )
}
