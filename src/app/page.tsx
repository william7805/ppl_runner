import Link from 'next/link'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { IslandMap } from '@/components/island-map'
import { formatDaysAgo } from '@/lib/relative-day'
import { requireSession } from '@/lib/session'

export default async function Home() {
  const session = await requireSession()

  // Dernière course de l'utilisateur connecté, pour l'étiquette de la piste
  const [lastRun] = await db
    .select({ startedAt: activities.startedAt })
    .from(activities)
    .where(
      and(eq(activities.userId, session.user.id), eq(activities.type, 'run'))
    )
    .orderBy(desc(activities.startedAt))
    .limit(1)

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bonjour {session.user.name},</h1>
          <p className="opacity-70">
            Prêt à repousser tes limites aujourd&apos;hui ?
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded border px-3 py-2 font-semibold"
        >
          Voir le dashboard
        </Link>
      </header>

      <IslandMap
        subtitles={{
          run: lastRun
            ? `Dernière séance : ${formatDaysAgo(lastRun.startedAt)}`
            : 'Aucune séance',
        }}
      />
    </main>
  )
}
