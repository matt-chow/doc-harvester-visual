import { Glyph, fieldLine, FIELDS, SAMPLE, toStage, useLines, type Field } from '../components/Invoice'
import { money, useLang, useT } from '../i18n'
import { HERO_S5 } from '../components/Hero'
import { inOut, M, out, Stroke, Words } from '../timeline'
import { Chip, fit } from './S2Extraction'

/* Scene 5 · From information to answers.
   fields → JSON (values normalised) → each JSON row becomes a graph node → closing title → collapse to the seam dot. */

const JX = 860
const JY = 380
const LH = 56
const CH = 18 // JetBrains Mono advance at 30px
const C = { x: 1380, y: 560 }

// JSON values are locale-neutral; only the human labels around them are translated
const ROWS: Record<Field, { value: string; node: [number, number] }> = {
  invoice_number: { value: '"INV-2026-0042",', node: [1090, 380] },
  invoice_date: { value: '"2026-11-10",', node: [1680, 760] },
  vendor_name: { value: '"Northstar Supplies Inc.",', node: [1100, 760] },
  total_amount: { value: '1250.00', node: [1690, 380] },
}
const key = (f: Field) => `  "${f}": `
const EXTRAS = [
  { id: 'INV-2026-0031', at: [900, 930] as const, to: 'vendor_name' as Field },
  { id: 'INV-2026-0038', at: [1810, 925] as const, to: 'invoice_date' as Field },
]
const json = { fontFamily: 'var(--font-mono)', fontSize: 30, lineHeight: `${LH}px`, whiteSpace: 'pre' } as const
const collapse = [58.6, 59.4]

