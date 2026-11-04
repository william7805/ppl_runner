import { describe, expect, it } from 'vitest'
import { GpxError, parseGpx } from './parse-gpx'

function point(lon: number, time: string, ele?: number, hr?: number): string {
  const eleTag = ele !== undefined ? `<ele>${ele}</ele>` : ''
  const hrTag =
    hr !== undefined
      ? `<extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>${hr}</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>`
      : ''
  return `<trkpt lat="0" lon="${lon}">${eleTag}<time>${time}</time>${hrTag}</trkpt>`
}

function gpx(points: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk><trkseg>${points}</trkseg></trk>
</gpx>`
}

const T0 = '2026-11-01T08:00:00Z'
const T1 = '2026-11-01T08:01:00Z'
const T2 = '2026-11-01T08:02:00Z'
const T3 = '2026-11-01T08:03:00Z'

describe('parseGpx : fichiers valides', () => {
  it('extrait la date de début, la durée et la distance', () => {
    const result = parseGpx(
      gpx(point(0, T0) + point(0.001, T1) + point(0.002, T2))
    )

    expect(result.startedAt.toISOString()).toBe('2026-11-01T08:00:00.000Z')
    expect(result.durationSeconds).toBe(120)
    expect(result.distanceMeters).toBe(222)
  })

  it('additionne uniquement les montées pour le dénivelé positif', () => {
    const result = parseGpx(
      gpx(
        point(0, T0, 10) +
          point(0.001, T1, 15) +
          point(0.002, T2, 12) +
          point(0.003, T3, 20)
      )
    )
    // +5, puis descente ignorée, puis +8
    expect(result.elevationGainMeters).toBe(13)
  })

  it('calcule la fréquence cardiaque moyenne et maximale', () => {
    const result = parseGpx(
      gpx(
        point(0, T0, 10, 140) +
          point(0.001, T1, 10, 150) +
          point(0.002, T2, 10, 160)
      )
    )
    expect(result.avgHeartRate).toBe(150)
    expect(result.maxHeartRate).toBe(160)
  })

  it('renvoie null pour la fréquence cardiaque si elle est absente', () => {
    const result = parseGpx(gpx(point(0, T0) + point(0.001, T1)))
    expect(result.avgHeartRate).toBeNull()
    expect(result.maxHeartRate).toBeNull()
  })

  it('ignore une fréquence cardiaque absurde', () => {
    const result = parseGpx(
      gpx(point(0, T0, 10, 999) + point(0.001, T1, 10, 150))
    )
    expect(result.maxHeartRate).toBe(150)
  })
})

describe('parseGpx : sécurité', () => {
  it('refuse une entité externe (XXE)', () => {
    const xxe = `<?xml version="1.0"?>
<!DOCTYPE gpx [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<gpx><trk><trkseg><trkpt lat="0" lon="0"><time>&xxe;</time></trkpt></trkseg></trk></gpx>`
    expect(() => parseGpx(xxe)).toThrow(GpxError)
  })

  it('refuse des entités imbriquées (billion laughs)', () => {
    const bomb = `<?xml version="1.0"?>
<!DOCTYPE gpx [
  <!ENTITY lol "lol">
  <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
]>
<gpx>&lol2;</gpx>`
    expect(() => parseGpx(bomb)).toThrow(GpxError)
  })

  it('refuse un XML mal formé', () => {
    expect(() => parseGpx('<gpx><trk>')).toThrow(GpxError)
  })

  it('refuse un autre format XML', () => {
    expect(() => parseGpx('<kml><Document></Document></kml>')).toThrow(GpxError)
  })

  it('refuse un fichier vide', () => {
    expect(() => parseGpx('')).toThrow(GpxError)
  })
})

describe('parseGpx : données invalides', () => {
  it('refuse une trace de moins de deux points', () => {
    expect(() => parseGpx(gpx(point(0, T0)))).toThrow(GpxError)
  })

  it('refuse des coordonnées hors limites', () => {
    const invalid =
      `<trkpt lat="95" lon="0"><time>${T0}</time></trkpt>` + point(0.001, T1)
    expect(() => parseGpx(gpx(invalid))).toThrow(GpxError)
  })

  it('refuse un point sans horodatage', () => {
    const noTime = `<trkpt lat="0" lon="0"></trkpt>` + point(0.001, T1)
    expect(() => parseGpx(gpx(noTime))).toThrow(GpxError)
  })

  it('refuse une durée nulle ou négative', () => {
    expect(() => parseGpx(gpx(point(0, T1) + point(0.001, T0)))).toThrow(
      GpxError
    )
  })
})
