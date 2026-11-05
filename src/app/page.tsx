import Link from 'next/link'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { Island3D } from '@/components/island-3d/island-3d'
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
    <main className="relative h-[100dvh] w-full">
      <Island3D
        subtitles={{
          run: lastRun
            ? `Dernière séance : ${formatDaysAgo(lastRun.startedAt)}`
            : 'Aucune séance',
        }}
      />

      {/* En-tête posé sur la scène. pointer-events-none laisse passer les
          gestes vers l'île ; seul le lien reste cliquable */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-4 p-6">
        <div className="rounded-2xl bg-slate-900/70 px-4 py-3 text-white backdrop-blur">
          <h1 className="text-2xl font-bold">Bonjour {session.user.name},</h1>
          <p className="text-sm opacity-80">
            Prêt à repousser tes limites aujourd&apos;hui ?
          </p>
        </div>
        <Link
          href="/dashboard"
          className="pointer-events-auto rounded-full border-2 border-white/30 bg-slate-900/90 px-4 py-2 font-semibold text-white hover:border-white"
        >
          Voir le dashboard
        </Link>
      </header>
    </main>
  )
}
