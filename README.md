# epicycle

An interactive simulation of a physically real Ptolemaic cosmos.

Earth is fixed at the center. The planets are carried by literal celestial
machinery — brass deferents and epicycles turning inside nested crystalline
spheres — following the medieval synthesis of Ptolemy's orbital geometry and
Aristotle's solid spheres. Space is architecture, not emptiness.

## Running

```
npm install
npm run dev     # open the printed localhost URL
npm run test    # sim core tests (vitest)
```

## Controls

- **Orbit mode** — drag to orbit, scroll to zoom, right-drag to pan
- **Fly mode** — WASD to move, R/F for up/down, drag to look; speed scales
  with distance from Earth
- **C** — toggle orbit/fly
- The leva panel (top right) has play/pause, simulation speed, view toggles
  (deferents, epicycles, traces, velocity vectors, retrograde highlighting,
  crystal spheres), and every planet's radii, periods, and phases
- The HUD (bottom left) shows the simulation calendar and which wanderers
  are currently retrograde

## The model

Every body is a chain of uniformly rotating circles, evaluated in closed
form — position is the Fourier-like sum Σ rᵢ·û(Θᵢ) and velocity is its exact
analytic derivative, so retrograde detection (the sign of dλ/dt of apparent
geocentric longitude) has no sampling error.

Default parameters come from the Almagest: epicycle-to-deferent ratios
(Mars 39;30 → 0.6583, Venus 43;10 → 0.7194, …), zodiacal periods on the
deferents, synodic periods on the epicycles, and Mercury and Venus locked to
the mean Sun. The Sun itself uses a counter-rotating arm — Ptolemy's
eccentric via the Apollonius equivalence. Shell radii follow the *Planetary
Hypotheses* nesting principle: no wasted space, each sphere's outer surface
is the next sphere's inner surface.

Because the historical parameters encode the real synodic relations, the
right phenomena simply emerge: Mars turns retrograde roughly every 26
months for 60–80 days, Venus traces its five-petal rosette over eight
years, and the outer planets' epicycle arms all secretly point with the
mean Sun — the buried heliocentric truth of the system.

## A note on history

Ptolemy supplied a mathematical model; the literal solid crystalline
spheres come from Aristotle and the medieval commentators. This project
deliberately builds the **medieval synthesis** — Ptolemaic geometry inside
Aristotelian machinery — because the premise is a universe where the model
is physically true.

## Vocabulary

| Term | Meaning |
| --- | --- |
| deferent | large circle centered (nearly) on Earth |
| epicycle | smaller circle riding the deferent; the planet rides it |
| retrograde | apparent reversal of a planet's motion seen from Earth |
| eccentric | circle whose center is offset from Earth (the Sun's device) |
| aether / quintessence | the fifth element filling the heavens |
| celestial spheres | transparent nested shells carrying the bodies |
| sphere of the fixed stars | the eighth sphere, stars embedded in it |
| Primum Mobile | outermost moving sphere, driving all within |
| Empyrean | the realm beyond the physical universe |

## Speculative roadmap

The spheres are so far surfaces; the notes this project grew from imagine
them as objects. Ideas, roughly in order:

- shell thickness — render inner and outer surfaces, machinery between
- visible bearings, seams, and gearing where sphere drives sphere
- each sphere its own physical laws; no vacuum, aether filling all
- the Empyrean: something beyond the Primum Mobile

## Layout

```
src/sim/     pure TypeScript math — chains, retrograde, shells, presets
src/state/   zustand store (+ the mutable per-frame clock)
src/scene/   react-three-fiber components
src/ui/      leva control panel and HUD
```
