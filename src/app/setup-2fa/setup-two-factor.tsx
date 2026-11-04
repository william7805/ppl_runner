'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { authClient } from '@/lib/auth-client'

export function SetupTwoFactor() {
  const router = useRouter()
  const [totpURI, setTotpURI] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Étape 1 : confirmer le mot de passe et générer le secret TOTP
  async function handleEnable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const password = String(new FormData(event.currentTarget).get('password'))
    const { data, error } = await authClient.twoFactor.enable({ password })

    setPending(false)

    if (error || !data) {
      setError('Mot de passe incorrect.')
      return
    }

    if (data.method !== 'totp') {
      setError("Méthode inattendue : le TOTP n'a pas pu être configuré.")
      return
    }

    setTotpURI(data.totpURI)
    setBackupCodes(data.backupCodes)
  }

  // Étape 2 : prouver que l'application génère les bons codes
  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const code = String(new FormData(event.currentTarget).get('code')).trim()
    const { error } = await authClient.twoFactor.verifyTotp({ code })

    setPending(false)

    if (error) {
      setError("Code invalide. Vérifie l'heure de ton téléphone et réessaie.")
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (!totpURI) {
    return (
      <main className="mx-auto mt-24 max-w-sm p-6">
        <h1 className="mb-2 text-2xl font-bold">Activer le second facteur</h1>
        <p className="mb-6">
          Obligatoire pour accéder à tes données. Confirme ton mot de passe pour
          commencer.
        </p>
        <form onSubmit={handleEnable} className="flex flex-col gap-4">
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Mot de passe"
            className="rounded border px-3 py-2"
          />
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
            Continuer
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="mx-auto mt-12 max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Scanne ce QR code</h1>
      <p className="mb-4">
        Avec Aegis, Google Authenticator ou l’application de ton gestionnaire de
        mots de passe.
      </p>
      <div className="mb-6 inline-block bg-white p-4">
        <QRCode value={totpURI} size={192} />
      </div>

      <h2 className="mb-2 text-lg font-bold">Codes de secours</h2>
      <p className="mb-2">
        Range-les dans ton gestionnaire de mots de passe. Chacun ne sert qu’une
        fois, et ils ne seront plus jamais affichés.
      </p>
      <ul className="mb-6 grid grid-cols-2 gap-1 font-mono">
        {backupCodes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>

      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Code affiché par l’application
          <input
            name="code"
            required
            inputMode="numeric"
            pattern="\d{6}"
            autoComplete="one-time-code"
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
          Activer
        </button>
      </form>
    </main>
  )
}
