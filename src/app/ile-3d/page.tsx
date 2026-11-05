import { Island3D } from '@/components/island-3d/island-3d'
import { requireSession } from '@/lib/session'

// Page de test : la 3D remplacera l'île 2D de l'accueil une fois prête
export default async function Island3DPage() {
  await requireSession()

  return (
    <main className="h-[100dvh]">
      <Island3D />
    </main>
  )
}
