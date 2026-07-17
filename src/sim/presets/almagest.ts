import { computeShells } from '../shells'
import type { CircleNode, PlanetConfig, SystemConfig } from '../types'

/** Ptolemy's mean solar year in days; every mean-Sun-locked motion uses it. */
export const MEAN_SOLAR_YEAR = 365.2568

interface AlmagestEntry {
  id: string
  name: string
  /** epicycle radius as a fraction of the deferent radius (Almagest, R=60) */
  ratio: number
  /** zodiacal period of the epicycle center along the deferent, days */
  deferentPeriodDays: number
  /**
   * anomaly (synodic) period of the planet around the epicycle, measured
   * in the rotating deferent frame, days. Absent for the Sun.
   */
  epicyclePeriodDays?: number
  /**
   * The Sun has no epicycle: a small arm counter-rotating at the deferent
   * rate keeps a fixed orientation, reproducing Ptolemy's eccentric exactly
   * (the Apollonius equivalence).
   */
  eccentric?: boolean
  lockToMeanSun?: boolean
  phaseDeferent: number
  phaseEpicycle: number
  color: string
  meshRadius: number
}

/**
 * Almagest parameters. Ratios are Ptolemy's epicycle radii with the
 * deferent at 60 parts (e.g. Mars 39;30 → 0.6583). Deferent periods are
 * zodiacal periods; epicycle periods are anomaly/synodic periods. Minor
 * manuscript variants exist; everything is runtime-configurable.
 */
const ENTRIES: AlmagestEntry[] = [
  {
    id: 'moon',
    name: 'Moon',
    ratio: 0.0875,
    deferentPeriodDays: 27.3216,
    epicyclePeriodDays: 27.5545,
    phaseDeferent: 1.2,
    phaseEpicycle: 0,
    color: '#d8d5cc',
    meshRadius: 0.05,
  },
  {
    id: 'mercury',
    name: 'Mercury',
    ratio: 0.375,
    deferentPeriodDays: MEAN_SOLAR_YEAR,
    epicyclePeriodDays: 115.88,
    lockToMeanSun: true,
    phaseDeferent: 0,
    phaseEpicycle: 0.8,
    color: '#c9a86a',
    meshRadius: 0.08,
  },
  {
    id: 'venus',
    name: 'Venus',
    ratio: 0.7194,
    deferentPeriodDays: MEAN_SOLAR_YEAR,
    epicyclePeriodDays: 583.92,
    lockToMeanSun: true,
    phaseDeferent: 0,
    phaseEpicycle: 3.6,
    color: '#f0e6c8',
    meshRadius: 0.3,
  },
  {
    id: 'sun',
    name: 'Sun',
    ratio: 0.0417,
    deferentPeriodDays: MEAN_SOLAR_YEAR,
    eccentric: true,
    phaseDeferent: 0,
    phaseEpicycle: 1.14,
    color: '#ffcc55',
    meshRadius: 0.7,
  },
  {
    id: 'mars',
    name: 'Mars',
    ratio: 0.6583,
    deferentPeriodDays: 686.98,
    epicyclePeriodDays: 779.94,
    phaseDeferent: 2.4,
    phaseEpicycle: 5.0,
    color: '#c96a4a',
    meshRadius: 1.0,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    ratio: 0.1917,
    deferentPeriodDays: 4332.59,
    epicyclePeriodDays: 398.88,
    phaseDeferent: 4.4,
    phaseEpicycle: 2.0,
    color: '#d9b98a',
    meshRadius: 2.2,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    ratio: 0.1083,
    deferentPeriodDays: 10759.22,
    epicyclePeriodDays: 378.09,
    phaseDeferent: 5.5,
    phaseEpicycle: 4.0,
    color: '#b0a184',
    meshRadius: 2.0,
  },
]

/**
 * Seed absolute radii by walking Ptolemy's nesting ladder outward from the
 * Moon's closest approach at 1 scene unit: a shell whose machinery has
 * epicycle ratio k and inner radius R gets deferent d = R/(1−k) and outer
 * radius d(1+k), which is the next shell's inner radius.
 */
export function buildAlmagestPlanets(baseInnerRadius = 1): PlanetConfig[] {
  let inner = baseInnerRadius
  return ENTRIES.map((entry) => {
    const deferentRadius = inner / (1 - entry.ratio)
    const epicycleRadius = entry.ratio * deferentRadius
    inner = deferentRadius * (1 + entry.ratio)
    const deferent: CircleNode = {
      radius: deferentRadius,
      periodDays: entry.deferentPeriodDays,
      direction: 1,
      phase0: entry.phaseDeferent,
    }
    const secondArm: CircleNode = entry.eccentric
      ? {
          radius: epicycleRadius,
          periodDays: entry.deferentPeriodDays,
          direction: -1,
          phase0: entry.phaseEpicycle,
        }
      : {
          radius: epicycleRadius,
          periodDays: entry.epicyclePeriodDays!,
          direction: 1,
          phase0: entry.phaseEpicycle,
        }
    return {
      id: entry.id,
      name: entry.name,
      chain: [deferent, secondArm],
      color: entry.color,
      meshRadius: entry.meshRadius,
      lockToMeanSun: entry.lockToMeanSun,
    }
  })
}

export function buildAlmagestSystem(): SystemConfig {
  const planets = buildAlmagestPlanets()
  const layout = computeShells(planets)
  return { planets, ...layout }
}
