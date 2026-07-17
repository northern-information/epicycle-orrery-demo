import { describe, expect, it } from 'vitest'
import { chainMaxReach } from '../chain'
import { buildAlmagestPlanets, buildAlmagestSystem } from '../presets/almagest'
import { computeShells } from '../shells'

describe('computeShells', () => {
  it('nests shells with no wasted space: each inner equals the previous outer', () => {
    const { shells } = computeShells(buildAlmagestPlanets())
    for (let i = 1; i < shells.length; i++) {
      expect(shells[i].innerRadius).toBeCloseTo(shells[i - 1].outerRadius, 10)
    }
  })

  it('every shell contains its machinery, even with arbitrary radii', () => {
    const planets = buildAlmagestPlanets()
    planets[4].chain[0].radius = 3
    planets[4].chain[1].radius = 40
    planets[1].chain[1].radius = 0.01
    const { shells } = computeShells(planets)
    planets.forEach((planet, i) => {
      expect(shells[i].outerRadius).toBeGreaterThanOrEqual(chainMaxReach(planet.chain))
      expect(shells[i].outerRadius).toBeGreaterThanOrEqual(shells[i].innerRadius)
    })
  })

  it('matches the Planetary Hypotheses ladder for the almagest seed', () => {
    const { shells } = computeShells(buildAlmagestPlanets())
    const moon = shells[0]
    expect(moon.innerRadius).toBeCloseTo(1, 6)
    expect(moon.outerRadius).toBeCloseTo(1.1917, 3)
    const saturn = shells[6]
    expect(saturn.outerRadius).toBeGreaterThan(140)
    expect(saturn.outerRadius).toBeLessThan(170)
  })

  it('places the fixed stars and primum mobile beyond saturn', () => {
    const system = buildAlmagestSystem()
    const saturnOuter = system.shells[6].outerRadius
    expect(system.fixedStarsRadius).toBeGreaterThan(saturnOuter)
    expect(system.primumMobileRadius).toBeGreaterThan(system.fixedStarsRadius)
  })
})
