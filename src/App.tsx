import { Scene } from './scene/Scene'
import { ControlPanel } from './ui/ControlPanel'
import { Hud } from './ui/Hud'

export default function App() {
  return (
    <>
      <ControlPanel />
      <Scene />
      <Hud />
    </>
  )
}
