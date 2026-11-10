'use client'

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentRef,
  type RefObject,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  EquirectangularReflectionMapping,
  SRGBColorSpace,
  Vector3,
  type Material,
  type Mesh,
  type Object3D,
} from 'three'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import {
  PLACES,
  type Place,
  type PlaceId,
  type PlaceSubtitles,
} from '@/lib/places'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Angle vertical de la caméra : 0 = vue du dessus, π/2 = à l'horizontale
const CAMERA_START_ANGLE = Math.PI / 3.1 // environ 58° au chargement
const CAMERA_MIN_ANGLE = 0.01 // presque à la verticale de l'île
const CAMERA_MAX_ANGLE = Math.PI / 2 + 0.35 // un peu sous l'île, pour voir le cône
const CAMERA_DISTANCE = 58
// Point que la caméra regarde : un peu sous le plateau, pour cadrer aussi le cône
const CAMERA_TARGET: [number, number, number] = [0, -2, 0]
// Limites du zoom à la molette (ou au pincement sur mobile)
const MIN_ZOOM_DISTANCE = 28
const MAX_ZOOM_DISTANCE = 95
// Délai avant que la rotation automatique reprenne après un geste
const RESUME_DELAY_MS = 2000
// 2 = un tour en 30 s, 5 = un tour en 12 s
const AUTO_ROTATE_SPEED = 1.2
// Pas des boutons de contrôle
const ROTATE_STEP = Math.PI / 8 // 22,5°
const TILT_STEP = Math.PI / 12 // 15°
const ZOOM_STEP = 1.2 // ×1,2 en dézoom, ÷1,2 en zoom
// Au-delà de ce déplacement (en pixels) pendant un clic, c'était un glisser
// pour tourner l'île et non un clic sur un lieu
const CLICK_TOLERANCE_PX = 4

// Île complète (relief, rivière, lieux, décor) en un seul modèle, axe Y vers
// le haut, 1 unité = 1 m. Généré par scripts/island/island-builder.js
const ISLAND_MODEL = '/models/ile-volante.glb'
// Ciel : panorama équirectangulaire, sert aussi de lumière d'ambiance et de
// reflet pour l'eau
const SKY_TEXTURE = '/sky/sky_04_2k.png'
const ENVIRONMENT_INTENSITY = 0.7

const ACCENTS: Record<PlaceId, string> = {
  run: 'border-violet-400',
  swim: 'border-sky-400',
  muscu: 'border-orange-400',
  health: 'border-emerald-400',
  quests: 'border-amber-300',
}

const CAMERA_POSITION: [number, number, number] = [
  CAMERA_TARGET[0] +
    CAMERA_DISTANCE * Math.sin(CAMERA_START_ANGLE) * Math.SQRT1_2,
  CAMERA_TARGET[1] + CAMERA_DISTANCE * Math.cos(CAMERA_START_ANGLE),
  CAMERA_TARGET[2] +
    CAMERA_DISTANCE * Math.sin(CAMERA_START_ANGLE) * Math.SQRT1_2,
]

// Point d'accroche de chaque étiquette dans la scène
const LABEL_ANCHORS = PLACES.map((place) => new Vector3(...place.anchor))

// Retrouve le lieu d'un objet cliqué en remontant ses parents jusqu'au groupe
// du lieu (Track, Pool, Gym…)
const PLACE_BY_NODE = new Map(PLACES.map((place) => [place.node, place]))
function findPlace(object: Object3D | null): Place | undefined {
  for (let o = object; o; o = o.parent) {
    const place = PLACE_BY_NODE.get(o.name)
    if (place) return place
  }
  return undefined
}

type LabelElements = Partial<Record<PlaceId, HTMLElement | null>>
type Controls = ComponentRef<typeof OrbitControls>

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

// true si l'utilisateur a demandé à son système de réduire les animations
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  )
}

/** Le ciel en fond de scène, réutilisé comme éclairage d'ambiance et reflets */
function Sky() {
  // Réglages appliqués une seule fois, au chargement de l'image
  const texture = useTexture(SKY_TEXTURE, (loaded) => {
    loaded.mapping = EquirectangularReflectionMapping
    loaded.colorSpace = SRGBColorSpace
  })
  const get = useThree((state) => state.get)

  useEffect(() => {
    const { scene } = get()
    scene.background = texture
    scene.environment = texture
    scene.environmentIntensity = ENVIRONMENT_INTENSITY
    return () => {
      scene.background = null
      scene.environment = null
    }
  }, [texture, get])

  return null
}

type IslandProps = {
  animate: boolean
  onSelect: (href: string) => void
}

