import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { isRetrograde } from '../sim/retrograde'
import { clock, useCosmosStore } from '../state/store'

const UPDATE_INTERVAL_SECONDS = 0.25

/**
 * Publishes per-planet retrograde flags to the store at ~4 Hz for the HUD.
 * The per-frame visuals (trace colors, emissive pulse) compute their own
 * flags analytically; this exists only so React UI can subscribe cheaply.
 */
export function RetrogradeMonitor() {
  const sinceUpdate = useRef(0)
  useFrame((_, delta) => {
    sinceUpdate.current += delta
    if (sinceUpdate.current < UPDATE_INTERVAL_SECONDS) return
    sinceUpdate.current = 0
    const { system, retrogradeFlags, setRetrogradeFlags } = useCosmosStore.getState()
    const next: Record<string, boolean> = {}
    let changed = false
    for (const planet of system.planets) {
      next[planet.id] = isRetrograde(planet.chain, clock.days)
      if (next[planet.id] !== retrogradeFlags[planet.id]) changed = true
    }
    if (changed) setRetrogradeFlags(next)
  })
  return null
}
