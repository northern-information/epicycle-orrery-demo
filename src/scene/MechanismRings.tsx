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
  return <Line points={points} color={color} lineWidth={1} transparent opacity={opacity} />
}

/**
 * A brass arm from a rotation center to the joint it carries. Lives inside
 * the rotating group, so it visibly turns like clockwork. A screen-space
 * 1px line, not geometry, so it stays hairline at any zoom.
 */
export function Spoke({ length }: { length: number }) {
  return (
    <Line
      points={[
        [0, 0, 0],
        [length, 0, 0],
      ]}
      color={BRASS}
      lineWidth={1}
      transparent
      opacity={0.8}
    />
  )
}

/**
 * Graduation tick marks engraved just inside a ring, astronomical-clock
 * style: a mark every 5 degrees, a longer one every 30 (the zodiac signs).
 */
export function Ticks({ radius, color = BRASS }: { radius: number; color?: string }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let deg = 0; deg < 360; deg += 5) {
      const a = (deg / 180) * Math.PI
      const inner = deg % 30 === 0 ? radius * 0.965 : radius * 0.985
      pts.push([inner * Math.cos(a), inner * Math.sin(a), 0])
      pts.push([radius * Math.cos(a), radius * Math.sin(a), 0])
    }
    return pts
  }, [radius])
  return <Line points={points} segments color={color} lineWidth={1} transparent opacity={0.35} />
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
