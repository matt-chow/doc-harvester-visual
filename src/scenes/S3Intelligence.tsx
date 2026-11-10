import type { ReactNode } from 'react'
import { Glyph } from '../components/Invoice'
import { inOut, linear, M, out, Stroke, Words } from '../timeline'

/* 22–35s · Not every document needs the same level of intelligence.
   Top lane: the established pipeline (solid). Below: the research direction (dashed, sage),
   with one clean document passing the checks and one uncertain document escalated to Mistral. */

const LANE_Y = 380
const LANE = [
  { x: 480, title: 'Storage', sub: 'Azure Blob · local' },
  { x: 780, title: 'Page images', sub: 'PDF → image' },
  { x: 1080, title: 'Tesseract OCR', sub: 'text recognition' },
  { x: 1380, title: 'Mistral', sub: 'structured extraction' },
  { x: 1680, title: 'JSON API', sub: 'FastAPI response' },
]
const NW = 214
const NH = 74
const GATE = { x: 1420, y: 765, r: 62 }
const OUT = { x: 1730, y: 650 }
export const MISTRAL_R = { x: 1730, y: 880 }

type P = [number, number]
const bez = (a: P, b: P, c: P, d: P, n = 6): P[] =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / n
    const u = 1 - t
    return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]
  })

const PASS: [P, P, P, P] = [[GATE.x + GATE.r, GATE.y], [1550, GATE.y], [1550, OUT.y], [OUT.x - NW / 2, OUT.y]]
const ESC: [P, P, P, P] = [[GATE.x + GATE.r, GATE.y], [1550, GATE.y], [1550, MISTRAL_R.y], [MISTRAL_R.x - NW / 2, MISTRAL_R.y]]
const d = (p: [P, P, P, P]) => `M${p[0]}C${p[1]} ${p[2]} ${p[3]}`

function Node({ x, y, title, sub, at, accent = 'var(--color-ink)', dashed }: { x: number; y: number; title: string; sub: string; at: number; accent?: string; dashed?: boolean }) {
  return (
    <M className="absolute flex flex-col justify-center" style={{ left: x - NW / 2, top: y - NH / 2, width: NW, height: NH, padding: '0 18px', borderRadius: 8, background: 'var(--color-sheet)', border: `1.5px ${dashed ? 'dashed' : 'solid'} ${accent}` }} t={[at, at + 0.6, 34.0, 34.6]} o={[0, 1, 1, 0]} y={[14, 0, 0, 0]} ease={[out, inOut, inOut]}>
      <span className="font-sans text-ink" style={{ fontSize: 19, fontWeight: 580, letterSpacing: '-0.01em' }}>
        {title}
      </span>
      <span className="label text-ink-2" style={{ fontSize: 11, marginTop: 4, letterSpacing: '0.05em' }}>
        {sub}
      </span>
    </M>
  )
}

/** A document token following a list of waypoints, one per time. */
function Token({ path, times, children }: { path: P[]; times: number[]; children: ReactNode }) {
  const t = [times[0] - 0.2, ...times, times[times.length - 1] + 0.25]
  const pts = [path[0], ...path, path[path.length - 1]]
  return (
    <M className="absolute" style={{ left: -13, top: -17 }} t={t} x={pts.map((p) => p[0])} y={pts.map((p) => p[1])} o={[0, ...times.map(() => 1), 0]} ease={linear}>
      {children}
    </M>
  )
}

function Badge({ x, y, t, color, children }: { x: number; y: number; t: number[]; color: string; children: ReactNode }) {
  return (
    <M className="absolute flex items-center gap-2 whitespace-nowrap" style={{ left: x, top: y }} t={t} o={[0, 1, 1, 0]} s={[0.7, 1, 1, 1]} ease={out}>
      <span className="grid place-items-center rounded-full font-sans text-white" style={{ width: 26, height: 26, background: color, fontSize: 15, fontWeight: 700 }}>
        {children}
      </span>
    </M>
  )
}

