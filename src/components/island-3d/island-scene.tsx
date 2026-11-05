'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Angle vertical de la caméra, fixe : 0 = vue du dessus, π/2 = au ras du sol
const CAMERA_POLAR_ANGLE = Math.PI / 3.25 // 60°
const CAMERA_DISTANCE = 12
// Limites du zoom à la molette (ou au pincement sur mobile)
const MIN_ZOOM_DISTANCE = 7
const MAX_ZOOM_DISTANCE = 18
// Délai avant que la rotation automatique reprenne après un geste
const RESUME_DELAY_MS = 2000

// Position de départ de la caméra, calculée à partir de l'angle et de la distance
const CAMERA_POSITION: [number, number, number] = [
  CAMERA_DISTANCE * Math.sin(CAMERA_POLAR_ANGLE) * Math.SQRT1_2,
  CAMERA_DISTANCE * Math.cos(CAMERA_POLAR_ANGLE),
  CAMERA_DISTANCE * Math.sin(CAMERA_POLAR_ANGLE) * Math.SQRT1_2,
]

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

export default function IslandScene() {
  const reducedMotion = usePrefersReducedMotion()
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  // Annule le minuteur si la page est quittée pendant la pause
  useEffect(() => () => clearTimeout(resumeTimer.current), [])

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: CAMERA_POSITION, fov: 45 }}
    >
      <color attach="background" args={['#7cc4f2']} />

      {/* Lumières : une ambiante douce et un « soleil » qui projette des ombres */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

      {/* L'île provisoire : un cylindre aplati */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[5, 4.5, 1, 48]} />
        <meshStandardMaterial color="#6abf4b" />
      </mesh>

      {/* Un cube à la place de la piste, pour tester l'étiquette */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      <Html position={[0, 1.7, 0]} center>
        <a
          href="/dashboard"
          className="flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-violet-400 bg-slate-900/90 px-4 py-2 font-semibold text-white"
        >
          <span aria-hidden="true">🏃</span> Piste d&apos;athlétisme
        </a>
      </Html>

      <OrbitControls
        // Seule la rotation horizontale est possible : angle vertical bloqué,
        // pas de zoom, pas de déplacement latéral
        minPolarAngle={CAMERA_POLAR_ANGLE}
        maxPolarAngle={CAMERA_POLAR_ANGLE}
        minDistance={MIN_ZOOM_DISTANCE}
        maxDistance={MAX_ZOOM_DISTANCE}
        enablePan={false}
        autoRotate={!reducedMotion && !isPaused}
        autoRotateSpeed={5}
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
  )
}
