import { MiniDoc, type DocKind } from '../components/Invoice'
import { useT } from '../i18n'
import { inOut, linear, M, out, Words } from '../timeline'

/* Scene 1 · Every document holds information.
   The collection gathers around the invoice, then parts to single it out. */

const HERO = [1380, 560]
const DOCS: { kind: DocKind; w: number; h: number; cx: number; cy: number; r: number }[] = [
  { kind: 'pdf', w: 280, h: 362, cx: 1070, cy: 285, r: -6 },
  { kind: 'scan', w: 270, h: 350, cx: 1725, cy: 300, r: 5 },
  { kind: 'form', w: 260, h: 336, cx: 1075, cy: 815, r: 4 },
  { kind: 'hand', w: 250, h: 322, cx: 1730, cy: 810, r: -4 },
  { kind: 'report', w: 220, h: 286, cx: 640, cy: 840, r: -7 },
]

export function S1Problem() {
  const tr = useT()
  const lines = tr.scene1.headline
  // a longer (three-line) headline rises to keep the subline in the same place relative to it
  const top = 318 - (lines.length - 2) * 60
  return (
    <>
      {/* slow camera push on the collection; the hero stays put, which reads as depth */}
      <M className="absolute inset-0" t={[1.5, 7.2]} s={[1, 1.035]}>
        {DOCS.map((d, i) => {
          const dx = d.cx - HERO[0]
          const dy = d.cy - HERO[1]
          const n = Math.hypot(dx, dy)
          const [vx, vy] = [dx / n, dy / n]
          const a = 1.7 + i * 0.32
          const at = (k: number) => [d.cx + vx * k, d.cy + vy * k]
          const p = [at(380), at(0), at(14), at(80), at(260)]
          return (
            <M
              key={i}
              className="absolute"
              style={{ left: -d.w / 2, top: -d.h / 2, width: d.w, height: d.h }}
              t={[a, a + 1.5, 5.4, 7.0, 8.3]}
              x={p.map((q) => q[0])}
              y={p.map((q) => q[1])}
              rot={[d.r + vx * 14, d.r, d.r * 1.15, d.r * 1.3, d.r * 1.5]}
              s={[1.05, 1, 1, 0.98, 0.95]}
              o={[0, 1, 1, 0.2, 0]}
              ease={[out, linear, inOut, inOut]}
            >
              <MiniDoc kind={d.kind} w={d.w} h={d.h} />
              <M className="absolute label text-ink-3 whitespace-nowrap" style={{ left: 0, top: d.h + 16, fontSize: 12 }} t={[a + 1.0, a + 1.7, 5.3, 5.9]} o={[0, 1, 1, 0]} y={[6, 0, 0, 0]}>
                <span className="text-terra">◦</span> {tr.scene1.docs[i]}
              </M>
            </M>
          )
        })}
      </M>

      <Words
        lines={lines}
        at={0.8}
        end={7.0}
        step={0.09}
        className="absolute font-serif text-ink"
        style={{ left: 116, top, fontSize: 92, lineHeight: 1.04, letterSpacing: '-0.028em', fontWeight: 360, fontVariationSettings: '"opsz" 144' }}
      />
      <M className="absolute font-sans text-ink-2" style={{ left: 122, top: top + lines.length * 96 + 38, width: 560, fontSize: 23, lineHeight: 1.45 }} t={[2.7, 3.7, 6.8, 7.5]} o={[0, 1, 1, 0]} y={[18, 0, 0, -12]} ease={[out, inOut, inOut]}>
        {tr.scene1.sub}
      </M>
    </>
  )
}

