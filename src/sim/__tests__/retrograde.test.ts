import { describe, expect, it } from 'vitest'
import { TWO_PI, angularRate } from '../chain'
import { MEAN_SOLAR_YEAR, buildAlmagestPlanets } from '../presets/almagest'
import { findRetrogradeEpisodes } from '../retrograde'
import type { PlanetConfig } from '../types'

const planets = buildAlmagestPlanets()
const byId = (id: string): PlanetConfig => {
  const planet = planets.find((p) => p.id === id)
  if (!planet) throw new Error(`missing planet ${id}`)
  return planet
}

/** synodic periods the retrograde onsets must reproduce, in days */
const SYNODIC: Record<string, number> = {
  mercury: 115.88,
  venus: 583.92,
  mars: 779.94,
  jupiter: 398.88,
  saturn: 378.09,
}

describe('retrograde episodes', () => {
  for (const [id, synodic] of Object.entries(SYNODIC)) {
    it(`${id} onsets are spaced one synodic period apart (within 1%)`, () => {
      const span = synodic * 12
      const episodes = findRetrogradeEpisodes(byId(id).chain, 0, span, synodic / 200)
      expect(episodes.length).toBeGreaterThanOrEqual(10)
      for (let i = 1; i < episodes.length; i++) {
        const spacing = episodes[i].start - episodes[i - 1].start
        expect(Math.abs(spacing - synodic) / synodic).toBeLessThan(0.01)
      }
    })
  }

  it('mars retrograde episodes last roughly 60-80 days', () => {
    const episodes = findRetrogradeEpisodes(byId('mars').chain, 0, 780 * 12, 2)
    expect(episodes.length).toBeGreaterThanOrEqual(10)
    for (const episode of episodes) {
      const duration = episode.end - episode.start
      expect(duration).toBeGreaterThan(60)
      expect(duration).toBeLessThan(80)
    }
  })

  it('venus retrograde episodes last roughly 40-45 days', () => {
    const episodes = findRetrogradeEpisodes(byId('venus').chain, 0, 584 * 12, 2)
    for (const episode of episodes) {
      const duration = episode.end - episode.start
      expect(duration).toBeGreaterThan(40)
      expect(duration).toBeLessThan(45)
    }
  })

  it('the moon and sun never retrograde', () => {
    expect(findRetrogradeEpisodes(byId('moon').chain, 0, 365 * 5, 0.25)).toHaveLength(0)
    expect(findRetrogradeEpisodes(byId('sun').chain, 0, 365 * 5, 0.25)).toHaveLength(0)
  })

  it('hidden heliocentrism: outer planets epicycle rate in the fixed frame is one solar year', () => {
    const solarRate = TWO_PI / MEAN_SOLAR_YEAR
    for (const id of ['mars', 'jupiter', 'saturn']) {
      const [deferent, epicycle] = byId(id).chain
      const fixedFrameRate = angularRate(deferent) + angularRate(epicycle)
      expect(Math.abs(fixedFrameRate - solarRate) / solarRate).toBeLessThan(0.001)
    }
  })
})
