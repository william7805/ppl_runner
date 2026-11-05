'use client'

import { useActionState } from 'react'
import {
  ACTIVITY_LABELS,
  GPX_ACTIVITY_TYPES,
  type GpxActivityType,
} from '@/lib/activity-types'
import { importGpx, type ImportState } from './actions'

const initialState: ImportState = { status: 'idle', message: '' }

type ImportFormProps = {
  // Renseigné quand on arrive depuis un lieu de l'île (la piste, par exemple)
  fixedType?: GpxActivityType
}

export function ImportForm({ fixedType }: ImportFormProps) {
  const [state, formAction, pending] = useActionState(importGpx, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {fixedType ? (
        <input type="hidden" name="type" value={fixedType} />
      ) : (
        <label className="flex flex-col gap-1">
          Type d&apos;activité
          <select
            name="type"
            required
            defaultValue={GPX_ACTIVITY_TYPES[0]}
            className="rounded border px-3 py-2"
          >
            {GPX_ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {ACTIVITY_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1">
        Fichier GPX (4 Mo maximum)
        <input
          name="file"
          type="file"
          accept=".gpx"
          required
          className="rounded border px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded border px-3 py-2 font-semibold"
      >
        {pending ? 'Import en cours...' : 'Importer'}
      </button>

      {state.status !== 'idle' && (
        <p role="status" className="font-semibold">
          {state.status === 'success' ? '✓ ' : '⚠ '}
          {state.message}
        </p>
      )}
    </form>
  )
}
