import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MEAN_SOLAR_YEAR } from '../sim/presets/almagest'
import { clock, useCosmosStore } from '../state/store'
import { BRASS, Ring } from './MechanismRings'

const STAR_COUNT = 3500
/** ornamental slow turn: one revolution of the eighth sphere per century */
const TURN_PERIOD_DAYS = 100 * MEAN_SOLAR_YEAR

/**
 * Stars embedded in the sphere of the fixed stars — points ON the shell
 * surface, not distant suns. Approaching the sphere in fly mode makes that
 * physical. The whole eighth sphere turns slowly, driven by the Primum
 * Mobile beyond it, which carries faint engraved great circles.
 */
export function Starfield() {
  const system = useCosmosStore((state) => state.system)
  const groupRef = useRef<THREE.Group>(null)
  const radius = system.fixedStarsRadius

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const colors = new Float32Array(STAR_COUNT * 3)
    const warm = new THREE.Color('#e8dcc0')
    const cool = new THREE.Color('#c2d2ee')
    const color = new THREE.Color()
    for (let i = 0; i < STAR_COUNT; i++) {
      // uniform on the sphere: z uniform in [-1, 1], azimuth uniform
      const z = ((i * 0.754877666) % 1) * 2 - 1
      const azimuth = ((i * 0.569840296) % 1) * Math.PI * 2
      const planar = Math.sqrt(1 - z * z)
      positions[i * 3] = radius * planar * Math.cos(azimuth)
      positions[i * 3 + 1] = radius * planar * Math.sin(azimuth)
      positions[i * 3 + 2] = radius * z
      color.lerpColors(warm, cool, (i * 0.381966011) % 1)
      const brightness = 0.35 + ((i * 0.267949192) % 1) * 0.65
      colors[i * 3] = color.r * brightness
      colors[i * 3 + 1] = color.g * brightness
      colors[i * 3 + 2] = color.b * brightness
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const starMaterial = new THREE.PointsMaterial({
      size: 1.1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
    return { geometry: starGeometry, material: starMaterial }
  }, [radius])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame(() => {
    const group = groupRef.current
    if (group) group.rotation.z = (Math.PI * 2 * clock.days) / TURN_PERIOD_DAYS
  })

  const primumMobile = system.primumMobileRadius
  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
      {/* the Primum Mobile's engraved great circles, armillary style */}
      <Ring radius={primumMobile} color={BRASS} opacity={0.25} segments={256} />
      <group rotation-x={Math.PI / 2}>
        <Ring radius={primumMobile} color={BRASS} opacity={0.25} segments={256} />
      </group>
      <group rotation-y={Math.PI / 2}>
        <Ring radius={primumMobile} color={BRASS} opacity={0.25} segments={256} />
      </group>
      <group rotation-x={Math.PI / 2} rotation-z={Math.PI / 4}>
        <Ring radius={primumMobile} color={BRASS} opacity={0.18} segments={256} />
      </group>
      <group rotation-x={Math.PI / 2} rotation-z={-Math.PI / 4}>
        <Ring radius={primumMobile} color={BRASS} opacity={0.18} segments={256} />
      </group>
    </group>
  )
}