function Island({ animate, onSelect }: IslandProps) {
  const { scene } = useGLTF(ISLAND_MODEL)
  // Objets animés, retrouvés par leur nom dans le modèle
  const animated = useRef<{
    blades?: Object3D
    balloon?: Object3D
    balloonBaseY: number
  }>({ balloonBaseY: 0 })

  // Les ombres ne sont pas stockées dans le fichier glTF : on les active ici.
  // L'eau, transparente, ne projette pas d'ombre
  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      mesh.receiveShadow = true
      mesh.castShadow = !(mesh.material as Material).transparent
    })
    const balloon = scene.getObjectByName('Balloon')
    animated.current = {
      blades: scene.getObjectByName('Blades'),
      balloon,
      balloonBaseY: balloon?.position.y ?? 0,
    }
  }, [scene])

  // Remet le curseur normal si on quitte la page en survolant un lieu
  useEffect(() => () => void (document.body.style.cursor = 'auto'), [])

  // Petites animations : pales du moulin et montgolfière qui flotte
  useFrame((state, delta) => {
    const { blades, balloon, balloonBaseY } = animated.current
    if (!animate) return
    blades?.rotateZ(delta * 0.8)
    if (balloon)
      balloon.position.y =
        balloonBaseY + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.6
  })

  return (
    <primitive
      object={scene}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        // Seul l'objet le plus proche de la caméra compte
        event.stopPropagation()
        if (event.delta > CLICK_TOLERANCE_PX) return
        const place = findPlace(event.object)
        if (place?.href) onSelect(place.href)
      }}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        const place = findPlace(event.object)
        document.body.style.cursor = place?.href ? 'pointer' : 'auto'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    />
  )
}

/**
 * À chaque image, calcule la position à l'écran de chaque point d'accroche
 * et y déplace l'étiquette HTML correspondante.
 */
function LabelTracker({ labels }: { labels: RefObject<LabelElements> }) {
  const projected = useRef(new Vector3())

  useFrame(({ camera, size }) => {
    PLACES.forEach((place, index) => {
      const element = labels.current[place.id]
      if (!element) return

      // project() convertit un point 3D en coordonnées écran entre -1 et 1
      const point = projected.current.copy(LABEL_ANCHORS[index]).project(camera)
      const x = ((point.x + 1) / 2) * size.width
      const y = ((1 - point.y) / 2) * size.height

      // z > 1 : le point est derrière la caméra, on cache l'étiquette
      element.style.visibility = point.z > 1 ? 'hidden' : 'visible'
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    })
  })

  return null
}

function PlaceLabel({ place, subtitle }: { place: Place; subtitle?: string }) {
  const base = `flex items-center gap-3 whitespace-nowrap rounded-full border-2 bg-slate-900/90 px-4 py-2 ${ACCENTS[place.id]}`
  const content = (
    <>
      <span className="flex flex-col text-left leading-tight">
        <span className="font-semibold">{place.label}</span>
        <span className="text-xs opacity-80">
          {place.href ? (subtitle ?? 'Aucune séance') : 'Bientôt'}
        </span>
      </span>
    </>
  )

  if (!place.href) {
    return (
      <div
        className={`${base} border-dashed text-white/60`}
        aria-disabled="true"
      >
        {content}
      </div>
    )
  }

  return (
    <Link href={place.href} className={`${base} text-white`}>
      {content}
    </Link>
  )
}

type ControlButtonProps = {
  label: string
  symbol: string
  onClick: () => void
  pressed?: boolean
}

function ControlButton({
  label,
  symbol,
  onClick,
  pressed,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 bg-slate-900/90 text-lg font-bold text-white transition hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span aria-hidden="true">{symbol}</span>
    </button>
  )
}

