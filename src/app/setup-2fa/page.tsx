import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/session'
import { SetupTwoFactor } from './setup-two-factor'

export default async function SetupTwoFactorPage() {
  const session = await requireSession({ allowMissing2fa: true })

  if (session.user.twoFactorEnabled) {
    redirect('/dashboard')
  }

  return <SetupTwoFactor />
}
