import { chainMaxReach, chainMinReach } from './chain'
import type { PlanetConfig, SphereShell } from './types'

export const FIXED_STARS_GAP = 1.04
export const PRIMUM_MOBILE_GAP = 1.07

export interface ShellLayout {
  shells: SphereShell[]
  fixedStarsRadius: number
  primumMobileRadius: number
}

/**
 * Compute nested shell radii from the planets' actual machinery, using
 * Ptolemy's Planetary Hypotheses principle: no wasted space. Each shell's
 * inner surface is the previous shell's outer surface, and a shell is just
 * thick enough to contain its planet's farthest reach. Recomputing from the
 * live chains means shells always contain their machinery, whatever the
 * sliders say.
 */
export function computeShells(planets: PlanetConfig[]): ShellLayout {
  const shells: SphereShell[] = []
  let inner = planets.length > 0 ? chainMinReach(planets[0].chain) : 1
  for (const planet of planets) {
    const outer = Math.max(inner, chainMaxReach(planet.chain))
    shells.push({
      id: planet.id,
      name: `${planet.name} sphere`,
      innerRadius: inner,
      outerRadius: outer,
    })
    inner = outer
  }
  const fixedStarsRadius = inner * FIXED_STARS_GAP
  return {
    shells,
    fixedStarsRadius,
    primumMobileRadius: fixedStarsRadius * PRIMUM_MOBILE_GAP,
  }
}
