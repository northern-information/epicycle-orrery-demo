import { Line } from '@react-three/drei'
import { useMemo } from 'react'

export const BRASS = '#b08d3f'

/** An engraved circle: the path a joint travels, drawn as a brass line. */
export function Ring({
  radius,
  color = BRASS,
  opacity = 0.55,
  segments = 128,
}: {
  radius: number
  color?: string
  opacity?: number
  segments?: number
}) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2
      pts.push([radius * Math.cos(a), radius * Math.sin(a), 0])
    }
    return pts
  }, [radius, segments])
  return <Line points={points} color={color} lineWidth={1.5} transparent opacity={opacity} />
}

/**
 * A brass arm from a rotation center to the joint it carries. Lives inside
 * the rotating group, so it visibly turns like clockwork.
 */
export function Spoke({ length }: { length: number }) {
  const thickness = Math.max(0.02, length * 0.004)
  return (
    <mesh position-x={length / 2} rotation-z={Math.PI / 2}>
      <cylinderGeometry args={[thickness, thickness, length, 8]} />
      <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.35} />
    </mesh>
  )
}

/** The hub bearing at a rotation center. */
export function Hub({ size }: { size: number }) {
  return (
    <mesh>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.3} />
    </mesh>
  )
}
