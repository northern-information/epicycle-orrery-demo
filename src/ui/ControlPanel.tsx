import { button, useControls } from 'leva'
import { useCosmosStore, type CameraMode, type ViewToggles } from '../state/store'
import type { PlanetConfig } from '../sim/types'

/**
 * The leva panel. Controls write into the zustand store via onChange so
 * per-frame consumers read them transiently; nothing here re-renders while
 * the simulation runs.
 */
export function ControlPanel() {
  const planets = useCosmosStore((state) => state.system.planets)
  const sunPeriod = usePlanetPeriod('sun')
  return (
    <>
      <TimeControls />
      <ViewControls />
      <CameraControls />
      {planets.map((planet) => (
        <PlanetControls key={planet.id} planet={planet} sunPeriod={sunPeriod} />
      ))}
    </>
  )
}

function usePlanetPeriod(id: string): number {
  return useCosmosStore(
    (state) => state.system.planets.find((planet) => planet.id === id)?.chain[0].periodDays ?? 0,
  )
}

function TimeControls() {
  useControls('time', {
    playing: {
      value: useCosmosStore.getState().playing,
      onChange: (value: boolean) => useCosmosStore.getState().setPlaying(value),
    },
    daysPerSecond: {
      value: useCosmosStore.getState().daysPerSecond,
      min: 0.1,
      max: 1000,
      label: 'days / second',
      onChange: (value: number) => useCosmosStore.getState().setDaysPerSecond(value),
    },
  })
  return null
}

const TOGGLE_LABELS: Record<keyof ViewToggles, string> = {
  deferents: 'deferents',
  epicycles: 'epicycles',
  traces: 'orbit traces',
  velocityVectors: 'velocity vectors',
  retrogradeHighlight: 'retrograde highlight',
  retrogradeOnly: 'retrograde path only',
  shells: 'crystal spheres',
}

function ViewControls() {
  const toggles = useCosmosStore.getState().toggles
  const schema = Object.fromEntries(
    (Object.keys(TOGGLE_LABELS) as Array<keyof ViewToggles>).map((key) => [
      key,
      {
        value: toggles[key],
        label: TOGGLE_LABELS[key],
        onChange: (value: boolean) => useCosmosStore.getState().setToggle(key, value),
      },
    ]),
  )
  useControls('view', {
    ...schema,
    clearTraces: button(() => useCosmosStore.getState().clearTraces()),
  })
  return null
}

function CameraControls() {
  useControls('camera', {
    mode: {
      value: useCosmosStore.getState().cameraMode,
      options: ['orbit', 'fly'] as CameraMode[],
      onChange: (value: CameraMode) => useCosmosStore.getState().setCameraMode(value),
    },
  })
  return null
}

function PlanetControls({ planet, sunPeriod }: { planet: PlanetConfig; sunPeriod: number }) {
  const locked = planet.lockToMeanSun === true
  const lockable = planet.id === 'mercury' || planet.id === 'venus'
  const isSun = planet.id === 'sun'
  const [deferent, secondArm] = planet.chain
  const set = (nodeIndex: number, key: 'radius' | 'periodDays' | 'phase0') =>
    (value: number, _path: string, context: { initial: boolean }) => {
      if (!context.initial) {
        useCosmosStore.getState().setChainValue(planet.id, nodeIndex, key, value)
      }
    }
  useControls(
    planet.name,
    {
      deferentRadius: {
        value: deferent.radius,
        min: 0.5,
        max: 250,
        label: 'deferent radius',
        onChange: set(0, 'radius'),
      },
      deferentPeriod: {
        value: deferent.periodDays,
        min: 5,
        max: 12000,
        label: 'deferent period (d)',
        disabled: locked,
        onChange: set(0, 'periodDays'),
      },
      deferentPhase: {
        value: deferent.phase0,
        min: 0,
        max: Math.PI * 2,
        label: 'deferent phase',
        onChange: set(0, 'phase0'),
      },
      epicycleRadius: {
        value: secondArm.radius,
        min: 0.01,
        max: 120,
        label: isSun ? 'eccentricity arm' : 'epicycle radius',
        onChange: set(1, 'radius'),
      },
      ...(isSun
        ? {}
        : {
            epicyclePeriod: {
              value: secondArm.periodDays,
              min: 5,
              max: 12000,
              label: 'epicycle period (d)',
              onChange: set(1, 'periodDays'),
            },
          }),
      epicyclePhase: {
        value: secondArm.phase0,
        min: 0,
        max: Math.PI * 2,
        label: isSun ? 'apogee direction' : 'epicycle phase',
        onChange: set(1, 'phase0'),
      },
      ...(lockable
        ? {
            lockToMeanSun: {
              value: locked,
              label: 'lock to mean sun',
              onChange: (value: boolean, _path: string, context: { initial: boolean }) => {
                if (!context.initial) {
                  useCosmosStore.getState().setLockToMeanSun(planet.id, value)
                }
              },
            },
          }
        : {}),
    },
    { collapsed: true },
    [locked, locked ? sunPeriod : 0],
  )
  return null
}
