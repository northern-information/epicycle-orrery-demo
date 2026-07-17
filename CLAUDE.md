# epicycle

Interactive 3D simulation of a physically real Ptolemaic cosmos. Personal
creative project — Discogs service standards (GraphQL/Kafka/Datadog) do not
apply; idiomatic React/TS does.

## Tech stack

- Vite + React 19 + TypeScript, react-three-fiber 9, drei 10, three 0.185
- leva (control panel), zustand (runtime state), vitest (sim tests)

## Commands

- `npm run dev` / `npm run test` / `npm run lint`, `npx tsc -b` to typecheck

## Layout

- `src/sim/` — pure TS math. Never import React or Three here; everything
  must stay unit-testable. Chains are closed-form in t (no integration).
- `src/state/store.ts` — zustand store + the mutable `clock` object
- `src/scene/` — R3F components; `src/ui/` — leva panel + HUD

## Key patterns

- `clock.days` is deliberately NOT in zustand. Per-frame code reads it (and
  the store, via `getState()`) inside `useFrame`; React never subscribes to
  either per frame. Follow `src/scene/SimulationDriver.tsx`.
- The cosmos is built in 2D sim coordinates (XY plane, rotations about
  local Z) inside one root group rotated -π/2 about X in
  `src/scene/Scene.tsx`. Add ecliptic-plane objects inside that group using
  sim coordinates directly.
- Chain angles and periods are PARENT-relative: an epicycle's `periodDays`
  is the historical anomaly/synodic period, not fixed-frame. The
  hidden-heliocentrism test in `src/sim/__tests__/retrograde.test.ts`
  asserts the resulting invariant — keep it green.

## Gotchas

- Dynamic lines (traces): plain `THREE.Line` with preallocated buffers and
  `setDrawRange`, per `src/scene/TraceLine.tsx`. drei `<Line>` rebuilds
  geometry on point changes — static rings only. All lines are 1px.
- `react-hooks/immutability` is disabled per-file where `useFrame` mutates
  Three.js objects — that's the R3F idiom, not a bug to fix.
- Crystal shells use fresnel-injected MeshPhysicalMaterial, never
  `transmission` (each transmissive surface re-renders the scene). Keep
  `renderOrder = -radius` so alpha blending sorts inside the nest.
- Shell radii are always derived from the live chains
  (`src/sim/shells.ts`, Planetary Hypotheses nesting) — never hardcode.
- Parameter changes must bump `traceVersion` (store actions do this) or
  stale traces persist.
- Dev console handle: `window.cosmos = { clock, store }`.
