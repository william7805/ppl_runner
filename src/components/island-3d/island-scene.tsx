'use client'

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import Link from 'next/link'
import { Vector3 } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Clone, OrbitControls, useGLTF } from '@react-three/drei'
import { PLACES, type Place, type PlaceId } from '@/lib/places'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Angle vertical de la caméra : 0 = vue du dessus, π/2 = au ras de l'eau
const CAMERA_START_ANGLE = Math.PI / 3.25 // environ 55° au chargement
const CAMERA_MIN_ANGLE = 0.01 // presque à la verticale de l'île
const CAMERA_MAX_ANGLE = Math.PI / 2 - 0.08 // juste au-dessus de la mer
const CAMERA_DISTANCE = 40
// Limites du zoom à la molette (ou au pincement sur mobile)
const MIN_ZOOM_DISTANCE = 18
const MAX_ZOOM_DISTANCE = 60
// Délai avant que la rotation automatique reprenne après un geste
const RESUME_DELAY_MS = 2000
// 2 = un tour en 30 s, 5 = un tour en 12 s
const AUTO_ROTATE_SPEED = 1.2

// Les modèles sont exportés avec l'axe Z vers le haut, Three.js utilise
// l'axe Y : on fait pivoter tout le monde d'un quart de tour autour de X
const Z_UP_TO_Y_UP = -Math.PI / 2
// Hauteur où l'on pose les bâtiments : juste au-dessus du plateau (1,2)
// et des allées (1,25), pour éviter que deux surfaces se confondent
const PLATEAU_HEIGHT = 1.27
// Les bâtiments sont modélisés à une autre échelle que l'île
const BUILDING_SCALE = 0.6
// Niveau de la mer, juste sous la plage
const SEA_LEVEL = -0.38
const SKY_COLOR = '#7cc4f2'

const ISLAND_MODEL = '/models/ppl_runner_island_v3.glb'

const ACCENTS: Record<PlaceId, string> = {
  run: 'border-violet-400',
  swim: 'border-sky-400',
  strength: 'border-orange-400',
  health: 'border-emerald-400',
}

const CAMERA_POSITION: [number, number, number] = [
  CAMERA_DISTANCE * Math.sin(CAMERA_START_ANGLE) * Math.SQRT1_2,
  CAMERA_DISTANCE * Math.cos(CAMERA_START_ANGLE),
  CAMERA_DISTANCE * Math.sin(CAMERA_START_ANGLE) * Math.SQRT1_2,
]

// Point d'accroche de chaque étiquette dans la scène. Les lieux sont décrits
// avec Z vers le haut ; après le quart de tour, (x, y, z) devient (x, z, -y)
const LABEL_ANCHORS = PLACES.map((place) => {
  const [x, y] = place.position3d
  return new Vector3(x, PLATEAU_HEIGHT + place.labelHeight, -y)
})

type LabelElements = Partial<Record<PlaceId, HTMLElement | null>>

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

function Island() {
  const { scene } = useGLTF(ISLAND_MODEL)
  return <Clone object={scene} castShadow receiveShadow />
}

function Building({ place }: { place: Place }) {
  const { scene } = useGLTF(place.model)
  const [x, y] = place.position3d
  return (
    <Clone
      object={scene}
      position={[x, y, PLATEAU_HEIGHT]}
      scale={BUILDING_SCALE}
      castShadow
      receiveShadow
    />
  )
}

/**
 * À chaque image, calcule la position à l'écran de chaque point d'accroche
 * et y déplace l'étiquette HTML correspondante.
 */
function LabelTracker({ labels }: { labels: React.RefObject<LabelElements> }) {
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

function PlaceLabel({ place }: { place: Place }) {
  const base = `flex items-center gap-2 whitespace-nowrap rounded-full border-2 bg-slate-900/90 px-4 py-2 font-semibold ${ACCENTS[place.id]}`
  const content = (
    <>
      <span aria-hidden="true">{place.icon}</span>
      <span>{place.label}</span>
    </>
  )

  if (!place.href) {
    return (
      <div
        className={`${base} border-dashed text-white/60`}
        aria-disabled="true"
      >
        {content}
        <span className="text-xs font-normal">Bientôt</span>
      </div>
    )
  }

  return (
    <Link href={place.href} className={`${base} text-white`}>
      {content}
    </Link>
  )
}

export default function IslandScene() {
  const reducedMotion = usePrefersReducedMotion()
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const labels = useRef<LabelElements>({})

  // Annule le minuteur si la page est quittée pendant la pause
  useEffect(() => () => clearTimeout(resumeTimer.current), [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        camera={{ position: CAMERA_POSITION, fov: 45 }}
      >
        <color attach="background" args={[SKY_COLOR]} />
        {/* Brume : les objets lointains se fondent dans le ciel */}
        <fog attach="fog" args={[SKY_COLOR, 70, 160]} />

        {/* Lumières : une ambiante douce et un « soleil » qui projette des ombres */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[20, 35, 15]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-camera-far={100}
          shadow-bias={-0.0005}
        />

        {/* La mer */}
        <mesh rotation-x={-Math.PI / 2} position={[0, SEA_LEVEL, 0]}>
          <circleGeometry args={[200, 64]} />
          <meshStandardMaterial color="#2f8fd8" transparent opacity={0.92} />
        </mesh>

        <Suspense fallback={null}>
          <group rotation-x={Z_UP_TO_Y_UP}>
            <Island />
            {PLACES.map((place) => (
              <Building key={place.id} place={place} />
            ))}
          </group>
        </Suspense>

        <LabelTracker labels={labels} />

        <OrbitControls
          // Rotation dans les deux sens et zoom : de la vue au ras de l'eau
          // jusqu'à la vue du dessus, sans déplacement latéral
          minPolarAngle={CAMERA_MIN_ANGLE}
          maxPolarAngle={CAMERA_MAX_ANGLE}
          minDistance={MIN_ZOOM_DISTANCE}
          maxDistance={MAX_ZOOM_DISTANCE}
          enablePan={false}
          autoRotate={!reducedMotion && !isPaused}
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
            <PlaceLabel place={place} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Lance le téléchargement des modèles dès que ce fichier est chargé
useGLTF.preload(ISLAND_MODEL)
PLACES.forEach((place) => useGLTF.preload(place.model))
