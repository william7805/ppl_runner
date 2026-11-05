import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Vérification optimiste : on regarde seulement si un cookie existe.
// Ce n'est PAS une protection : la vraie vérification est faite par
// requireSession() dans chaque page et chaque server action (cf. CVE-2025-29927).
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/import/:path*', '/activities/:path*'],
}
