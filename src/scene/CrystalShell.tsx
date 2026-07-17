import { useEffect, useMemo } from 'react'
import { useCosmosStore } from '../state/store'
import { createCrystalMaterial } from './materials/crystal'

/**
 * One crystalline sphere surface. Each celestial sphere's outer surface is
 * the next sphere's inner surface (no wasted space), so one surface per
 * boundary is enough. renderOrder descends with radius so alpha blending
 * sorts correctly from a camera anywhere inside the nest.
 */
function CrystalShell({ radius, tint }: { radius: number; tint?: string }) {
  const material = useMemo(
    () => createCrystalMaterial(tint ? { rimColor: tint } : {}),
    [tint],
  )
  useEffect(() => () => material.dispose(), [material])
  return (
    <mesh material={material} renderOrder={-radius}>
      <sphereGeometry args={[radius, 96, 64]} />
    </mesh>
  )
}

export function CrystalShells() {
  const system = useCosmosStore((state) => state.system)
  const show = useCosmosStore((state) => state.toggles.shells)
  if (!show) return null
  return (
    <>
      {system.shells.map((shell) => (
        <CrystalShell key={shell.id} radius={shell.outerRadius} />
      ))}
      <CrystalShell radius={system.fixedStarsRadius} />
      <CrystalShell radius={system.primumMobileRadius} tint="#d9c9a0" />
    </>
  )
}
