import type { CSSProperties } from 'react'
import { inOut, linear, M, out, Stroke, Words } from '../timeline'
import { MISTRAL_R } from './S3Intelligence'

/* 35–47s · Teaching smaller models to understand more.
   examples → Mistral drafts candidate labels → people review & correct → curated dataset → LayoutLMv3 (offline). */

const Y = 600
const STATIONS = [
  { x: 250, label: 'Examples' },
  { x: 560, label: 'Mistral drafts' },
  { x: 860, label: 'Candidate labels' },
  { x: 1160, label: 'Human review' },
  { x: 1460, label: 'Curated dataset' },
  { x: 1740, label: 'LayoutLMv3' },
]
const DW = 170
const DH = 222
const fade: number[] = [46.5, 47.2]

/** The Mistral node: escalation target in scene 3, annotation drafter in scene 4. */
export function MistralNode() {
  return (
    <M className="absolute flex flex-col justify-center" style={{ left: -107, top: -37, width: 214, height: 74, padding: '0 18px', borderRadius: 8, background: 'var(--color-sheet)', border: '1.5px solid var(--color-terra)' }} t={[28.6, 29.2, 34.2, 35.6, 38.0, 38.35, 38.8, 46.5, 47.2]} x={[MISTRAL_R.x, MISTRAL_R.x, MISTRAL_R.x, 560, 560, 560, 560, 560, 560]} y={[MISTRAL_R.y + 14, MISTRAL_R.y, MISTRAL_R.y, Y, Y, Y, Y, Y, Y]} s={[1, 1, 1, 1.1, 1.1, 1.18, 1.1, 1.1, 1.1]} o={[0, 1, 1, 1, 1, 1, 1, 1, 0]}>
      <span className="font-sans text-ink" style={{ fontSize: 19, fontWeight: 580, letterSpacing: '-0.01em' }}>
        Mistral
      </span>
      <span className="relative label" style={{ fontSize: 11, marginTop: 4, height: 13, letterSpacing: '0.05em', color: 'var(--color-terra)' }}>
        <M as="span" className="absolute left-0 top-0 whitespace-nowrap" t={[34.2, 34.7]} o={[1, 0]}>
          difficult cases
        </M>
        <M as="span" className="absolute left-0 top-0 whitespace-nowrap" t={[34.9, 35.5]} o={[0, 1]}>
          drafts candidate labels
        </M>
      </span>
    </M>
  )
}

const bar = (x: number, y: number, w: number, c = 'var(--color-rule)'): CSSProperties => ({ position: 'absolute', left: x, top: y, width: w, height: 6, borderRadius: 6, background: c })

// field boxes on the training document (local coords)
const BOXES = [
  { k: 'date', x: 13, y: 35, w: 66, check: 42.0 },
  { k: 'client', x: 13, y: 65, w: 74, check: 42.3 },
  { k: 'recipient', x: 95, y: 65, w: 62, check: 42.6 },
  { k: 'amount', x: 95, y: 155, w: 62, check: 43.6 },
]

