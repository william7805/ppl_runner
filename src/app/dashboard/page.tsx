import Link from 'next/link'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { formatDateTime, formatDistance, formatDuration } from '@/lib/format'
import { formatPace } from '@/lib/pace'
import { requireSession } from '@/lib/session'
import { computeDistanceStats, computeWeekStats } from '@/lib/stats'
import { Card } from './card'
import { RecentRuns } from './recent-runs'
import { Sidebar } from './sidebar'
import { StatTile } from './stat-tile'

const signed = (n: number, text: string) =>
  `${n > 0 ? '+' : n < 0 ? '-' : ''}${text}`

export default async function DashboardPage() {
  const session = await requireSession()

  // Toujours filtrer sur l'utilisateur connecté, et ici sur la course à pied
  const runs = await db
    .select()
    .from(activities)
    .where(
      and(eq(activities.userId, session.user.id), eq(activities.type, 'run'))
    )
    .orderBy(desc(activities.startedAt))

  const totals = computeDistanceStats(runs)
  const week = computeWeekStats(runs)
  const lastRun = runs[0]

  const countDelta = week.current.count - week.previous.count
  const metersDelta = week.current.meters - week.previous.meters

  return (
    <div className="min-h-dvh bg-linear-to-b from-sky-950 to-slate-950 text-white lg:flex">
      <Sidebar current="run" email={session.user.email} />

      <main className="flex-1 p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-300">
              <span aria-hidden="true">🏃</span> Piste d&apos;athlétisme
            </p>
            <h1 className="text-2xl font-bold">Course à pied</h1>
          </div>
          <Link
            href="/import"
            className="rounded-full bg-violet-600 px-4 py-2 font-semibold hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            + Ajouter un GPX
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <Card
            title="Dernière course"
            className="sm:col-span-2 lg:col-span-6 lg:row-span-2"
          >
            {lastRun ? (
              <>
                <Link
                  href={`/activities/${lastRun.id}`}
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  {formatDateTime(lastRun.startedAt)}
                </Link>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-white/60">Distance</dt>
                    <dd className="font-semibold">
                      {lastRun.distanceMeters !== null
                        ? formatDistance(lastRun.distanceMeters)
                        : 'n/a'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Durée</dt>
                    <dd className="font-semibold">
                      {formatDuration(lastRun.durationSeconds)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Allure</dt>
                    <dd className="font-semibold">
                      {lastRun.distanceMeters
                        ? (formatPace(
                            lastRun.distanceMeters,
                            lastRun.durationSeconds
                          ) ?? 'n/a')
                        : 'n/a'}
                    </dd>
                  </div>
                </dl>
                {/* Emplacement de la carte du parcours */}
                <div className="mt-4 flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-sm text-white/50">
                  Carte du parcours : bientôt
                </div>
              </>
            ) : (
              <p className="text-white/70">
                Aucune course pour l&apos;instant.{' '}
                <Link href="/import" className="underline">
                  Importer un premier fichier GPX
                </Link>
              </p>
            )}
          </Card>

          <StatTile
            className="lg:col-span-3"
            label="Courses cette semaine"
            value={String(week.current.count)}
            delta={countDelta}
            deltaLabel={`${signed(countDelta, String(Math.abs(countDelta)))} vs sem. dernière`}
          />
          <StatTile
            className="lg:col-span-3"
            label="Allure moyenne (semaine)"
            value={week.pace ?? 'n/a'}
          />
          <StatTile
            className="lg:col-span-3"
            label="Km cette semaine"
            value={formatDistance(week.current.meters)}
            delta={metersDelta}
            deltaLabel={`${signed(metersDelta, formatDistance(Math.abs(metersDelta)))} vs sem. dernière`}
          />
          <StatTile
            className="lg:col-span-3"
            label="Km ce mois-ci"
            value={formatDistance(totals.monthMeters)}
          />

          {/* Emplacement des graphiques */}
          <Card title="Progression" className="sm:col-span-2 lg:col-span-7">
            <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-sm text-white/50">
              Graphiques : bientôt
            </div>
          </Card>

          <Card
            title={`Dernières courses (${runs.length})`}
            className="sm:col-span-2 lg:col-span-5"
          >
            {runs.length > 0 ? (
              <RecentRuns runs={runs} />
            ) : (
              <p className="text-white/70">Rien à afficher pour le moment.</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
