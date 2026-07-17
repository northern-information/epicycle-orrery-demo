import { useEffect, useState } from 'react'
import { MEAN_SOLAR_YEAR } from '../sim/presets/almagest'
import { clock, useCosmosStore } from '../state/store'

/**
 * Bottom-left overlay: the sim calendar and which wanderers are currently
 * retrograde. Polls the clock at 4 Hz — never per frame.
 */
export function Hud() {
  const [days, setDays] = useState(0)
  const retrogradeFlags = useCosmosStore((state) => state.retrogradeFlags)
  const planets = useCosmosStore((state) => state.system.planets)

  useEffect(() => {
    const id = window.setInterval(() => setDays(clock.days), 250)
    return () => window.clearInterval(id)
  }, [])

  const year = Math.floor(days / MEAN_SOLAR_YEAR) + 1
  const dayOfYear = Math.floor(days % MEAN_SOLAR_YEAR) + 1
  const retrogradePlanets = planets.filter((planet) => retrogradeFlags[planet.id])

  return (
    <div style={styles.hud}>
      <div style={styles.date}>
        anno {year} · dies {dayOfYear}
      </div>
      <div style={styles.retro}>
        {retrogradePlanets.length === 0 ? (
          <span style={styles.quiet}>all wanderers direct</span>
        ) : (
          retrogradePlanets.map((planet) => (
            <span key={planet.id} style={styles.badge}>
              <span style={{ ...styles.dot, background: planet.color }} />
              {planet.name} retrograde
            </span>
          ))
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  hud: {
    position: 'fixed',
    left: 16,
    bottom: 16,
    color: '#c8b98a',
    fontSize: 13,
    letterSpacing: '0.08em',
    pointerEvents: 'none',
    textShadow: '0 1px 4px #000',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  date: { opacity: 0.9 },
  retro: { display: 'flex', flexDirection: 'column', gap: 3 },
  quiet: { opacity: 0.45 },
  badge: { display: 'flex', alignItems: 'center', gap: 6, color: '#ff8a70' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
}
