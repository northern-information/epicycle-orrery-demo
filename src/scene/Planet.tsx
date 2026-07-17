import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group, MeshStandardMaterial } from 'three'
import { nodeAngle } from '../sim/chain'
import { isRetrograde } from '../sim/retrograde'
import type { PlanetConfig } from '../sim/types'
import { clock, useCosmosStore } from '../state/store'
import { Hub, Ring, Spoke } from './MechanismRings'

type GroupRefs = RefObject<(Group | null)[]>

/**
 * A planet as literal machinery: one nested group per chain node, each
 * rotating about its local Z at the node's parent-relative angle, with the
 * arm extending along local X. The scene graph nesting composes the angles
 * exactly as evaluateChain does.
 */
export function Planet({ planet }: { planet: PlanetConfig }) {
  const groupRefs = useRef<(Group | null)[]>([])
  useFrame(() => {
    planet.chain.forEach((node, i) => {
      const group = groupRefs.current[i]
      if (group) group.rotation.z = nodeAngle(node, clock.days)
    })
  })
  return <ChainLevel planet={planet} depth={0} refs={groupRefs} />
}

function ChainLevel({
  planet,
  depth,
  refs,
}: {
  planet: PlanetConfig
  depth: number
  refs: GroupRefs
}) {
  const toggles = useCosmosStore((state) => state.toggles)
  const node = planet.chain[depth]
  const isLast = depth === planet.chain.length - 1
  const showMechanism = depth === 0 ? toggles.deferents : toggles.epicycles
  return (
    <>
      {/* the circle is the joint's path: static at this level's anchor */}
      {showMechanism && <Ring radius={node.radius} />}
      {/* a bearing where this circle rides its parent arm; Earth is the hub at depth 0 */}
      {showMechanism && depth > 0 && <Hub size={Math.max(0.04, node.radius * 0.02)} />}
      <group
        ref={(group) => {
          refs.current[depth] = group
        }}
      >
        {showMechanism && <Spoke length={node.radius} />}
        <group position-x={node.radius}>
          {isLast ? (
            <PlanetBody planet={planet} />
          ) : (
            <ChainLevel planet={planet} depth={depth + 1} refs={refs} />
          )}
        </group>
      </group>
    </>
  )
}

function PlanetBody({ planet }: { planet: PlanetConfig }) {
  const isSun = planet.id === 'sun'
  const baseIntensity = isSun ? 1.5 : 0.15
  const materialRef = useRef<MeshStandardMaterial>(null)
  // ember pulse while retrograde; analytic check, no store involved
  useFrame(({ clock: frameClock }) => {
    const material = materialRef.current
    if (!material || isSun) return
    const highlight = useCosmosStore.getState().toggles.retrogradeHighlight
    if (highlight && isRetrograde(planet.chain, clock.days)) {
      material.emissiveIntensity = 0.7 + 0.35 * Math.sin(frameClock.elapsedTime * 5)
    } else {
      material.emissiveIntensity = baseIntensity
    }
  })
  return (
    <>
      <mesh>
        <sphereGeometry args={[planet.meshRadius, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={baseIntensity}
          roughness={0.5}
        />
      </mesh>
      {isSun && (
        <pointLight color="#ffd98a" intensity={4} distance={0} decay={0.35} />
      )}
    </>
  )
}
