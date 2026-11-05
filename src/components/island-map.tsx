import Image from 'next/image'
import Link from 'next/link'
import { PLACES, type Place, type PlaceId } from '@/lib/places'

// Une couleur fixe par lieu, toujours accompagnée d'une icône et d'un texte :
// la couleur n'est jamais le seul repère
const ACCENTS: Record<PlaceId, string> = {
  run: 'border-violet-400',
  swim: 'border-sky-400',
  strength: 'border-orange-400',
  health: 'border-emerald-400',
}

type IslandMapProps = {
  subtitles: Partial<Record<PlaceId, string>>
}

export function IslandMap({ subtitles }: IslandMapProps) {
  return (
    <>
      {/* Écrans moyens et grands : l'île avec les étiquettes posées dessus */}
      <div className="relative hidden w-full md:block">
        <Image
          src="/island.webp"
          alt="Île PPL_RUNNER : piste d'athlétisme, piscine, espace musculation et maison santé"
          width={1672}
          height={941}
          priority
          className="h-auto w-full rounded-2xl"
        />
        {PLACES.map((place) => (
          <div
            key={place.id}
            className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
            style={{ left: `${place.left}%`, top: `${place.top}%` }}
          >
            <PlaceLabel place={place} subtitle={subtitles[place.id]} />
            <span
              aria-hidden="true"
              className={`mt-1 h-3 w-3 rounded-full border-2 bg-white ${ACCENTS[place.id]}`}
            />
          </div>
        ))}
      </div>

      {/* Petits écrans : une simple liste des lieux */}
      <ul className="grid gap-3 md:hidden">
        {PLACES.map((place) => (
          <li key={place.id}>
            <PlaceLabel place={place} subtitle={subtitles[place.id]} />
          </li>
        ))}
      </ul>
    </>
  )
}

function PlaceLabel({ place, subtitle }: { place: Place; subtitle?: string }) {
  const content = (
    <>
      <span aria-hidden="true" className="text-2xl">
        {place.icon}
      </span>
      <span className="flex flex-col text-left">
        <span className="font-semibold">{place.label}</span>
        <span className="text-xs opacity-80">
          {place.href ? subtitle : 'Bientôt'}
        </span>
      </span>
      {place.href && <span aria-hidden="true">›</span>}
    </>
  )

  const base = `flex items-center gap-3 whitespace-nowrap rounded-full border-2 bg-slate-900/90 px-4 py-2 backdrop-blur ${ACCENTS[place.id]}`

  if (!place.href) {
    return (
      <div
        className={`${base} border-dashed text-white/60`}
        aria-disabled="true"
      >
        {content}
      </div>
    )
  }

  return (
    <Link
      href={place.href}
      className={`${base} text-white transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white`}
    >
      {content}
    </Link>
  )
}
