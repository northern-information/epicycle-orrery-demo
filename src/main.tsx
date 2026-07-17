import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { clock, useCosmosStore } from './state/store'

if (import.meta.env.DEV) {
  Object.assign(window, { cosmos: { clock, store: useCosmosStore } })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