export function S5Outcome() {
  const { cx, cy, s } = HERO_S5
  const tr = useT()
  const c5 = tr.scene5
  const lang = useLang()
  const lines = useLines()
  const shown: Record<Field, string> = { ...SAMPLE, total_amount: money(lang, SAMPLE.total_amount) }
  return (
    <>
      <Words
        lines={c5.headline}
        at={47.2}
        end={55.0}
        step={0.07}
        className="absolute font-serif text-ink"
        style={{ left: 116, top: 108, fontSize: 60, lineHeight: 1.06, letterSpacing: '-0.025em', fontWeight: 370 }}
      />

      {/* JSON panel */}
      <M className="absolute" style={{ left: JX - 36, top: JY - 34, width: 860, height: LH * 6 + 68, borderRadius: 12, background: 'var(--color-sheet)', border: '1px solid var(--color-rule)' }} t={[48.3, 48.9, 51.7, 52.3]} o={[0, 1, 1, 0]} y={[16, 0, 0, 0]} ease={[out, inOut, inOut]} />
      <M className="absolute label text-ink-3" style={{ left: JX - 36, top: JY - 72, fontSize: 12 }} t={[48.5, 49.1, 51.7, 52.2]} o={[0, 1, 1, 0]}>
        <span className="text-ink">response.json</span> · {c5.sample}
      </M>
      {['{', '}'].map((b, i) => (
        <M key={b} className="absolute text-ink-3" style={{ ...json, left: JX, top: JY + i * LH * 5 }} t={[48.6 + i * 0.6, 49.0 + i * 0.6, 51.6, 52.0]} o={[0, 1, 1, 0]}>
          {b}
        </M>
      ))}

      <svg className="absolute inset-0 overflow-visible" width={1920} height={1080}>
        {FIELDS.map((f) => {
          const [nx, ny] = ROWS[f].node
          const n = Math.hypot(nx - C.x, ny - C.y)
          const [ux, uy] = [(nx - C.x) / n, (ny - C.y) / n]
          return <Stroke key={f} d={`M${C.x + ux * 92} ${C.y + uy * 92}L${nx} ${ny}`} t={[52.8, 53.6, 58.5, 59.1]} draw={[0, 1, 1, 0]} color="var(--color-ink-2)" width={1.3} />
        })}
        {EXTRAS.map((e) => {
          const [nx, ny] = ROWS[e.to].node
          return <Stroke key={e.id} d={`M${e.at[0]} ${e.at[1] - 26}L${nx} ${ny}`} dashed t={[53.7, 54.4, 58.2, 58.7]} draw={[0, 1, 1, 1]} o={[1, 1, 1, 0]} color="var(--color-sage)" width={1.4} />
        })}
        <M as="circle" cx={C.x} cy={C.y} r={84} fill="none" stroke="var(--color-terra)" strokeWidth={1.6} t={[52.6, 53.3, 58.7, 59.5, 59.75]} s={[0.6, 1, 1, 0.15, 0.15]} o={[0, 1, 1, 1, 0]} />
      </svg>

      <M className="absolute label text-center" style={{ left: C.x - 120, top: C.y + 98, width: 240, fontSize: 11, lineHeight: 1.7 }} t={[53.2, 53.8, 58.4, 58.9]} o={[0, 1, 1, 0]}>
        <div className="text-ink">
          {c5.invoice} {SAMPLE.invoice_number}
        </div>
        <div className="text-ink-3">{c5.graph}</div>
      </M>

      {/* JSON rows: typed keys, values filled by the flying fields, then each row travels out to become a node */}
      {FIELDS.map((f, k) => {
        const row = ROWS[f]
        const ly = JY + LH * (k + 1)
        const [nx, ny] = row.node
        const land = 49.4 + k * 0.32 + 1.3
        return (
          <M key={f} className="absolute" style={{ left: JX, top: ly, width: 0, height: 0 }} t={[51.8, 53.2, ...collapse]} x={[0, nx - JX, nx - JX, C.x - JX]} y={[0, ny - ly, ny - ly, C.y - ly]} s={[1, 1, 1, 0.3]}>
            <M className="absolute left-0 top-0" style={json} t={[48.7 + k * 0.12, 49.2 + k * 0.12, 51.8, 52.3]} o={[0, 1, 1, 0]}>
              <span className="text-ink">{key(f)}</span>
              <M as="span" className="text-terra" t={[land - 0.15, land + 0.15]} o={[0, 1]}>
                {row.value}
              </M>
            </M>
            <M className="absolute flex flex-col justify-center" style={{ left: 0, top: -40, minWidth: 250, height: 80, padding: '0 22px', transform: 'translateX(-50%)', borderRadius: 14, background: 'var(--color-sheet)', border: '1px solid var(--color-rule)', boxShadow: '0 10px 24px -14px rgb(70 50 30 / .35)' }} t={[52.3, 52.9, 58.9, 59.4]} o={[0, 1, 1, 0]}>
              <span className="label text-terra whitespace-nowrap" style={{ fontSize: 11 }}>
                {tr.fields[f]}
              </span>
              <span className="font-serif text-ink whitespace-nowrap" style={{ fontSize: 25, marginTop: 2, letterSpacing: '-0.01em' }}>
                {shown[f]}
              </span>
            </M>
          </M>
        )
      })}

      {FIELDS.map((f, k) => {
        const l = fieldLine(lines, f)
        const L = 49.4 + k * 0.32
        const [sx, sy] = toStage(cx, cy, s, l.x - 5, l.y - 4)
        const ts = fit(l, 27, 420)
        const [tx, ty] = [JX + key(f).length * CH - 5 * ts, JY + LH * (k + 1) + 13 - 4 * ts]
        return <Chip key={f} l={l} t={[L - 0.05, L, L + 0.4, L + 1.3, L + 1.6]} x={[sx, sx, sx - 4, tx, tx]} y={[sy, sy, sy - 10, ty, ty]} s={[s, s, s * 1.08, ts, ts]} o={[0, 1, 1, 1, 0]} />
      })}

      {EXTRAS.map((e, i) => (
        <M key={e.id} className="absolute flex flex-col items-center" style={{ left: e.at[0] - 60, top: e.at[1] - 22, width: 120 }} t={[53.9 + i * 0.2, 54.5 + i * 0.2, 58.2, 58.7]} o={[0, 0.85, 0.85, 0]} y={[10, 0, 0, 0]} ease={[out, inOut, inOut]}>
          <Glyph w={24} />
          <span className="label text-ink-2" style={{ fontSize: 10, marginTop: 8 }}>
            {e.id}
          </span>
        </M>
      ))}

      <M className="absolute font-sans text-ink-2" style={{ left: 122, top: 292, width: 560, fontSize: 23, lineHeight: 1.45 }} t={[53.6, 54.3, 55.2, 55.8]} o={[0, 1, 1, 0]} y={[16, 0, 0, -10]} ease={[out, inOut, inOut]}>
        {c5.caption}
      </M>

      {/* closing */}
      <Words
        lines={['Doc-Harvester']}
        at={55.9}
        end={58.5}
        step={0.1}
        className="absolute font-serif text-ink"
        style={{ left: 110, top: 368, fontSize: 124, lineHeight: 1, letterSpacing: '-0.035em', fontWeight: 400, fontVariationSettings: '"opsz" 144' }}
      />
      <Words
        lines={[c5.tagline]}
        at={56.3}
        end={58.55}
        step={0.06}
        className="absolute font-serif italic text-terra"
        style={{ left: 118, top: 526, fontSize: 46, lineHeight: 1.1, letterSpacing: '-0.015em', fontWeight: 360 }}
      />
      <M className="absolute label text-ink-2" style={{ left: 122, top: 622, fontSize: 15, letterSpacing: '0.22em' }} t={[56.9, 57.6, 58.4, 58.9]} o={[0, 1, 1, 0]} x={[-12, 0, 0, 0]} ease={[out, inOut, inOut]}>
        {c5.verbs}
      </M>
    </>
  )
}
