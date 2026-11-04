import { requireSession } from '@/lib/session'
import { SignOutButton } from './sign-out-button'

export default async function DashboardPage() {
  const session = await requireSession()

  return (
    <main className="mx-auto mt-12 max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6">Connecté en tant que {session.user.email}</p>
      <SignOutButton />
    </main>
  )
}
