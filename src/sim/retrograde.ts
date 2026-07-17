import { apparentLongitudeRate, evaluateChain } from './chain'
import type { CircleNode } from './types'

/** True when the planet's apparent geocentric longitude is decreasing. */
export function isRetrograde(chain: CircleNode[], tDays: number): boolean {
  return longitudeRateAt(chain, tDays) < 0
}

export function longitudeRateAt(chain: CircleNode[], tDays: number): number {
  const sample = evaluateChain(chain, tDays)
  return apparentLongitudeRate(sample.position, sample.velocity)
}

export interface RetrogradeEpisode {
  /** sim time when dλ/dt crosses below zero, days */
  start: number
  /** sim time when dλ/dt crosses back above zero, days */
  end: number
}

/**
 * Find retrograde episodes in [t0, t1] by scanning for sign changes of
 * dλ/dt at `stepDays` resolution, then refining each crossing by bisection.
 */
export function findRetrogradeEpisodes(
  chain: CircleNode[],
  t0: number,
  t1: number,
  stepDays: number,
): RetrogradeEpisode[] {
  const episodes: RetrogradeEpisode[] = []
  let start: number | null = null
  let prevRate = longitudeRateAt(chain, t0)
  for (let t = t0 + stepDays; t <= t1; t += stepDays) {
    const rate = longitudeRateAt(chain, t)
    if (prevRate >= 0 && rate < 0) {
      start = refineCrossing(chain, t - stepDays, t)
    } else if (prevRate < 0 && rate >= 0 && start !== null) {
      episodes.push({ start, end: refineCrossing(chain, t - stepDays, t) })
      start = null
    }
    prevRate = rate
  }
  return episodes
}

/** Bisect a sign change of dλ/dt to sub-minute precision. */
function refineCrossing(chain: CircleNode[], tLo: number, tHi: number): number {
  let lo = tLo
  let hi = tHi
  const loNegative = longitudeRateAt(chain, lo) < 0
  for (let i = 0; i < 40 && hi - lo > 1e-4; i++) {
    const mid = (lo + hi) / 2
    if ((longitudeRateAt(chain, mid) < 0) === loNegative) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}
