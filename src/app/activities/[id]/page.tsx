import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { ACTIVITY_LABELS } from '@/lib/activity-types'
import { formatDateTime, formatDistance, formatDuration } from '@/lib/format'
import { formatPace } from '@/lib/pace'
import { requireSession } from '@/lib/session'
import { isUuid } from '@/lib/uuid'
import { deleteActivity } from './actions'
import { DeleteActivityButton } from './delete-activity-button'
import { RouteMap } from '@/components/route-map'
import { trackToCoordinates } from '@/lib/gpx/track'

type ActivityPageProps = {
  params: Promise<{ id: string }>
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const session = await requireSession()
  const { id } = await params

  if (!isUuid(id)) notFound()

  // Filtre sur l'id ET sur l'utilisateur : impossible d'afficher l'activité
  // d'un autre en changeant l'id dans l'URL (protection IDOR)
  const [activity] = await db
    .select()
    .from(activities)
    .where(and(eq(activities.id, id), eq(activities.userId, session.user.id)))
    .limit(1)

  if (!activity) notFound()

  const coordinates = trackToCoordinates(activity.track)
  const pace = activity.distanceMeters
    ? formatPace(activity.distanceMeters, activity.durationSeconds)
    : null

  const rows: [string, string][] = [
    [
      'Distance',
      activity.distanceMeters !== null
        ? formatDistance(activity.distanceMeters)
        : 'n/a',
    ],
    ['Durée', formatDuration(activity.durationSeconds)],
    ['Allure moyenne', pace ?? 'n/a'],
    [
      'Dénivelé positif',
      activity.elevationGainMeters !== null
        ? `${activity.elevationGainMeters} m`
        : 'n/a',
    ],
    [
      'FC moyenne',
      activity.avgHeartRate !== null ? `${activity.avgHeartRate} bpm` : 'n/a',
    ],
    [
      'FC maximale',
      activity.maxHeartRate !== null ? `${activity.maxHeartRate} bpm` : 'n/a',
    ],
  ]

  return (
    <div className="min-h-dvh bg-linear-to-b from-sky-950 to-slate-950 text-white">
      <main className="mx-auto max-w-3xl p-6">
        <Link
          href="/dashboard"
          className="mb-6 inline-block underline-offset-4 hover:underline"
        >
          ← Retour au dashboard
        </Link>

        <p className="text-sm font-semibold text-violet-300">
          {ACTIVITY_LABELS[activity.type]}
        </p>
        <h1 className="mb-6 text-2xl font-bold">
          {formatDateTime(activity.startedAt)}
        </h1>

        <div className="mb-6">
          {coordinates ? (
            <RouteMap
              coordinates={coordinates}
              label={`Carte du parcours du ${formatDateTime(activity.startedAt)}`}
            />
          ) : (
            <p className="rounded-xl border-2 border-dashed border-white/20 p-4 text-center text-sm text-white/50">
              Pas de trace pour cette séance : elle est trop courte, ou a été
              importée avant l&apos;ajout des cartes.
            </p>
          )}
        </div>

        <dl className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur"
            >
              <dt className="text-sm text-white/70">{label}</dt>
              <dd className="text-xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <DeleteActivityButton action={deleteActivity.bind(null, activity.id)} />
      </main>
    </div>
  )
}
