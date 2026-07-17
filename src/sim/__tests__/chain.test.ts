import { describe, expect, it } from 'vitest'
import { TWO_PI, angularRate, apparentLongitude, evaluateChain } from '../chain'
import type { CircleNode } from '../types'

const circle = (over: Partial<CircleNode> = {}): CircleNode => ({
  radius: 10,
  periodDays: 100,
  direction: 1,
  phase0: 0,
  ...over,
})

describe('evaluateChain', () => {
  it('traces an exact circle for a single node', () => {
    const chain = [circle()]
    const quarter = evaluateChain(chain, 25)
    expect(quarter.position.x).toBeCloseTo(0, 10)
    expect(quarter.position.y).toBeCloseTo(10, 10)
    const full = evaluateChain(chain, 100)
    expect(full.position.x).toBeCloseTo(10, 10)
    expect(full.position.y).toBeCloseTo(0, 10)
  })

  it('respects phase and direction', () => {
    const chain = [circle({ direction: -1, phase0: Math.PI / 2 })]
    const start = evaluateChain(chain, 0)
    expect(start.position.y).toBeCloseTo(10, 10)
    const later = evaluateChain(chain, 25)
    expect(later.position.x).toBeCloseTo(10, 10)
    expect(later.position.y).toBeCloseTo(0, 10)
  })

  it('reports joints for every level of the chain', () => {
    const chain = [circle(), circle({ radius: 3, periodDays: 20 })]
    const sample = evaluateChain(chain, 7)
    expect(sample.joints).toHaveLength(2)
    const arm = {
      x: sample.position.x - sample.joints[0].x,
      y: sample.position.y - sample.joints[0].y,
    }
    expect(Math.hypot(arm.x, arm.y)).toBeCloseTo(3, 10)
    expect(sample.joints[1]).toEqual(sample.position)
  })

  it('analytic velocity matches central difference to 1e-6', () => {
    const chain = [
      circle({ radius: 51, periodDays: 686.98, phase0: 2.4 }),
      circle({ radius: 33.6, periodDays: 779.94, phase0: 5.0 }),
      circle({ radius: 4, periodDays: 88, direction: -1, phase0: 1.1 }),
    ]
    const h = 1e-4
    for (const t of [0, 123.4, 1000, 5432.1]) {
      const { velocity } = evaluateChain(chain, t)
      const before = evaluateChain(chain, t - h).position
      const after = evaluateChain(chain, t + h).position
      expect(velocity.x).toBeCloseTo((after.x - before.x) / (2 * h), 6)
      expect(velocity.y).toBeCloseTo((after.y - before.y) / (2 * h), 6)
    }
  })

  it('a counter-rotating second arm traces a perfect eccentric circle', () => {
    const period = 365.2568
    const chain = [
      circle({ radius: 16.77, periodDays: period }),
      circle({ radius: 0.7, periodDays: period, direction: -1, phase0: 1.14 }),
    ]
    const center = { x: 0.7 * Math.cos(1.14), y: 0.7 * Math.sin(1.14) }
    for (const t of [0, 50, 133, 300, 365]) {
      const { position } = evaluateChain(chain, t)
      const r = Math.hypot(position.x - center.x, position.y - center.y)
      expect(r).toBeCloseTo(16.77, 8)
    }
  })
})

describe('angular helpers', () => {
  it('angularRate is signed', () => {
    expect(angularRate(circle())).toBeCloseTo(TWO_PI / 100, 12)
    expect(angularRate(circle({ direction: -1 }))).toBeCloseTo(-TWO_PI / 100, 12)
  })

  it('apparentLongitude measures from positive x axis', () => {
    expect(apparentLongitude({ x: 1, y: 0 })).toBeCloseTo(0, 12)
    expect(apparentLongitude({ x: 0, y: 5 })).toBeCloseTo(Math.PI / 2, 12)
  })
})
