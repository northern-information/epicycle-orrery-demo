import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group } from 'three'
import { nodeAngle } from '../sim/chain'
import type { PlanetConfig } from '../sim/types'
import { clock } from '../state/store'

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
  const node = planet.chain[depth]
  const isLast = depth === planet.chain.length - 1
  return (
    <group
      ref={(group) => {
        refs.current[depth] = group
      }}
    >
      <group position-x={node.radius}>
        {isLast ? (
          <PlanetBody planet={planet} />
        ) : (
          <ChainLevel planet={planet} depth={depth + 1} refs={refs} />
        )}
      </group>
    </group>
  )
}

function PlanetBody({ planet }: { planet: PlanetConfig }) {
  const isSun = planet.id === 'sun'
  return (
    <>
      <mesh>
        <sphereGeometry args={[planet.meshRadius, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={isSun ? 1.5 : 0.15}
          roughness={0.5}
        />
      </mesh>
      {isSun && (
        <pointLight color="#ffd98a" intensity={4} distance={0} decay={0.35} />
      )}
    </>
  )
}
