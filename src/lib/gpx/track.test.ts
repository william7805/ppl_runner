import { describe, expect, it } from 'vitest'
import { distanceBetween } from './distance'
import { decodePolyline, encodePolyline } from './polyline'
import { buildTrack, trackToCoordinates } from './track'

// Un aller vers le nord puis vers l'est, un point tous les 11 m environ
const northThenEast = [
  ...Array.from({ length: 100 }, (_, i) => ({
    lat: 48.85 + i * 0.0001,
    lon: 2.3,
  })),
  ...Array.from({ length: 100 }, (_, i) => ({
    lat: 48.8599,
    lon: 2.3 + (i + 1) * 0.00015,
  })),
]

describe('buildTrack', () => {
  it('renvoie null pour une course trop courte', () => {
    expect(
      buildTrack([
        { lat: 48.85, lon: 2.3 },
        { lat: 48.851, lon: 2.3 },
      ])
    ).toBeNull()
  })

  it('coupe le départ, simplifie et encode', () => {
    const track = buildTrack(northThenEast)
    expect(track).not.toBeNull()

    const decoded = decodePolyline(track!)
    // Deux lignes droites : il ne reste que quelques points
    expect(decoded.length).toBeLessThan(10)
    // Le premier point stocké est à plus de 300 m du vrai départ
    expect(distanceBetween(northThenEast[0], decoded[0])).toBeGreaterThan(290)
  })
})

describe('trackToCoordinates', () => {
  it('inverse latitude et longitude pour MapLibre', () => {
    const track = encodePolyline([
      { lat: 48.85, lon: 2.3 },
      { lat: 48.86, lon: 2.31 },
    ])
    expect(trackToCoordinates(track)).toEqual([
      [2.3, 48.85],
      [2.31, 48.86],
    ])
  })

  it('renvoie null sans trace ou avec une trace illisible', () => {
    expect(trackToCoordinates(null)).toBeNull()
    expect(trackToCoordinates('_p~iF~ps|U_')).toBeNull()
  })
})
