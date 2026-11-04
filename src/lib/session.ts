import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireSession(
  options: { allowMissing2fa?: boolean } = {}
) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Second facteur obligatoire : sans TOTP activé, on force la configuration
  if (!session.user.twoFactorEnabled && !options.allowMissing2fa) {
    redirect('/setup-2fa')
  }

  return session
}
