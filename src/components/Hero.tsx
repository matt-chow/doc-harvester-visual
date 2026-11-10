import { M, out } from '../timeline'
import { useT } from '../i18n'
import { FIELDS, Invoice, INV_H, INV_W, SAMPLE, useLines, type Line } from './Invoice'

/* The invoice is one continuous object for the whole film:
   dot → collection → page under analysis → pipeline input → JSON source → graph centre → dot. */

// time, centre x, centre y, scale, rotation, opacity
const K: [number, number, number, number, number, number][] = [
  [0, 1380, 560, 0.03, 0, 0],
  [0.45, 1380, 560, 0.03, 0, 0],
  [1.9, 1380, 560, 0.62, -2, 1],
  [5.4, 1372, 556, 0.625, -1.4, 1],
  [7.0, 1380, 560, 0.66, 0, 1],
  [8.7, 560, 580, 1.12, 0, 1],
  [21.0, 560, 580, 1.12, 0, 1],
  [22.7, 180, 380, 0.09, 0, 1],
  [34.0, 180, 380, 0.09, 0, 1],
  [34.8, 180, 380, 0.09, 0, 0],
  [46.8, 290, 610, 0.78, -5, 0],
  [48.2, 480, 600, 0.78, 0, 1],
  [51.8, 480, 600, 0.78, 0, 1],
  [53.2, 1380, 560, 0.16, 0, 1],
  [58.6, 1380, 560, 0.16, 0, 1],
  [59.5, 1380, 560, 0.03, 0, 0],
  [60, 1380, 560, 0.03, 0, 0],
]
const col = (i: number) => K.map((k) => k[i])

export const HERO_S2 = { cx: 560, cy: 580, s: 1.12 }
export const HERO_S5 = { cx: 480, cy: 600, s: 0.78 }

// OCR boxes sweep top-to-bottom in reading order
const ranks = (lines: Line[]) => {
  const order = lines.map((l, i) => ({ l, i })).sort((a, b) => a.l.y - b.l.y || a.l.x - b.l.x)
  return new Map(order.map((o, r) => [o.i, r]))
}

function Boxes(l: Line, i: number, rank: Map<number, number>) {
  const a = 12.4 + rank.get(i)! * 0.045
  const f = l.field ? FIELDS.indexOf(l.field) : -1
  const box = 'absolute pointer-events-none'
  const inset = { left: -5, right: -5, top: -4, bottom: -4, borderRadius: 2 }
  return (
    <>
      {/* 02 · OCR: every line gets a box — recognition without meaning */}
      <M
        className={box}
        style={{ ...inset, border: '1px solid var(--color-sage)', background: 'rgb(205 219 201 / 0.35)' }}
        t={f < 0 ? [a, a + 0.35, 14.8, 15.4, 21, 21.6] : [a, a + 0.35, 14.9, 15.3]}
        o={f < 0 ? [0, 1, 1, 0.28, 0.28, 0] : [0, 1, 1, 0]}
        s={f < 0 ? [1.15, 1, 1, 1, 1, 1] : [1.15, 1, 1, 1]}
        ease={out}
      />
      {f >= 0 && (
        <>
          {/* 03 · Mistral: only the meaningful fields are interpreted */}
          <M
            className={box}
            style={{ ...inset, border: '1.4px solid var(--color-terra)', background: 'rgb(235 195 173 / 0.45)' }}
            t={[14.9 + f * 0.22, 15.4 + f * 0.22, 21, 21.6, 48.1 + f * 0.14, 48.6 + f * 0.14, 51.8, 52.4]}
            o={[0, 1, 1, 0, 0, 1, 1, 0]}
            ease={out}
          />
          <M
            className="absolute label whitespace-nowrap"
            style={{ left: -5, bottom: 'calc(100% + 8px)', fontSize: 9, padding: '3px 5px 2px', borderRadius: 2, background: 'var(--color-terra)', color: '#fff', lineHeight: 1, letterSpacing: '0.04em', textTransform: 'none', fontWeight: 500 }}
            t={[15.1 + f * 0.22, 15.6 + f * 0.22, 21, 21.5]}
            o={[0, 1, 1, 0]}
            y={[6, 0, 0, 0]}
            ease={out}
          >
            {l.field}
          </M>
        </>
      )}
    </>
  )
}

export function Hero() {
  const tr = useT()
  const rank = ranks(useLines())
  return (
    <M className="absolute" style={{ left: -INV_W / 2, top: -INV_H / 2, width: INV_W, height: INV_H }} t={col(0)} x={col(1)} y={col(2)} s={col(3)} rot={col(4)} o={col(5)}>
      <Invoice overlay={(l, i) => Boxes(l, i, rank)}>
        {/* 01 · render: the page becomes pixels */}
        <M
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgb(31 29 26 / .09) 1px, transparent 1px), linear-gradient(90deg, rgb(31 29 26 / .09) 1px, transparent 1px)', backgroundSize: '7px 7px' }}
          t={[10.5, 11.6, 12.6, 13.6]}
          o={[0, 1, 1, 0]}
        />
        <M className="absolute left-0 right-0" style={{ top: -60, height: 60, background: 'linear-gradient(transparent, rgb(200 100 59 / .14))', borderBottom: '2px solid var(--color-terra)' }} t={[10.5, 10.7, 12.0, 12.2]} y={[0, 0, INV_H + 60, INV_H + 60]} o={[0, 1, 1, 0]} />
      </Invoice>
      <M className="absolute label" style={{ left: 0, top: -34, fontSize: 12, color: 'var(--color-ink-3)' }} t={[10.6, 11.0, 12.2, 12.6]} o={[0, 1, 1, 0]}>
        page_01.png
      </M>
      {/* selection brackets for the end of scene 1 */}
      <M as="svg" className="absolute overflow-visible" style={{ left: -24, top: -24 }} width={INV_W + 48} height={INV_H + 48} t={[5.5, 6.4, 7.8, 8.5]} o={[0, 1, 1, 0]} s={[1.06, 1, 1, 1]} ease={out}>
        {[
          [0, 0, 1, 1],
          [INV_W + 48, 0, -1, 1],
          [0, INV_H + 48, 1, -1],
          [INV_W + 48, INV_H + 48, -1, -1],
        ].map(([x, y, dx, dy], i) => (
          <path key={i} d={`M${x} ${y + dy * 48}V${y}H${x + dx * 48}`} fill="none" stroke="var(--color-terra)" strokeWidth={3.2} />
        ))}
      </M>
      <M className="absolute label whitespace-nowrap" style={{ left: -24, top: -70, fontSize: 19, color: 'var(--color-terra)' }} t={[5.8, 6.5, 7.8, 8.3]} o={[0, 1, 1, 0]} x={[-10, 0, 0, 0]} ease={out}>
        {tr.scene1.selected} · {SAMPLE.invoice_number}.pdf
      </M>
    </M>
  )
}

/** The loop seam: the graph collapses into this dot, and the next loop's invoice grows from it. */
export function Dot() {
  return (
    <M
      className="absolute rounded-full"
      style={{ left: 1380 - 12, top: 560 - 12, width: 24, height: 24, background: 'var(--color-terra)' }}
      t={[0, 0.45, 1.2, 59.3, 59.75, 60]}
      o={[1, 1, 0, 0, 1, 1]}
      s={[1, 1, 2.4, 0.6, 1, 1]}
    />
  )
}
