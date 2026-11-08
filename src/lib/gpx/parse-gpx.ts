import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { distanceBetween, type GeoPoint } from './distance'
import { buildTrack } from './track'
export class GpxError extends Error {}

export type GpxActivity = {
  startedAt: Date
  durationSeconds: number
  distanceMeters: number
  elevationGainMeters: number
  avgHeartRate: number | null
  maxHeartRate: number | null
  /** Trace prête à stocker (encoded polyline), null si trop courte */
  track: string | null
}

type TrackPoint = GeoPoint & {
  ele: number | null
  time: Date
  hr: number | null
}

// Forme brute renvoyée par le parser XML (toutes les valeurs sont des chaînes).
// La fréquence cardiaque peut arriver sous deux formes, selon la montre :
// - Garmin et la plupart des apps : <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>
// - COROS (namespace cluetrust gpxdata) : <extensions><gpxdata:hr>
type RawExtensions = {
  hr?: string
  TrackPointExtension?: { hr?: string }
}
type RawPoint = {
  lat?: string
  lon?: string
  ele?: string
  time?: string
  extensions?: RawExtensions
}
type RawGpx = { trk?: { trkseg?: { trkpt?: RawPoint[] }[] }[] }

// Un GPX n'a jamais besoin de DTD ni d'entités : on refuse tout fichier
// qui en déclare (protection contre XXE et « billion laughs »)
const FORBIDDEN_DECLARATIONS = /<!DOCTYPE|<!ENTITY/i

const parser = new XMLParser({
  ignoreAttributes: false, // on a besoin des attributs lat et lon
  attributeNamePrefix: '',
  removeNSPrefix: true, // "gpxtpx:hr" et "gpxdata:hr" deviennent "hr"
  processEntities: false, // aucune entité n'est interprétée
  parseTagValue: false, // on convertit nous-mêmes, avec validation
  isArray: (name) => ['trk', 'trkseg', 'trkpt'].includes(name),
})

function toNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// Cherche la fréquence cardiaque dans les formats connus, Garmin en premier
function readHeartRate(extensions: RawExtensions | undefined): number | null {
  const hr = toNumber(extensions?.TrackPointExtension?.hr ?? extensions?.hr)
  // Ignorée si physiologiquement absurde
  return hr !== null && hr >= 20 && hr <= 250 ? hr : null
}

function toTrackPoint(raw: RawPoint, index: number): TrackPoint {
  const lat = toNumber(raw.lat)
  const lon = toNumber(raw.lon)
  if (
    lat === null ||
    lon === null ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    throw new GpxError(`Point ${index + 1} : coordonnées invalides.`)
  }

  const time = raw.time ? new Date(raw.time) : null
  if (!time || Number.isNaN(time.getTime())) {
    throw new GpxError(`Point ${index + 1} : horodatage manquant ou invalide.`)
  }

  return {
    lat,
    lon,
    ele: toNumber(raw.ele),
    time,
    hr: readHeartRate(raw.extensions),
  }
}

export function parseGpx(xml: string): GpxActivity {
  if (FORBIDDEN_DECLARATIONS.test(xml)) {
    throw new GpxError(
      "Fichier refusé : déclaration DTD ou d'entité interdite."
    )
  }

  if (XMLValidator.validate(xml) !== true) {
    throw new GpxError("Le fichier n'est pas un XML valide.")
  }

  const doc = parser.parse(xml) as { gpx?: RawGpx }
  if (!doc.gpx) {
    throw new GpxError("Le fichier n'est pas un fichier GPX.")
  }

  const points = (doc.gpx.trk ?? [])
    .flatMap((track) => track.trkseg ?? [])
    .flatMap((segment) => segment.trkpt ?? [])
    .map(toTrackPoint)

  if (points.length < 2) {
    throw new GpxError('La trace doit contenir au moins deux points.')
  }

  const first = points[0]
  const last = points[points.length - 1]
  const durationSeconds = Math.round(
    (last.time.getTime() - first.time.getTime()) / 1000
  )
  if (durationSeconds <= 0) {
    throw new GpxError("La durée de l'activité doit être positive.")
  }

  let distance = 0
  let elevationGain = 0
  for (let i = 1; i < points.length; i++) {
    distance += distanceBetween(points[i - 1], points[i])

    const previousEle = points[i - 1].ele
    const currentEle = points[i].ele
    if (
      previousEle !== null &&
      currentEle !== null &&
      currentEle > previousEle
    ) {
      elevationGain += currentEle - previousEle
    }
  }

  const heartRates = points
    .map((p) => p.hr)
    .filter((hr): hr is number => hr !== null)

  return {
    startedAt: first.time,
    durationSeconds,
    distanceMeters: Math.round(distance),
    elevationGainMeters: Math.round(elevationGain),
    avgHeartRate:
      heartRates.length > 0
        ? Math.round(
            heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
          )
        : null,
    maxHeartRate: heartRates.length > 0 ? Math.max(...heartRates) : null,
    track: buildTrack(points),
  }
}
