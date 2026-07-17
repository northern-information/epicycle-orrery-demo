import { create } from 'zustand'
import { buildAlmagestSystem } from '../sim/presets/almagest'
import { computeShells } from '../sim/shells'
import type { CircleNode, SystemConfig } from '../sim/types'

/**
 * The simulation clock, in days. Deliberately NOT in the zustand store:
 * it changes every frame, and everything that needs it per frame reads
 * this mutable object inside useFrame. React never subscribes to it.
 */
export const clock = { days: 0 }

export interface ViewToggles {
  deferents: boolean
  epicycles: boolean
  traces: boolean
  velocityVectors: boolean
  /** color trace segments and pulse planets while retrograde */
  retrogradeHighlight: boolean
  /** show only the retrograde portions of traces */
  retrogradeOnly: boolean
  shells: boolean
}

export type CameraMode = 'orbit' | 'fly'

type ChainKey = keyof Pick<CircleNode, 'radius' | 'periodDays' | 'phase0'>

interface CosmosState {
  playing: boolean
  daysPerSecond: number
  cameraMode: CameraMode
  toggles: ViewToggles
  system: SystemConfig
  /** planets currently in retrograde; written at ~4 Hz for the HUD */
  retrogradeFlags: Record<string, boolean>
  /** bumped whenever geometry-affecting params change, so traces reset */
  traceVersion: number
  setPlaying: (playing: boolean) => void
  setDaysPerSecond: (daysPerSecond: number) => void
  setCameraMode: (cameraMode: CameraMode) => void
  setToggle: (key: keyof ViewToggles, value: boolean) => void
  setChainValue: (planetId: string, nodeIndex: number, key: ChainKey, value: number) => void
  setLockToMeanSun: (planetId: string, locked: boolean) => void
  setRetrogradeFlags: (flags: Record<string, boolean>) => void
  clearTraces: () => void
}

export const useCosmosStore = create<CosmosState>()((set) => ({
  playing: true,
  daysPerSecond: 10,
  cameraMode: 'orbit',
  toggles: {
    deferents: true,
    epicycles: true,
    traces: true,
    velocityVectors: false,
    retrogradeHighlight: true,
    retrogradeOnly: false,
    shells: true,
  },
  system: buildAlmagestSystem(),
  retrogradeFlags: {},
  traceVersion: 0,
  setPlaying: (playing) => set({ playing }),
  setDaysPerSecond: (daysPerSecond) => set({ daysPerSecond }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setToggle: (key, value) =>
    set((state) => ({ toggles: { ...state.toggles, [key]: value } })),
  setChainValue: (planetId, nodeIndex, key, value) =>
    set((state) => ({
      system: applyChainValue(state.system, planetId, nodeIndex, key, value),
      traceVersion: state.traceVersion + 1,
    })),
  setLockToMeanSun: (planetId, locked) =>
    set((state) => {
      const sun = state.system.planets.find((planet) => planet.id === 'sun')
      const planets = state.system.planets.map((planet) => {
        if (planet.id !== planetId) return planet
        const chain =
          locked && sun
            ? planet.chain.map((node, i) =>
                i === 0 ? { ...node, periodDays: sun.chain[0].periodDays } : node,
              )
            : planet.chain
        return { ...planet, lockToMeanSun: locked, chain }
      })
      return {
        system: { ...state.system, planets, ...computeShells(planets) },
        traceVersion: state.traceVersion + 1,
      }
    }),
  setRetrogradeFlags: (retrogradeFlags) => set({ retrogradeFlags }),
  clearTraces: () => set((state) => ({ traceVersion: state.traceVersion + 1 })),
}))

/**
 * Update one value in one planet's chain, then rebuild the shell layout so
 * every sphere still exactly contains its machinery. Sun period changes
 * propagate to mean-Sun-locked deferents (Mercury, Venus) and to the Sun's
 * own counter-rotating arm, which must mirror the deferent to stay an
 * eccentric.
 */
function applyChainValue(
  system: SystemConfig,
  planetId: string,
  nodeIndex: number,
  key: ChainKey,
  value: number,
): SystemConfig {
  const planets = system.planets.map((planet) => {
    const owns = planet.id === planetId
    const followsSun =
      planetId === 'sun' && key === 'periodDays' && nodeIndex === 0 && planet.lockToMeanSun
    if (!owns && !followsSun) return planet
    const chain = planet.chain.map((node, i) => {
      if (owns && i === nodeIndex) return { ...node, [key]: value }
      if (owns && planet.id === 'sun' && key === 'periodDays' && i !== nodeIndex) {
        return { ...node, periodDays: value }
      }
      if (followsSun && i === 0) return { ...node, periodDays: value }
      return node
    })
    return { ...planet, chain }
  })
  return { ...system, planets, ...computeShells(planets) }
}