export default function IslandScene({
  subtitles,
}: {
  subtitles: PlaceSubtitles
}) {
  const router = useRouter()
  const reducedMotion = usePrefersReducedMotion()
  // Choix explicite de l'utilisateur ; null = on suit le réglage du système
  const [rotationChoice, setRotationChoice] = useState<boolean | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const labels = useRef<LabelElements>({})
  const controls = useRef<Controls>(null)

  const isRotating = rotationChoice ?? !reducedMotion

  // Annule le minuteur si la page est quittée pendant la pause
  useEffect(() => () => clearTimeout(resumeTimer.current), [])

  // Un bouton agit comme un geste : la rotation s'interrompt puis reprend
  function pauseThenResume() {
    clearTimeout(resumeTimer.current)
    setIsPaused(true)
    resumeTimer.current = setTimeout(() => setIsPaused(false), RESUME_DELAY_MS)
  }

  function rotate(delta: number) {
    const c = controls.current
    if (!c) return
    pauseThenResume()
    c.setAzimuthalAngle(c.getAzimuthalAngle() + delta)
    c.update()
  }

  function tilt(delta: number) {
    const c = controls.current
    if (!c) return
    pauseThenResume()
    // Les limites minPolarAngle / maxPolarAngle sont appliquées par update()
    c.setPolarAngle(c.getPolarAngle() + delta)
    c.update()
  }

  function zoom(factor: number) {
    const c = controls.current
    if (!c) return
    pauseThenResume()
    // On rapproche ou on éloigne la caméra le long de la droite qui la relie
    // au centre de l'île, en respectant les limites du zoom
    const offset = c.object.position.clone().sub(c.target)
    const distance = Math.min(
      MAX_ZOOM_DISTANCE,
      Math.max(MIN_ZOOM_DISTANCE, offset.length() * factor)
    )
    offset.setLength(distance)
    c.object.position.copy(c.target).add(offset)
    c.update()
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        camera={{ position: CAMERA_POSITION, fov: 45 }}
      >
        {/* Lumières : un ciel chaud et un soleil couchant qui projette des ombres */}
        <hemisphereLight args={['#ffd2b0', '#5a4a78', 0.6]} />
        <directionalLight
          position={[-14, 26, 46]}
          color="#ffb070"
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-34}
          shadow-camera-right={34}
          shadow-camera-top={34}
          shadow-camera-bottom={-34}
          shadow-camera-far={140}
          shadow-bias={-0.0008}
          shadow-normalBias={0.06}
        />

        <Suspense fallback={null}>
          <Sky />
          <Island
            animate={!reducedMotion}
            onSelect={(href) => router.push(href)}
          />
        </Suspense>

        <LabelTracker labels={labels} />

        <OrbitControls
          ref={controls}
          target={CAMERA_TARGET}
          // Rotation dans les deux sens et zoom : de la vue sous l'île
          // jusqu'à la vue du dessus, sans déplacement latéral
          minPolarAngle={CAMERA_MIN_ANGLE}
          maxPolarAngle={CAMERA_MAX_ANGLE}
          minDistance={MIN_ZOOM_DISTANCE}
          maxDistance={MAX_ZOOM_DISTANCE}
          enablePan={false}
          autoRotate={isRotating && !isPaused}
          autoRotateSpeed={AUTO_ROTATE_SPEED}
          onStart={() => {
            clearTimeout(resumeTimer.current)
            setIsPaused(true)
          }}
          onEnd={() => {
            resumeTimer.current = setTimeout(
              () => setIsPaused(false),
              RESUME_DELAY_MS
            )
          }}
        />
      </Canvas>

      {/* Couche des étiquettes, par-dessus la scène. pointer-events-none laisse
          passer les gestes vers la scène ; seules les étiquettes sont cliquables */}
      <div className="pointer-events-none absolute inset-0">
        {PLACES.map((place) => (
          <div
            key={place.id}
            ref={(element) => {
              labels.current[place.id] = element
            }}
            className="pointer-events-auto absolute left-0 top-0"
            style={{ visibility: 'hidden' }}
          >
            <PlaceLabel place={place} subtitle={subtitles[place.id]} />
          </div>
        ))}
      </div>

      {/* Boutons de contrôle : alternative à la souris, utilisable au clavier */}
      <div
        role="toolbar"
        aria-label="Contrôles de la vue"
        className="absolute bottom-6 right-6 grid grid-cols-3 gap-2"
      >
        <span />
        <ControlButton
          label="Monter la caméra"
          symbol="↑"
          onClick={() => tilt(-TILT_STEP)}
        />
        <ControlButton
          label="Zoomer"
          symbol="+"
          onClick={() => zoom(1 / ZOOM_STEP)}
        />

        <ControlButton
          label="Tourner à gauche"
          symbol="←"
          onClick={() => rotate(-ROTATE_STEP)}
        />
        <ControlButton
          label={
            isRotating
              ? 'Arrêter la rotation automatique'
              : 'Lancer la rotation automatique'
          }
          symbol={isRotating ? '⏸' : '▶'}
          pressed={isRotating}
          onClick={() => setRotationChoice(!isRotating)}
        />
        <ControlButton
          label="Tourner à droite"
          symbol="→"
          onClick={() => rotate(ROTATE_STEP)}
        />

        <span />
        <ControlButton
          label="Descendre la caméra"
          symbol="↓"
          onClick={() => tilt(TILT_STEP)}
        />
        <ControlButton
          label="Dézoomer"
          symbol="−"
          onClick={() => zoom(ZOOM_STEP)}
        />
      </div>
    </div>
  )
}

// Lance le téléchargement du modèle et du ciel dès que ce fichier est chargé
useGLTF.preload(ISLAND_MODEL)
useTexture.preload(SKY_TEXTURE)
