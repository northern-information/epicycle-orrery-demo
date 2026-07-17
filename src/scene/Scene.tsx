import { Environment, Lightformer } from '@react-three/drei'
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
      <ambientLight intensity={0.25} color="#aabbdd" />
      {/* warm rectangles for the brass and crystal to reflect; no HDRI file */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={1.6}
          color="#ffdfb0"
          position={[0, 40, 0]}
          rotation-x={Math.PI / 2}
          scale={[60, 60, 1]}
        />
        <Lightformer intensity={0.9} color="#ffc880" position={[40, 12, 25]} scale={[30, 30, 1]} />
        <Lightformer
          intensity={0.35}
          color="#8aa8d0"
          position={[-40, -12, -25]}
          scale={[40, 40, 1]}
        />
      </Environment>
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
