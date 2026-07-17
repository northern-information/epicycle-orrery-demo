export function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 48, 48]} />
      <meshStandardMaterial color="#4a6a5a" roughness={0.7} metalness={0.1} />
    </mesh>
  )
}
