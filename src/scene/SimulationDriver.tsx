import { useFrame } from '@react-three/fiber'
import { clock, useCosmosStore } from '../state/store'

/**
 * Advances the simulation clock. The only place sim time is written.
 * Reads the store transiently (getState) so nothing re-renders per frame.
 */
export function SimulationDriver() {
  useFrame((_, delta) => {
    const { playing, daysPerSecond } = useCosmosStore.getState()
    if (playing) clock.days += delta * daysPerSecond
  })
  return null
}