export function S3Intelligence() {
  // token A: predictable document — passes lightweight extraction and the checks
  const pathA: P[] = [[1080, 420], [1080, 600], [1085, 710], [1085, 712], [1250, GATE.y], [GATE.x, GATE.y], ...bez(...PASS, 5)]
  const timesA = [28.3, 28.75, 29.15, 29.5, 29.85, 30.15, 30.45, 30.6, 30.75, 30.9, 31.05]
  // token B: uncertain document — a field is missing, so it escalates to Mistral, then reaches the output
  const pathB: P[] = [[1080, 420], [1080, 600], [1085, 850], [1085, 852], [1250, GATE.y], [GATE.x, GATE.y], [GATE.x + 2, GATE.y], ...bez(...ESC, 5), [MISTRAL_R.x, MISTRAL_R.y], [MISTRAL_R.x, MISTRAL_R.y - NH / 2 - 4], [OUT.x, OUT.y + NH / 2 + 10], [OUT.x, OUT.y]]
  const timesB = [30.9, 31.3, 31.75, 32.05, 32.35, 32.6, 33.0, 33.12, 33.24, 33.36, 33.48, 33.6, 33.72, 33.95, 34.15, 34.3]
  const fade = [34.0, 34.6]
  return (
    <>
      <Words
        lines={['Not every document needs', 'the same level of intelligence.']}
        at={22.3}
        end={33.9}
        step={0.06}
        className="absolute font-serif text-ink"
        style={{ left: 116, top: 108, fontSize: 60, lineHeight: 1.06, letterSpacing: '-0.025em', fontWeight: 370 }}
      />

      <M className="absolute flex items-center gap-3" style={{ left: 120, top: 284 }} t={[23.0, 23.6, ...fade]} o={[0, 1, 1, 0]}>
        <span style={{ width: 28, height: 2, background: 'var(--color-ink)' }} />
        <span className="label text-ink" style={{ fontSize: 12 }}>
          In use · established pipeline
        </span>
      </M>
      <M className="absolute label text-ink-2" style={{ left: 180 - 40, top: LANE_Y + 40, width: 80, textAlign: 'center', fontSize: 11 }} t={[22.8, 23.3, ...fade]} o={[0, 1, 1, 0]}>
        PDF
      </M>

      <svg className="absolute inset-0 overflow-visible" width={1920} height={1080}>
        {/* established lane connectors */}
        {[215, ...LANE.slice(0, -1).map((n) => n.x + NW / 2)].map((x0, i) => {
          const x1 = LANE[i].x - NW / 2
          const a = 23.4 + i * 0.25
          return (
            <g key={i}>
              <Stroke d={`M${x0 + 8} ${LANE_Y}H${x1 - 6}`} t={[a, a + 0.5, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
              <M as="path" d={`M${x1 - 12} ${LANE_Y - 5}L${x1 - 5} ${LANE_Y}L${x1 - 12} ${LANE_Y + 5}`} fill="none" stroke="var(--color-ink)" strokeWidth={1.5} t={[a + 0.4, a + 0.6, ...fade]} o={[0, 1, 1, 0]} />
            </g>
          )
        })}
        {/* research region */}
        <Stroke d="M894 520H1846Q1860 520 1860 534V946Q1860 960 1846 960H894Q880 960 880 946V534Q880 520 894 520Z" dashed color="var(--color-sage)" width={1.4} t={[26.6, 27.9, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
        <Stroke d={`M1080 ${LANE_Y + NH / 2}V600`} dashed color="var(--color-sage)" width={1.6} t={[26.9, 27.6, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
        <Stroke d={`M1250 ${GATE.y}H${GATE.x - GATE.r - 4}`} dashed color="var(--color-sage)" width={1.6} t={[27.9, 28.3, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
        <Stroke d={d(PASS)} dashed color="var(--color-sage)" width={1.6} t={[28.1, 28.6, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
        <Stroke d={d(ESC)} dashed color="var(--color-terra)" width={1.6} t={[28.2, 28.7, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
        <Stroke d={`M${MISTRAL_R.x} ${MISTRAL_R.y - NH / 2}V${OUT.y + NH / 2}`} dashed color="var(--color-terra)" width={1.6} t={[28.5, 28.9, ...fade]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} />
        <M as="circle" cx={GATE.x} cy={GATE.y} r={GATE.r} fill="var(--color-sheet)" stroke="var(--color-ink)" strokeWidth={1.5} t={[27.9, 28.4, ...fade]} o={[0, 1, 1, 0]} s={[0.8, 1, 1, 1]} ease={[out, inOut, inOut]} />
        <M as="circle" cx={GATE.x} cy={GATE.y} r={GATE.r + 7} fill="none" stroke="var(--color-sage)" strokeWidth={3} t={[30.0, 30.2, 30.9, 31.3]} o={[0, 1, 1, 0]} />
        <M as="circle" cx={GATE.x} cy={GATE.y} r={GATE.r + 7} fill="none" stroke="var(--color-terra)" strokeWidth={3} t={[32.3, 32.5, 33.3, 33.7]} o={[0, 1, 1, 0]} />
        {/* the lane's running token: established flow end to end */}
        <M as="circle" cx={0} cy={LANE_Y} r={6} fill="var(--color-terra)" t={[24.7, 24.9, 27.0, 27.2]} x={[220, 220, 1790, 1790]} o={[0, 1, 1, 0]} ease={inOut} style={{ transformBox: 'view-box', transformOrigin: '0 0' }} />
      </svg>

      <div className="absolute">
        {LANE.map((n, i) => (
          <Node key={i} x={n.x} y={LANE_Y} title={n.title} sub={n.sub} at={23.0 + i * 0.25} />
        ))}
      </div>

      <M className="absolute label" style={{ left: 904, top: 507, padding: '0 10px', background: 'var(--color-paper)', color: 'var(--color-sage)', fontSize: 12 }} t={[27.2, 27.8, ...fade]} o={[0, 1, 1, 0]}>
        Research direction · proposed, in development
      </M>

      {/* lightweight extraction group */}
      <M className="absolute" style={{ left: 920, top: 600, width: 330, height: 330, borderRadius: 10, background: 'rgb(205 219 201 / 0.28)' }} t={[27.4, 28.0, ...fade]} o={[0, 1, 1, 0]}>
        <span className="label absolute" style={{ left: 20, top: 16, fontSize: 11, color: 'var(--color-sage)' }}>
          Lightweight extraction
        </span>
      </M>
      {[
        { y: 642, title: 'Regex', desc: 'predictable patterns', code: String.raw`\d{4}-\d{2}-\d{2}` },
        { y: 784, title: 'LayoutLMv3', desc: 'learned field labels', code: 'Acme Ltd. → CLIENT' },
      ].map((c, i) => (
        <M key={i} className="absolute" style={{ left: 940, top: c.y, width: 290, height: 128, padding: '16px 20px', borderRadius: 8, background: 'var(--color-sheet)', border: '1.5px dashed var(--color-sage)' }} t={[27.6 + i * 0.2, 28.2 + i * 0.2, ...fade]} o={[0, 1, 1, 0]} y={[14, 0, 0, 0]} ease={[out, inOut, inOut]}>
          <div className="font-sans text-ink" style={{ fontSize: 20, fontWeight: 580 }}>
            {c.title}
          </div>
          <div className="font-sans text-ink-2" style={{ fontSize: 15, marginTop: 2 }}>
            {c.desc}
          </div>
          <div className="font-mono text-terra" style={{ fontSize: 13, marginTop: 14 }}>
            {c.code}
          </div>
        </M>
      ))}

      <M className="absolute text-center" style={{ left: GATE.x - 60, top: GATE.y - 16, width: 120 }} t={[28.0, 28.5, 29.95, 30.15, 30.45, 30.65, 32.4, 32.6, 33.0, 33.2, ...fade]} o={[0, 1, 1, 0.1, 0.1, 1, 1, 0.1, 0.1, 1, 1, 0]}>
        <span className="font-serif text-ink" style={{ fontSize: 26 }}>
          Checks
        </span>
      </M>
      <M className="absolute label text-ink-2 text-center" style={{ left: GATE.x - 100, top: GATE.y + GATE.r + 16, width: 200, fontSize: 11, lineHeight: 1.7 }} t={[28.2, 28.8, ...fade]} o={[0, 1, 1, 0]}>
        confidence
        <br />
        missing fields
        <br />
        schema validation
      </M>
      <M className="absolute label" style={{ left: 1512, top: 676, fontSize: 11, color: 'var(--color-sage)' }} t={[28.4, 28.9, ...fade]} o={[0, 1, 1, 0]}>
        confident
      </M>
      <M className="absolute label" style={{ left: 1508, top: 836, fontSize: 11, color: 'var(--color-terra)' }} t={[28.5, 29.0, ...fade]} o={[0, 1, 1, 0]}>
        uncertain
      </M>

      <Token path={pathA} times={timesA}>
        <Glyph />
      </Token>
      <Token path={pathB} times={timesB}>
        <Glyph tone="#e6dfd1" mark="var(--color-ink-2)" />
      </Token>
      <Badge x={GATE.x + 34} y={GATE.y - GATE.r - 18} t={[30.2, 30.45, 31.3, 31.7]} color="var(--color-sage)">
        ✓
      </Badge>
      <Badge x={GATE.x + 34} y={GATE.y - GATE.r - 18} t={[32.5, 32.75, 33.5, 33.9]} color="var(--color-terra)">
        ?
      </Badge>
      <M className="absolute label whitespace-nowrap" style={{ left: GATE.x - 130, top: GATE.y - GATE.r - 30, fontSize: 11, color: 'var(--color-terra)' }} t={[32.6, 32.9, 33.5, 33.9]} o={[0, 1, 1, 0]} x={[6, 0, 0, 0]}>
        field missing
      </M>

      <Node x={OUT.x} y={OUT.y} title="Structured fields" sub="schema-checked" at={28.4} accent="var(--color-sage)" dashed />

      <Words
        lines={['Use lighter methods', 'where they suffice.']}
        at={28.6}
        end={33.9}
        step={0.06}
        className="absolute font-serif text-ink"
        style={{ left: 118, top: 590, fontSize: 42, lineHeight: 1.12, letterSpacing: '-0.02em', fontWeight: 380 }}
      />
      <Words
        lines={['Escalate what’s uncertain.']}
        at={31.6}
        end={33.9}
        step={0.06}
        className="absolute font-serif italic text-terra"
        style={{ left: 118, top: 704, fontSize: 42, lineHeight: 1.12, letterSpacing: '-0.02em', fontWeight: 380 }}
      />

      <M className="absolute flex flex-col gap-3" style={{ left: 120, top: 872 }} t={[27.6, 28.2, ...fade]} o={[0, 1, 1, 0]}>
        <div className="flex items-center gap-3">
          <span style={{ width: 28, height: 2, background: 'var(--color-ink)' }} />
          <span className="label text-ink-2" style={{ fontSize: 11 }}>
            In use today
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ width: 28, height: 0, borderTop: '2px dashed var(--color-sage)' }} />
          <span className="label text-ink-2" style={{ fontSize: 11 }}>
            Research direction — proposed, not yet deployed
          </span>
        </div>
      </M>
      <M className="absolute label text-ink-3" style={{ left: 904, top: 974, fontSize: 11 }} t={[28.6, 29.2, ...fade]} o={[0, 1, 1, 0]}>
        Ordering and combination of lightweight stages are still under study
      </M>
    </>
  )
}
