import { Scene } from './scene/Scene'
import { ControlPanel } from './ui/ControlPanel'
import { Hud } from './ui/Hud'
import { Introduction } from './ui/Introduction'

export default function App() {
  return (
    <>
      <ControlPanel />
      <Scene />
      <Hud />
      <Introduction />
    </>
  )
}
