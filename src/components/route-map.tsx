'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'

// Style sombre Stamen Toner Dark, servi par les serveurs européens de
// Stadia Maps (ADR 0014). Changer cette ligne suffit pour changer de style.
const MAP_STYLE_URL =
  'https://tiles-eu.stadiamaps.com/styles/stamen_toner_dark.json'
const TRACK_COLOR = '#a78bfa' // violet-400, la couleur de la course

type Props = {
  /** Points de la trace au format [longitude, latitude] */
  coordinates: [number, number][]
  /** Description de la carte pour les lecteurs d'écran */
  label: string
}

export function RouteMap({ coordinates, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || coordinates.length < 2) return

    let map: MapLibreMap | undefined
    let cancelled = false

    // MapLibre utilise window et WebGL : on le charge seulement dans le
    // navigateur, une fois le composant affiché
    import('maplibre-gl').then((module) => {
      if (cancelled) return
      // Selon le bundler, la librairie arrive directement ou sous `default`
      const maplibre =
        (module as unknown as { default?: typeof module }).default ?? module

      // Cadre qui englobe toute la trace
      const bounds = new maplibre.LngLatBounds(coordinates[0], coordinates[0])
      for (const point of coordinates) bounds.extend(point)

      map = new maplibre.Map({
        container,
        style: MAP_STYLE_URL,
        bounds,
        fitBoundsOptions: { padding: 32 },
        // Molette et glisser à un doigt désactivés tant qu'on ne tient pas
        // Ctrl (ou deux doigts) : la page reste facile à faire défiler
        cooperativeGestures: true,
        attributionControl: { compact: true },
      })
      map.addControl(new maplibre.NavigationControl({ showCompass: false }))

      map.on('load', () => {
        map?.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates },
          },
        })
        map?.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': TRACK_COLOR, 'line-width': 4 },
        })
      })
    })

    // Nettoyage : libère le contexte WebGL quand le composant disparaît
    return () => {
      cancelled = true
      map?.remove()
    }
  }, [coordinates])

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={label}
      className="h-64 w-full overflow-hidden rounded-xl"
    />
  )
}
