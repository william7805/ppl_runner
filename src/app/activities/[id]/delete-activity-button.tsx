'use client'

import { useFormStatus } from 'react-dom'

type DeleteActivityButtonProps = {
  action: () => Promise<void>
}

export function DeleteActivityButton({ action }: DeleteActivityButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm('Supprimer définitivement cette activité ?')) {
          event.preventDefault()
        }
      }}
    >
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border px-3 py-2 font-semibold"
    >
      {pending ? 'Suppression...' : '🗑 Supprimer l’activité'}
    </button>
  )
}
