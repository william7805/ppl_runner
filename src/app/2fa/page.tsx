'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function TwoFactorPage() {
  const router = useRouter()
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const code = String(new FormData(event.currentTarget).get('code')).trim()
    const { error } = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code })

    setPending(false)

    if (error) {
      setError('Code invalide ou expiré.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="mx-auto mt-24 max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">Vérification</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          {useBackupCode
            ? 'Code de secours'
            : 'Code à 6 chiffres de ton application'}
          <input
            name="code"
            required
            autoComplete="one-time-code"
            inputMode={useBackupCode ? 'text' : 'numeric'}
            pattern={useBackupCode ? undefined : '\\d{6}'}
            className="rounded border px-3 py-2 tracking-widest"
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
          {pending ? 'Vérification...' : 'Valider'}
        </button>
        <button
          type="button"
          onClick={() => setUseBackupCode(!useBackupCode)}
          className="text-sm underline"
        >
          {useBackupCode
            ? 'Utiliser mon application'
            : 'Utiliser un code de secours'}
        </button>
      </form>
    </main>
  )
}
