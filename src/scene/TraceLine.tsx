/* eslint-disable react-hooks/immutability --
   useFrame runs per rendered frame, outside React's render phase; mutating
   preallocated Three.js buffers there is the react-three-fiber idiom. */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { apparentLongitudeRate, evaluateChain } from '../sim/chain'
import type { PlanetConfig } from '../sim/types'
import { clock, useCosmosStore } from '../state/store'

const MAX_SAMPLES = 4096
/** samples per revolution of the fastest circle in the chain */
const SAMPLES_PER_TURN = 256
/** cap on catch-up samples per frame at extreme playback speeds */
const MAX_SAMPLES_PER_FRAME = 1024

const RETROGRADE_COLOR = new THREE.Color('#ff5330')
/** matches the scene background, so prograde vertices vanish */
const HIDDEN_COLOR = new THREE.Color('#050508')

/**
 * A planet's apparent geocentric path. Preallocated position/color buffers
 * with setDrawRange — appending a sample never allocates. Samples are taken
 * at fixed sim-time cadence so trace density is independent of playback
 * speed, and each sample is colored by the analytic sign of dλ/dt.
 */
export function TraceLine({ planet }: { planet: PlanetConfig }) {
  const toggles = useCosmosStore((state) => state.toggles)
  const traceVersion = useCosmosStore((state) => state.traceVersion)

  const { line, positions, colors, retroFlags } = useMemo(() => {
    const positionArray = new Float32Array(MAX_SAMPLES * 3)
    const colorArray = new Float32Array(MAX_SAMPLES * 3)
    const retroArray = new Uint8Array(MAX_SAMPLES)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
    geometry.setDrawRange(0, 0)
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })
    const lineObject = new THREE.Line(geometry, material)
    lineObject.frustumCulled = false
    return {
      line: lineObject,
      positions: positionArray,
      colors: colorArray,
      retroFlags: retroArray,
    }
  }, [])
  useEffect(() => {
    return () => {
      line.geometry.dispose()
      ;(line.material as THREE.Material).dispose()
    }
  }, [line])

  const cursor = useRef({ count: 0, nextSampleTime: Number.NEGATIVE_INFINITY })
  const baseColor = useMemo(() => new THREE.Color(planet.color), [planet.color])

  // parameter changes make the old path a lie; start over
  useEffect(() => {
    cursor.current.count = 0
    cursor.current.nextSampleTime = Number.NEGATIVE_INFINITY
    line.geometry.setDrawRange(0, 0)
  }, [traceVersion, planet, line])

  // recolor already-drawn samples when the retrograde toggles change
  useEffect(() => {
    for (let s = 0; s < cursor.current.count; s++) {
      const retro = retroFlags[s] === 1
      const useRetroColor = retro && (toggles.retrogradeHighlight || toggles.retrogradeOnly)
      const color = useRetroColor
        ? RETROGRADE_COLOR
        : toggles.retrogradeOnly
          ? HIDDEN_COLOR
          : baseColor
      colors[s * 3] = color.r
      colors[s * 3 + 1] = color.g
      colors[s * 3 + 2] = color.b
    }
    ;(line.geometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true
  }, [toggles.retrogradeHighlight, toggles.retrogradeOnly, baseColor, colors, retroFlags, line])

  const sampleInterval = useMemo(() => {
    const fastest = Math.min(...planet.chain.map((node) => Math.abs(node.periodDays)))
    return fastest / SAMPLES_PER_TURN
  }, [planet])

  useFrame(() => {
    const state = cursor.current
    if (state.nextSampleTime === Number.NEGATIVE_INFINITY) {
      state.nextSampleTime = clock.days
    }
    let appended = 0
    while (state.nextSampleTime <= clock.days && appended < MAX_SAMPLES_PER_FRAME) {
      if (state.count === MAX_SAMPLES) {
        // drop the oldest quarter in one move; O(n) but rare
        const keep = Math.floor(MAX_SAMPLES * 0.75)
        const offset = MAX_SAMPLES - keep
        positions.copyWithin(0, offset * 3)
        colors.copyWithin(0, offset * 3)
        retroFlags.copyWithin(0, offset)
        state.count = keep
      }
      const t = state.nextSampleTime
      const { position, velocity } = evaluateChain(planet.chain, t)
      const retrograde = apparentLongitudeRate(position, velocity) < 0
      const i = state.count * 3
      positions[i] = position.x
      positions[i + 1] = position.y
      positions[i + 2] = 0
      retroFlags[state.count] = retrograde ? 1 : 0
      const useRetroColor = retrograde && (toggles.retrogradeHighlight || toggles.retrogradeOnly)
      const color = useRetroColor
        ? RETROGRADE_COLOR
        : toggles.retrogradeOnly
          ? HIDDEN_COLOR
          : baseColor
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
      state.count += 1
      state.nextSampleTime += sampleInterval
      appended += 1
    }
    // if we hit the per-frame cap, skip ahead rather than spiral
    if (state.nextSampleTime <= clock.days) {
      state.nextSampleTime = clock.days
    }
    if (appended > 0) {
      const positionAttribute = line.geometry.getAttribute('position') as THREE.BufferAttribute
      const colorAttribute = line.geometry.getAttribute('color') as THREE.BufferAttribute
      positionAttribute.needsUpdate = true
      colorAttribute.needsUpdate = true
      line.geometry.setDrawRange(0, state.count)
    }
  })

  if (!toggles.traces) return null
  return <primitive object={line} />
}
