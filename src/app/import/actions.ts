'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { isGpxActivityType } from '@/lib/activity-types'
import { GpxError, parseGpx } from '@/lib/gpx/parse-gpx'
import { requireSession } from '@/lib/session'

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024

export type ImportState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export async function importGpx(
  _previousState: ImportState,
  formData: FormData
): Promise<ImportState> {
  // Une server action est un point d'entrée public : on revérifie la session ici
  const session = await requireSession()

  // Le type vient du formulaire, donc il est contrôlé comme toute donnée externe
  const type = formData.get('type')
  if (!isGpxActivityType(type)) {
    return { status: 'error', message: "Type d'activité invalide." }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', message: 'Aucun fichier reçu.' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      status: 'error',
      message: 'Fichier trop volumineux (4 Mo maximum).',
    }
  }
  if (!file.name.toLowerCase().endsWith('.gpx')) {
    return {
      status: 'error',
      message: 'Seuls les fichiers .gpx sont acceptés.',
    }
  }

  try {
    const parsed = parseGpx(await file.text())

    const inserted = await db
      .insert(activities)
      .values({
        userId: session.user.id,
        type,
        startedAt: parsed.startedAt,
        durationSeconds: parsed.durationSeconds,
        distanceMeters: parsed.distanceMeters,
        elevationGainMeters: parsed.elevationGainMeters,
        avgHeartRate: parsed.avgHeartRate,
        maxHeartRate: parsed.maxHeartRate,
      })
      .onConflictDoNothing()
      .returning({ id: activities.id })

    if (inserted.length === 0) {
      return { status: 'error', message: 'Cette séance a déjà été importée.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/') // l'île affiche la date de la dernière séance
    return { status: 'success', message: 'Séance importée.' }
  } catch (error) {
    if (error instanceof GpxError) {
      return { status: 'error', message: error.message }
    }
    console.error('Import GPX échoué', error)
    return { status: 'error', message: "Erreur inattendue pendant l'import." }
  }
}
