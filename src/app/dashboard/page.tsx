import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { ACTIVITY_LABELS } from '@/lib/activity-types'
import { formatDateTime, formatDistance, formatDuration } from '@/lib/format'
import { formatPace } from '@/lib/pace'
import { requireSession } from '@/lib/session'
import { computeDistanceStats } from '@/lib/stats'
import { SignOutButton } from './sign-out-button'

export default async function DashboardPage() {
  const session = await requireSession()

  // Toujours filtrer sur l'utilisateur connecté
  const userActivities = await db
    .select()
    .from(activities)
    .where(eq(activities.userId, session.user.id))
    .orderBy(desc(activities.startedAt))

  const stats = computeDistanceStats(userActivities)

  return (
    <main className="mx-auto mt-12 max-w-4xl p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm opacity-70">
            Connecté en tant que {session.user.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/import"
            className="rounded border px-3 py-2 font-semibold"
          >
            Importer une activité
          </Link>
          <SignOutButton />
        </div>
      </header>

      <section
        aria-label="Statistiques"
        className="mb-8 grid gap-4 sm:grid-cols-3"
      >
        <StatTile
          label="Cette semaine"
          value={formatDistance(stats.weekMeters)}
        />
        <StatTile
          label="Ce mois-ci"
          value={formatDistance(stats.monthMeters)}
        />
        <StatTile
          label={`Total (${stats.totalCount} activité${stats.totalCount > 1 ? 's' : ''})`}
          value={formatDistance(stats.totalMeters)}
        />
      </section>

      {userActivities.length === 0 ? (
        <p>
          Aucune activité pour l&apos;instant.{' '}
          <Link href="/import" className="underline">
            Importer un premier fichier GPX
          </Link>
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {userActivities.map((activity) => (
            <li key={activity.id}>
              <Link
                href={`/activities/${activity.id}`}
                className="block rounded border p-4 transition hover:bg-white/5"
              >
                <p className="text-sm opacity-70">
                  {ACTIVITY_LABELS[activity.type]}
                </p>
                <p className="font-semibold">
                  {formatDateTime(activity.startedAt)}
                </p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="opacity-70">Distance</dt>
                    <dd className="font-semibold">
                      {activity.distanceMeters !== null
                        ? formatDistance(activity.distanceMeters)
                        : 'n/a'}
                    </dd>
                  </div>
                  <div>
                    <dt className="opacity-70">Durée</dt>
                    <dd className="font-semibold">
                      {formatDuration(activity.durationSeconds)}
                    </dd>
                  </div>
                  <div>
                    <dt className="opacity-70">Allure</dt>
                    <dd className="font-semibold">
                      {activity.distanceMeters
                        ? (formatPace(
                            activity.distanceMeters,
                            activity.durationSeconds
                          ) ?? 'n/a')
                        : 'n/a'}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border p-4">
      <p className="text-sm opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
