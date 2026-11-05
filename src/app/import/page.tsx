import Link from 'next/link'
import { ACTIVITY_LABELS, isGpxActivityType } from '@/lib/activity-types'
import { requireSession } from '@/lib/session'
import { ImportForm } from './import-form'

type ImportPageProps = {
  searchParams: Promise<{ type?: string | string[] }>
}

export default async function ImportPage({ searchParams }: ImportPageProps) {
  await requireSession()

  const { type } = await searchParams
  const fixedType = isGpxActivityType(type) ? type : undefined

  const title = fixedType
    ? `Importer : ${ACTIVITY_LABELS[fixedType]}`
    : 'Importer une activité'

  return (
    <main className="mx-auto mt-12 max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <ImportForm fixedType={fixedType} />
      <Link href="/dashboard" className="mt-6 inline-block underline">
        Retour au dashboard
      </Link>
    </main>
  )
}
