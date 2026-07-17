import { Canvas } from '@react-three/fiber'
import { useCosmosStore } from '../state/store'
import { CameraRig } from './CameraRig'
import { CrystalShells } from './CrystalShell'
import { Earth } from './Earth'
import { Planet } from './Planet'
import { RetrogradeMonitor } from './RetrogradeMonitor'
import { SimulationDriver } from './SimulationDriver'
import { Starfield } from './Starfield'
import { TraceLine } from './TraceLine'
import { VelocityVector } from './VelocityVector'

export function Scene() {
  const system = useCosmosStore((state) => state.system)
  return (
    <Canvas camera={{ position: [0, 190, 240], fov: 45, near: 0.05, far: 2000 }}>
      <color attach="background" args={['#050508']} />
      <ambientLight intensity={0.35} color="#aabbdd" />
      <SimulationDriver />
      <RetrogradeMonitor />
      {/* the cosmos is built in XY sim coordinates, laid flat into the ecliptic */}
      <group rotation-x={-Math.PI / 2}>
        <Earth />
        {system.planets.map((planet) => (
          <Planet key={planet.id} planet={planet} />
        ))}
        {system.planets.map((planet) => (
          <TraceLine key={planet.id} planet={planet} />
        ))}
        {system.planets.map((planet) => (
          <VelocityVector key={planet.id} planet={planet} />
        ))}
        <CrystalShells />
        <Starfield />
      </group>
      <CameraRig />
    </Canvas>
  )
}
