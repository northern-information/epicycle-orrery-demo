import { useEffect, useId, useRef, useState } from 'react'
import styles from './Introduction.module.css'

const DISMISSED_KEY = 'epicycle:intro-dismissed'

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed(dismissed: boolean) {
  try {
    if (dismissed) window.localStorage.setItem(DISMISSED_KEY, '1')
    else window.localStorage.removeItem(DISMISSED_KEY)
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the
    // panel just reopens on the next visit.
  }
}

/**
 * Left-side introduction: who Ptolemy was, what epicycles are, and how
 * faithful this simulation is. Non-modal so the scene stays interactive;
 * dismissal is remembered per browser.
 */
export function Introduction() {
  const [open, setOpen] = useState(() => !readDismissed())
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef<HTMLButtonElement>(null)
  const hasToggled = useRef(false)

  useEffect(() => {
    // Move focus with the toggle, but not on first load: stealing focus
    // from the canvas on page load would be surprising.
    if (!hasToggled.current) return
    if (open) closeRef.current?.focus()
    else openRef.current?.focus()
  }, [open])

  const toggle = (next: boolean) => {
    hasToggled.current = true
    writeDismissed(!next)
    setOpen(next)
  }

  if (!open) {
    return (
      <button
        ref={openRef}
        type="button"
        className={styles.reopen}
        onClick={() => toggle(true)}
      >
        About This Cosmos
      </button>
    )
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={styles.panel}
      onKeyDown={(event) => {
        if (event.key === 'Escape') toggle(false)
      }}
    >
      <header className={styles.header}>
        <h1 id={titleId} className={styles.title}>
          A Ptolemaic Cosmos
        </h1>
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={() => toggle(false)}
          aria-label="Close the introduction"
        >
          ×
        </button>
      </header>

      <div className={styles.body}>
        <p className={styles.lede}>
          For about fourteen centuries, educated people in Europe, the Middle East, and North
          Africa understood the heavens through this machine. Earth sits still at the center;
          everything else turns around it.
        </p>

        <h2 className={styles.heading}>Who Was Ptolemy?</h2>
        <p>
          Claudius Ptolemy was a Greek-speaking astronomer and mathematician who worked in
          Alexandria, in Roman Egypt, in the second century CE. Around 150 CE he wrote the{' '}
          <em>Almagest</em>, a complete mathematical account of the motions of the Sun, Moon, and
          the five planets visible to the naked eye. It built on earlier work by Apollonius of
          Perga and Hipparchus, and it remained the standard reference until Copernicus published
          his Sun-centered system in 1543.
        </p>

        <h2 className={styles.heading}>What Is an Epicycle?</h2>
        <p>
          Watch Mars over a few months and it drifts eastward against the stars, then stops,
          backs up westward for weeks, stops again, and resumes. This backward loop is called{' '}
          <strong>retrograde motion</strong>. A planet riding a single circle around Earth cannot
          do that.
        </p>
        <p>
          The fix is a circle riding on a circle. A large circle around Earth, the{' '}
          <strong>deferent</strong>, carries the center of a smaller one, the{' '}
          <strong>epicycle</strong>. The planet rides the epicycle. When its motion around the
          small circle runs against the deferent's motion fast enough, the planet appears to
          move backward. Turn on orbit traces in the control panel to watch the loops form.
        </p>

        <h2 className={styles.heading}>How People Thought It Worked</h2>
        <p>
          Ptolemy mostly presented his circles as a calculating tool. Later readers, following
          Aristotle, took them as physical objects: nested, transparent spheres of a fifth
          element, the aether, each carrying a planet's machinery and fitted snugly inside the
          next. In his <em>Planetary Hypotheses</em> Ptolemy himself nested the spheres with no
          gaps, which let him estimate the distance to every planet and to the sphere of the stars.
        </p>
        <p>
          This simulation builds that medieval picture literally: brass deferents and epicycles
          turning inside crystal shells, ordered Moon, Mercury, Venus, Sun, Mars, Jupiter,
          Saturn, with the fixed stars beyond.
        </p>

        <h2 className={styles.heading}>How Accurate Is This Model?</h2>
        <p>
          <strong>The behavior is right.</strong> Epicycle sizes and periods come from the{' '}
          <em>Almagest</em>, so retrograde loops arrive on schedule: Mars reverses about every 26
          months for 60 to 80 days, and Venus traces its five-petaled pattern over eight years.
          The outer planets' epicycle arms also stay parallel to the line from Earth to the Sun,
          a clue to the Sun-centered system hidden inside the geometry.
        </p>
        <p>
          <strong>The positions are not.</strong> This is a simplified Ptolemy. It leaves out the
          offset circles and the <em>equant</em>, a point off-center around which Ptolemy made
          the motion uniform. Those devices stood in for the fact that real orbits are ellipses
          traveled at changing speeds. Without them, a planet like Mars, whose orbit is the most
          stretched of the five, can be off by roughly 10 degrees. Starting positions are chosen
          for clarity rather than fitted to a date, and distances follow the nesting scheme, not
          real space.
        </p>
        <p>
          Ptolemy's full model did much better, often within about a degree, which is why it
          lasted so long. Kepler's elliptical orbits, published in 1609, finally explained
          what the epicycles had been approximating.
        </p>

        <p className={styles.hint}>
          Drag to orbit, scroll to zoom, press C to fly. The panel on the right controls speed,
          views, and every planet's circles.
        </p>
      </div>
    </section>
  )
}
