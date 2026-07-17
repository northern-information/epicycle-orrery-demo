import type { ChainSample, CircleNode, Vec2 } from './types'

export const TWO_PI = Math.PI * 2

/** Signed angular rate of a node relative to its parent frame, rad/day. */
export function angularRate(node: CircleNode): number {
  return (node.direction * TWO_PI) / node.periodDays
}

/** A node's angle relative to its parent frame at time t. */
export function nodeAngle(node: CircleNode, tDays: number): number {
  return node.phase0 + angularRate(node) * tDays
}

/**
 * Evaluate a nested chain of circles at time t.
 *
 * Position is the Fourier-like sum Σ r_i·û(Θ_i) where Θ_i is the cumulative
 * (fixed-frame) angle down the chain. Velocity is the exact analytic
 * derivative Σ r_i·Ω_i·û⊥(Θ_i) with Ω_i the cumulative angular rate — no
 * finite differences anywhere.
 */
export function evaluateChain(chain: CircleNode[], tDays: number): ChainSample {
  const joints: Vec2[] = []
  let x = 0
  let y = 0
  let vx = 0
  let vy = 0
  let theta = 0
  let omega = 0
  for (const node of chain) {
    theta += nodeAngle(node, tDays)
    omega += angularRate(node)
    const cos = Math.cos(theta)
    const sin = Math.sin(theta)
    x += node.radius * cos
    y += node.radius * sin
    vx += -node.radius * omega * sin
    vy += node.radius * omega * cos
    joints.push({ x, y })
  }
  return { joints, position: { x, y }, velocity: { x: vx, y: vy } }
}

/** Apparent geocentric longitude of a point, radians in (-π, π]. */
export function apparentLongitude(position: Vec2): number {
  return Math.atan2(position.y, position.x)
}

/**
 * Rate of change of apparent geocentric longitude, rad/day: the planar
 * cross product r × v over |r|². Negative means retrograde.
 */
export function apparentLongitudeRate(position: Vec2, velocity: Vec2): number {
  const r2 = position.x * position.x + position.y * position.y
  return (position.x * velocity.y - position.y * velocity.x) / r2
}

/** Farthest reach of a chain from its anchor (sum of all arm lengths). */
export function chainMaxReach(chain: CircleNode[]): number {
  return chain.reduce((sum, node) => sum + node.radius, 0)
}

/** Closest approach of a chain to its anchor. */
export function chainMinReach(chain: CircleNode[]): number {
  const [first, ...rest] = chain
  if (!first) return 0
  return Math.abs(first.radius - rest.reduce((sum, node) => sum + node.radius, 0))
}
