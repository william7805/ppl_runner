'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(event.currentTarget)
    const { data, error } = await authClient.signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })

    setPending(false)

    if (error) {
      // Message volontairement générique : on ne révèle pas si l'email existe
      setError('Email ou mot de passe incorrect.')
      return
    }

    // Mot de passe correct mais TOTP activé : on demande le code
    if (data && 'twoFactorRedirect' in data && data.twoFactorRedirect) {
      router.push('/2fa')
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="mx-auto mt-24 max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          Mot de passe
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border px-3 py-2"
          />
        </label>
        {error && (
          <p role="alert" className="font-semibold">
            ⚠ {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded border px-3 py-2 font-semibold"
        >
          {pending ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}
