import { HERO_S2 } from '../components/Hero'
import { fieldLine, FIELDS, lineStyle, measure, toStage, useLines, type Field, type Line } from '../components/Invoice'
import { useT } from '../i18n'
import { inOut, M, out, Stroke, Words } from '../timeline'

/* Scene 2 · From documents to structured data.
   render → OCR (every line, no meaning) → Mistral (four fields) → fields lift into a structure. */

const STEP_T = [
  { t: [9.8, 10.4, 12.2, 12.5, 21.0, 21.6], o: [0, 1, 1, 0.4, 0.4, 0] },
  { t: [9.92, 10.52, 11.9, 12.2, 14.6, 14.9, 21.0, 21.6], o: [0, 0.35, 0.35, 1, 1, 0.4, 0.4, 0] },
  { t: [10.04, 10.64, 14.3, 14.6, 21.0, 21.6], o: [0, 0.35, 0.35, 1, 1, 0] },
]

export const CARDS: Record<Field, { x: number; y: number; type: 'string' | 'date' | 'number' }> = {
  invoice_number: { x: 1004, y: 610, type: 'string' },
  invoice_date: { x: 1350, y: 610, type: 'date' },
  vendor_name: { x: 1004, y: 790, type: 'string' },
  total_amount: { x: 1350, y: 790, type: 'number' },
}
const CARD_W = 316
const CARD_H = 150

/** Scale that brings a field fragment to `px` type size without overflowing `maxW`. */
export const fit = (l: Line, px: number, maxW: number) => Math.min(px / l.size, maxW / measure(l))

/** A field fragment that leaves the page: same typography, scaled in place, then flown to its slot. */
export function Chip({ l, t, x, y, s, o }: { l: Line; t: number[]; x: number[]; y: number[]; s: number[]; o: number[] }) {
  return (
    <M className="absolute" style={{ left: 0, top: 0, transformOrigin: '0 0', padding: '4px 5px', borderRadius: 2 }} t={t} x={x} y={y} s={s} o={o} ease="smooth">
      <M className="absolute inset-0" style={{ borderRadius: 2, background: 'rgb(235 195 173 / 0.6)', border: '1px solid var(--color-terra)' }} t={[t[1], t[2], t[3] - 0.3, t[3]]} o={[1, 1, 1, 0]} />
      <M className="absolute inset-0" style={{ borderRadius: 2, boxShadow: '0 6px 14px -4px rgb(70 50 30 / .35)' }} t={[t[1], t[2], t[3] - 0.2, t[3]]} o={[0, 1, 1, 0]} />
      <span className="relative block" style={lineStyle(l)}>
        {l.text}
      </span>
    </M>
  )
}

export function S2Extraction() {
  const { cx, cy, s } = HERO_S2
  const tr = useT()
  const lines = useLines()
  return (
    <>
      <Words
        lines={tr.scene2.headline}
        at={9.2}
        end={20.9}
        step={0.07}
        className="absolute font-serif text-ink"
        style={{ left: 1000, top: 128, fontSize: 66, lineHeight: 1.05, letterSpacing: '-0.025em', fontWeight: 370 }}
      />

      {tr.scene2.steps.map((st, i) => (
        <M key={i} className="absolute flex gap-5" style={{ left: 1004, top: 336 + i * 74 }} t={STEP_T[i].t} o={STEP_T[i].o}>
          <span className="label text-terra" style={{ fontSize: 14, paddingTop: 5 }}>
            0{i + 1}
          </span>
          <div>
            <div className="font-sans text-ink" style={{ fontSize: 22, fontWeight: 560, letterSpacing: '-0.01em' }}>
              {st.title}
            </div>
            <div className="font-sans text-ink-2" style={{ fontSize: 17, marginTop: 2 }}>
              {st.desc}
            </div>
          </div>
        </M>
      ))}

      <svg className="absolute inset-0 overflow-visible" width={1920} height={1080}>
        {FIELDS.map((f, k) => {
          const l = fieldLine(lines, f)
          const L = 17.0 + k * 0.32
          const [sx, sy] = toStage(cx, cy, s, l.x + measure(l) + 5, l.y + l.size / 2)
          const c = CARDS[f]
          const [ex, ey] = [c.x, c.y + CARD_H / 2]
          return (
            <Stroke key={f} d={`M${sx} ${sy}C${sx + 160} ${sy} ${ex - 180} ${ey} ${ex} ${ey}`} dashed color="var(--color-terra)" width={1.3} t={[L + 0.45, L + 1.75, L + 2.3, L + 3.0]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
          )
        })}
      </svg>

      {FIELDS.map((f, k) => {
        const c = CARDS[f]
        const L = 17.0 + k * 0.32
        const arrive = L + 1.75
        return (
          <M key={f} className="absolute" style={{ left: c.x, top: c.y, width: CARD_W, height: CARD_H, borderRadius: 6, border: '1px solid var(--color-rule)', background: 'var(--color-sheet)' }} t={[arrive - 0.55, arrive + 0.1, 20.9, 21.6]} o={[0, 1, 1, 0]} s={[0.94, 1, 1, 0.98]} y={[0, 0, 0, -16]} ease={[out, inOut, inOut]}>
            <span className="label absolute text-terra whitespace-nowrap" style={{ left: 22, top: 20, fontSize: 13 }}>
              {tr.fields[f]}
            </span>
            <span className="label absolute whitespace-nowrap" style={{ left: 22, bottom: 18, fontSize: 11, textTransform: 'none', letterSpacing: '0.02em' }}>
              <span className="text-ink-2">{f}</span>
              <span className="text-ink-3"> · {tr.types[c.type]}</span>
            </span>
          </M>
        )
      })}

      {FIELDS.map((f, k) => {
        const l = fieldLine(lines, f)
        const L = 17.0 + k * 0.32
        const [sx, sy] = toStage(cx, cy, s, l.x - 5, l.y - 4)
        const c = CARDS[f]
        const ts = fit(l, 26, CARD_W - 54)
        const [tx, ty] = [c.x + 22 - 5 * ts, c.y + 58 - 4 * ts]
        return (
          <Chip
            key={f}
            l={l}
            t={[L - 0.05, L, L + 0.5, L + 1.8, 20.9, 21.6]}
            x={[sx, sx, sx - 4, tx, tx, tx]}
            y={[sy, sy, sy - 12, ty, ty, ty - 16]}
            s={[s, s, s * 1.08, ts, ts, ts]}
            o={[0, 1, 1, 1, 1, 0]}
          />
        )
      })}
    </>
  )
}