function TrainDoc({ front }: { front?: boolean }) {
  return (
    <div className="sheet absolute overflow-hidden" style={{ width: DW, height: DH, borderRadius: 3 }}>
      <div style={bar(17, 14, 64, 'var(--color-ink)')} />
      <div style={bar(17, 39, 58)} />
      <div style={bar(17, 69, 66, 'var(--color-ink-3)')} />
      <div style={bar(99, 69, 54, 'var(--color-ink-3)')} />
      {[104, 120, 136].map((y) => (
        <div key={y} style={bar(17, y, 136)} />
      ))}
      <div style={bar(99, 159, 54)} />
      <div style={bar(99, 179, 54, 'var(--color-ink)')} />
      {BOXES.map((b, i) => {
        const a = 39.7 + i * 0.18
        const wrong = b.k === 'amount'
        const box: CSSProperties = { position: 'absolute', left: b.x, top: b.y, width: b.w, height: 14, borderRadius: 2 }
        return (
          <div key={b.k}>
            <M style={{ ...box, border: '1.3px dashed var(--color-terra)', background: 'rgb(235 195 173 / .35)' }} t={front ? [a, a + 0.35, b.check, b.check + 0.25, ...fade] : [a, a + 0.35, ...fade]} o={front ? [0, 1, 1, 0, 0, 0] : [0, 1, 1, 0]} s={front ? [1.3, 1, 1, 1, 1, 1] : [1.3, 1, 1, 1]} ease={out} />
            {front && (
              <M style={{ ...box, border: '1.3px solid var(--color-sage)', background: 'rgb(205 219 201 / .55)' }} t={[b.check - 0.05, b.check + 0.25, ...fade]} o={[0, 1, 1, 0]} />
            )}
            {front && wrong && (
              /* the reviewer moves the misplaced label from the subtotal to the total */
              <M style={{ ...box, border: '1.3px dashed var(--color-terra)', background: 'rgb(235 195 173 / .35)' }} t={[43.0, 43.1, 43.5, 43.65]} y={[0, 0, 20, 20]} o={[0, 1, 1, 0]} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Mark({ x, y, at, ok }: { x: number; y: number; at: number; ok: boolean }) {
  return (
    <M className="absolute grid place-items-center rounded-full font-sans text-white" style={{ left: x, top: y, width: 16, height: 16, fontSize: 10, fontWeight: 700, background: ok ? 'var(--color-sage)' : 'var(--color-terra)' }} t={ok ? [at, at + 0.25, ...fade] : [at, at + 0.2, at + 0.45, at + 0.6]} o={[0, 1, 1, 0]} s={[0.5, 1, 1, 1]} ease={out}>
      {ok ? '✓' : '×'}
    </M>
  )
}

// group centre path: examples → into Mistral → out as candidates → review → dataset
const G = {
  t: [36.0, 36.6, 37.2, 38.0, 38.6, 38.75, 39.6, 40.9, 41.9, 43.9, 44.4, 44.9],
  x: [250, 250, 250, 470, 560, 560, 860, 860, 1160, 1160, 1360, 1460],
  y: [620, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y],
  s: [0.96, 1, 1, 0.7, 0.3, 0.3, 1, 1, 1.35, 1.35, 0.95, 0.6],
  o: [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0],
}

const NET = [4, 5, 3]
const netPts = NET.map((n, c) => Array.from({ length: n }, (_, i) => [1660 + c * 80, Y + 18 + (i - (n - 1) / 2) * 22] as const))
const netD = netPts.slice(0, -1).flatMap((col, c) => col.flatMap(([x0, y0]) => netPts[c + 1].map(([x1, y1]) => `M${x0} ${y0}L${x1} ${y1}`))).join('')

export function S4Research() {
  return (
    <>
      <Words
        lines={['Teaching smaller models', 'to understand more.']}
        at={35.2}
        end={46.4}
        step={0.06}
        className="absolute font-serif text-ink"
        style={{ left: 116, top: 108, fontSize: 60, lineHeight: 1.06, letterSpacing: '-0.025em', fontWeight: 370 }}
      />

      {/* process axis */}
      <svg className="absolute inset-0 overflow-visible" width={1920} height={1080}>
        <Stroke d="M160 880H1830" t={[35.6, 36.9, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} color="var(--color-rule)" width={1.5} />
      </svg>
      {STATIONS.map((st, i) => (
        <M key={i} className="absolute" style={{ left: st.x - 90, top: 874, width: 180 }} t={[35.9 + i * 0.15, 36.4 + i * 0.15, ...fade]} o={[0, 1, 1, 0]} y={[8, 0, 0, 0]} ease={[out, inOut, inOut]}>
          <div className="mx-auto rounded-full" style={{ width: 11, height: 11, background: 'var(--color-paper)', border: '1.5px solid var(--color-ink-3)' }} />
          <div className="label text-ink-2 text-center" style={{ fontSize: 11, marginTop: 12 }}>
            <span className="text-terra">0{i + 1}</span> {st.label}
          </div>
        </M>
      ))}
      <M className="absolute rounded-full" style={{ left: -5.5, top: 874, width: 11, height: 11, background: 'var(--color-terra)' }} t={[36.6, 37.0, 38.6, 39.6, 41.0, 41.9, 44.2, 44.9, 45.6, 46.2, ...fade]} x={[250, 250, 560, 860, 860, 1160, 1160, 1460, 1460, 1740, 1740, 1740]} o={[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]} />

      {/* the document group, duplicated into three examples */}
      <M className="absolute" style={{ left: -DW / 2, top: -DH / 2, width: DW, height: DH }} t={G.t} x={G.x} y={G.y} s={G.s} o={G.o}>
        {[2, 1].map((k) => (
          <M key={k} className="absolute" t={[37.0 + (k - 1) * 0.15, 37.8 + (k - 1) * 0.15]} x={[0, -18 * k]} y={[0, -16 * k]} rot={[0, -3.5 * k]} ease={inOut}>
            <TrainDoc />
          </M>
        ))}
        <TrainDoc front />
        {BOXES.map((b) => (
          <Mark key={b.k} x={b.x + b.w + 3} y={b.y + (b.k === 'amount' ? 20 : 0) - 1} at={b.check} ok />
        ))}
        <Mark x={95 + 62 + 3} y={154} at={42.85} ok={false} />
      </M>

      {/* reviewer */}
      <M className="absolute flex items-center gap-4" style={{ left: 1160 - 150, top: 330 }} t={[40.6, 41.3, 44.0, 44.6]} o={[0, 1, 1, 0]} y={[12, 0, 0, -8]} ease={[out, inOut, inOut]}>
        <svg width={44} height={44} viewBox="0 0 44 44">
          <circle cx={22} cy={22} r={21} fill="var(--color-sheet)" stroke="var(--color-ink)" strokeWidth={1.4} />
          <circle cx={22} cy={17} r={6.5} fill="none" stroke="var(--color-ink)" strokeWidth={1.4} />
          <path d="M10 35c2.5-6 7-9 12-9s9.5 3 12 9" fill="none" stroke="var(--color-ink)" strokeWidth={1.4} />
        </svg>
        <div>
          <div className="font-serif text-ink" style={{ fontSize: 26 }}>
            Human review
          </div>
          <div className="label text-ink-2" style={{ fontSize: 11, marginTop: 2 }}>
            accept · correct · reject
          </div>
        </div>
      </M>

      {/* curated dataset: 3 documents × 4 fields, then converging into the model */}
      {Array.from({ length: 12 }, (_, idx) => {
        const col = idx % 3
        const row = Math.floor(idx / 3)
        const gx = 1460 + (col - 1) * 84
        const gy = Y + (row - 1.5) * 44
        const a = 44.4 + idx * 0.05
        const c = 45.3 + idx * 0.06
        return (
          <M key={idx} className="absolute label grid place-items-center" style={{ left: -37, top: -17, width: 74, height: 34, fontSize: 10, borderRadius: 4, background: 'var(--color-sage-soft)', border: '1px solid var(--color-sage)', color: 'var(--color-ink)' }} t={[a, a + 0.6, c, c + 0.7]} x={[1460, gx, gx, 1740]} y={[Y, gy, gy, Y]} s={[0.4, 1, 1, 0.2]} o={[0, 1, 1, 0]}>
            {BOXES[row].k}
          </M>
        )
      })}

      <M className="absolute" style={{ left: 1740 - 125, top: Y - 100, width: 250, height: 212, borderRadius: 10, border: '1.5px solid var(--color-ink)', background: 'var(--color-sheet)' }} t={[44.7, 45.3, ...fade]} o={[0, 1, 1, 0]} s={[0.92, 1, 1, 1]} ease={[out, inOut, inOut]}>
        <div className="font-sans text-ink" style={{ position: 'absolute', left: 20, top: 16, fontSize: 19, fontWeight: 580 }}>
          LayoutLMv3
        </div>
        <div className="label text-ink-2" style={{ position: 'absolute', left: 20, bottom: 14, fontSize: 10 }}>
          trained &amp; evaluated offline
        </div>
      </M>
      <svg className="absolute inset-0 overflow-visible pointer-events-none" width={1920} height={1080}>
        {netPts.flat().map(([x, y], i) => (
          <M key={i} as="circle" cx={x} cy={y} r={4} fill={i % 4 === 1 ? 'var(--color-terra)' : 'var(--color-ink)'} t={[45.2 + i * 0.04, 45.5 + i * 0.04, ...fade]} o={[0, 1, 1, 0]} />
        ))}
        <Stroke d={netD} t={[45.4, 46.3, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} color="var(--color-ink-3)" width={0.8} ease={linear} />
      </svg>

      <M className="absolute font-sans text-ink-2" style={{ left: 120, top: 966, fontSize: 16 }} t={[43.9, 44.5, ...fade]} o={[0, 1, 1, 0]}>
        Only reviewed labels become training data. Training happens offline — not during live requests.
      </M>
    </>
  )
}
