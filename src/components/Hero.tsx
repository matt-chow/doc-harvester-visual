import { CLEAR, M, out } from '../timeline'
import { FIELDS, Invoice, INV_H, INV_W, SAMPLE, useLines, type Line } from './Invoice'
import { LAYOUT } from './Chrome'

/* The sample invoice stays in one place from step 1 to step 5 (a shared element); each step only
   adds or removes a flat overlay on it: page grid (2), OCR boxes (3), field highlights (4–5). */

export const HERO_S = 0.7
export const HERO_X = 96

/** Reading order (top-to-bottom, then left-to-right) of each line index. */
export const readingOrder = (lines: Line[]) => {
  const order = lines.map((l, i) => ({ l, i })).sort((a, b) => a.l.y - b.l.y || a.l.x - b.l.x)
  return new Map(order.map((o, r) => [o.i, r]))
}

function Overlay(l: Line, i: number, rank: Map<number, number>) {
  const a = 43 + rank.get(i)! * 0.12
  const f = l.field ? FIELDS.indexOf(l.field) : -1
  const inset = { left: -6, right: -6, top: -5, bottom: -5 }
  return (
    <>
      {/* step 3 · OCR: every line gets a box */}
      <M className="absolute" style={{ ...inset, border: '1.5px solid var(--color-ok)', background: 'rgb(16 124 16 / 0.07)' }} t={[a, a + 0.6, 58.6, 59.8]} o={[0, 1, 1, 0]} />
      {f >= 0 && (
        /* step 4 · Mistral: the four invoice fields */
        <M className="absolute" style={{ ...inset, border: '2px solid var(--color-blue)', background: 'rgb(0 120 212 / 0.1)' }} t={[63 + f * 1.2, 64 + f * 1.2]} o={[0, 1]}>
          <span className="absolute whitespace-nowrap" style={{ left: -2, bottom: 'calc(100% + 2px)', padding: '3px 6px', background: 'var(--color-blue)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 400, lineHeight: 1, letterSpacing: 0, textTransform: 'none' }}>
            {l.field}
          </span>
        </M>
      )}
    </>
  )
}

export function Hero() {
  const lines = useLines()
  const rank = readingOrder(lines)
  const label = { left: 0, top: INV_H * HERO_S + 12, fontSize: 16, color: 'var(--color-ink-2)' }
  return (
    <M className="absolute" style={{ left: HERO_X, top: LAYOUT.top, width: INV_W * HERO_S, height: INV_H * HERO_S }} t={[7.2, 8.6, ...CLEAR]} o={[0, 1, 1, 0]} y={[12, 0, 0, 0]} ease={out}>
      <div className="absolute" style={{ left: 0, top: 0, transform: `scale(${HERO_S})`, transformOrigin: '0 0' }}>
        <Invoice overlay={(l, i) => Overlay(l, i, rank)}>
          {/* step 2 · the page becomes an image */}
          <M
            className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(rgb(0 120 212 / .12) 1px, transparent 1px), linear-gradient(90deg, rgb(0 120 212 / .12) 1px, transparent 1px)', backgroundSize: '8px 8px' }}
            t={[25.6, 27, 38.4, 39.6]}
            o={[0, 1, 1, 0]}
          />
        </Invoice>
      </div>
      <M className="absolute" style={label} t={[24.6, 25.4]} o={[1, 0]}>
        {SAMPLE.invoice_number}.pdf
      </M>
      <M className="absolute" style={label} t={[25.4, 26.4]} o={[0, 1]}>
        page_01.png
      </M>
    </M>
  )
}
