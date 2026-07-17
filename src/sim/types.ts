/**
 * One rotating circle in a nested chain of celestial machinery.
 *
 * A chain is evaluated innermost-first: node 0 is the deferent (its arm
 * anchored at Earth), node 1 the epicycle riding the deferent arm's end,
 * and so on to arbitrary depth. Angles are measured relative to the
 * PARENT frame, so an epicycle's period here is the historical anomaly
 * (synodic) period, not its fixed-frame period.
 */
export interface CircleNode {
  /** arm length in scene units */
  radius: number
  /** rotation period relative to the parent frame, in days */
  periodDays: number
  /** 1 = counterclockwise (increasing longitude), -1 = clockwise */
  direction: 1 | -1
  /** angle relative to parent frame at t = 0, radians */
  phase0: number
}

export interface PlanetConfig {
  id: string
  name: string
  /** [0] = deferent, [1] = epicycle, [2+] = deeper nesting */
  chain: CircleNode[]
  color: string
  /** visual radius of the planet mesh, scene units */
  meshRadius: number
  /** keep the deferent synced to the Sun's mean motion (Mercury, Venus) */
  lockToMeanSun?: boolean
}

/** A crystalline celestial sphere; its machinery lives between the radii. */
export interface SphereShell {
  id: string
  name: string
  innerRadius: number
  outerRadius: number
}

export interface SystemConfig {
  planets: PlanetConfig[]
  shells: SphereShell[]
  /** radius of the sphere of the fixed stars */
  fixedStarsRadius: number
  /** radius of the Primum Mobile */
  primumMobileRadius: number
}

export interface Vec2 {
  x: number
  y: number
}

/** Result of evaluating a chain at a moment in time. */
export interface ChainSample {
  /**
   * Position of each joint in the ecliptic plane: joints[0] is the end of
   * the deferent arm (the epicycle center), the last entry is the planet.
   */
  joints: Vec2[]
  /** planet position (same as the last joint) */
  position: Vec2
  /** analytic velocity in scene units per day */
  velocity: Vec2
}
