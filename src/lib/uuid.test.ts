import { describe, expect, it } from 'vitest'
import { isUuid } from './uuid'

describe('isUuid', () => {
  it('accepte un UUID valide', () => {
    expect(isUuid('3f2b8c1e-9a4d-4e2f-8b6a-1c2d3e4f5a6b')).toBe(true)
  })

  it('refuse une chaîne quelconque', () => {
    expect(isUuid('123')).toBe(false)
    expect(isUuid("1' OR '1'='1")).toBe(false)
  })

  it("refuse un UUID entouré d'autres caractères", () => {
    expect(isUuid('x3f2b8c1e-9a4d-4e2f-8b6a-1c2d3e4f5a6b')).toBe(false)
  })
})
