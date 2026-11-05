'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { requireSession } from '@/lib/session'
import { isUuid } from '@/lib/uuid'

export async function deleteActivity(id: string): Promise<void> {
  // Point d'entrée public : on revérifie la session et on contrôle l'id
  const session = await requireSession()
  if (!isUuid(id)) redirect('/dashboard')

  // Le filtre sur l'utilisateur empêche de supprimer l'activité d'un autre
  await db
    .delete(activities)
    .where(and(eq(activities.id, id), eq(activities.userId, session.user.id)))

  revalidatePath('/dashboard')
  revalidatePath('/')
  redirect('/dashboard')
}
