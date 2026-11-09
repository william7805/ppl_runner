import { requireSession } from '@/lib/session'

export default async function MuscuPage() {
  await requireSession()

  return (
    <main className="min-h-dvh bg-linear-to-b from-sky-950 to-slate-950 p-6 text-white">
      <h1 className="text-2xl font-bold">Musculation</h1>
    </main>
  )
}