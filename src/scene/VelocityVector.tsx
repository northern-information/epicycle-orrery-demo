import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { ArrowHelper, Vector3 } from 'three'
import { evaluateChain } from '../sim/chain'
import type { PlanetConfig } from '../sim/types'
import { clock, useCosmosStore } from '../state/store'

const direction = new Vector3()

/**
 * The planet's analytic velocity as an arrow in the ecliptic plane.
 * Lives in the flat sim-coordinate root, not inside the rotating groups,
 * so it can be placed directly from evaluateChain.
 */
export function VelocityVector({ planet }: { planet: PlanetConfig }) {
  const show = useCosmosStore((state) => state.toggles.velocityVectors)
  const ref = useRef<ArrowHelper>(null)
  useFrame(() => {
    const arrow = ref.current
    if (!arrow) return
    const { position, velocity } = evaluateChain(planet.chain, clock.days)
    const speed = Math.hypot(velocity.x, velocity.y)
    if (speed === 0) return
    arrow.position.set(position.x, position.y, 0)
    direction.set(velocity.x / speed, velocity.y / speed, 0)
    arrow.setDirection(direction)
    const length = Math.min(2 + speed * 12, 30)
    arrow.setLength(length, length * 0.22, length * 0.12)
  })
  if (!show) return null
  return <arrowHelper ref={ref} args={[undefined, undefined, 5, '#7fb4d9']} />
}
