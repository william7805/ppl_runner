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
    <main className="mx-auto mt-12 max-w-2xl p-6">
      <Link href="/dashboard" className="mb-6 inline-block underline">
        ← Retour au dashboard
      </Link>

      <p className="text-sm opacity-70">{ACTIVITY_LABELS[activity.type]}</p>
      <h1 className="mb-6 text-2xl font-bold">
        {formatDateTime(activity.startedAt)}
      </h1>

      <dl className="mb-10 grid grid-cols-2 gap-4">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded border p-4">
            <dt className="text-sm opacity-70">{label}</dt>
            <dd className="text-xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <DeleteActivityButton action={deleteActivity.bind(null, activity.id)} />
    </main>
  )
}
