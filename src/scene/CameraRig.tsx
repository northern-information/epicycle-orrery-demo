import { FlyControls, OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils } from 'three'
import type { FlyControls as FlyControlsImpl } from 'three-stdlib'
import { useCosmosStore } from '../state/store'

/**
 * Exactly one control scheme is mounted at a time. Orbit inspects the
 * machine from outside; fly (WASD + R/F, drag to look) moves between the
 * spheres, with speed scaled to distance from Earth so travel feels right
 * at Moon scale and at Saturn scale. Press C to switch modes.
 */
export function CameraRig() {
  const mode = useCosmosStore((state) => state.cameraMode)
  const camera = useThree((state) => state.camera)
  const flyRef = useRef<FlyControlsImpl>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'c') return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const { cameraMode, setCameraMode } = useCosmosStore.getState()
      setCameraMode(cameraMode === 'orbit' ? 'fly' : 'orbit')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useFrame(() => {
    const fly = flyRef.current
    if (!fly) return
    fly.movementSpeed = MathUtils.clamp(camera.position.length() * 0.5, 1, 160)
  })

  if (mode === 'fly') {
    return <FlyControls ref={flyRef} makeDefault dragToLook rollSpeed={0.4} />
  }
  return <OrbitControls makeDefault />
}
