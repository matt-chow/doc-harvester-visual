import type { CSSProperties, ReactNode } from 'react'
import { money, translations, useLang, type Lang } from '../i18n'

/* The hero invoice, laid out in fixed local coordinates (520×680) so every
   text line's position is known exactly — OCR boxes and lifted field fragments rely on it. */

export const INV_W = 520
export const INV_H = 680

/** The four canonical extraction fields — keys are never translated. */
export type Field = 'invoice_number' | 'invoice_date' | 'vendor_name' | 'total_amount'
export const FIELDS: Field[] = ['invoice_number', 'invoice_date', 'vendor_name', 'total_amount']
export const SAMPLE = { invoice_number: 'INV-2026-0042', invoice_date: '2026-11-10', vendor_name: 'Northstar Supplies Inc.', total_amount: 1250 }

export interface Line {
  x: number
  y: number
  text: string
  size: number
  weight?: number
  font?: 'sans' | 'serif' | 'mono'
  muted?: boolean
  /** x is the right edge */
  right?: boolean
  field?: Field
  caps?: boolean
}

const label = (x: number, y: number, text: string, right = false): Line => ({ x, y, text, size: 9.5, font: 'mono', muted: true, caps: true, right })

const ITEMS = [
  [10, 75, 750],
  [4, 100, 400],
  [1, 100, 100],
]

/** The invoice's lines for one locale: same document, same values, localized labels and number formats. */
function buildLines(lang: Lang): Line[] {
  const t = translations[lang].invoice
  const n = (v: number) => money(lang, v, false)
  const total: Line = { x: 0, y: 519, text: money(lang, SAMPLE.total_amount), size: 19, weight: 680, field: 'total_amount' }
  // field fragments are positioned by their left edge, so the right-aligned total is measured in place
  total.x = 480 - measure(total)
  return [
    { x: 72, y: 47, text: 'Northstar Supplies', size: 15, weight: 620 },
    { x: 480, y: 38, text: t.title, size: 32, font: 'serif', weight: 420, right: true },
    label(40, 104, t.number),
    { x: 40, y: 121, text: SAMPLE.invoice_number, size: 13, field: 'invoice_number' },
    label(190, 104, t.issued),
    { x: 190, y: 121, text: SAMPLE.invoice_date, size: 13, field: 'invoice_date' },
    label(330, 104, t.due),
    { x: 330, y: 121, text: '2026-12-10', size: 13 },
    label(40, 184, t.billTo),
    { x: 40, y: 202, text: 'Acme Ltd.', size: 16, weight: 620 },
    { x: 40, y: 228, text: '88 Harbour Road', size: 12, muted: true },
    { x: 40, y: 246, text: 'Halifax NS B3J 1A1', size: 12, muted: true },
    label(270, 184, t.from),
    { x: 270, y: 202, text: SAMPLE.vendor_name, size: 16, weight: 620, field: 'vendor_name' },
    { x: 270, y: 228, text: t.attn, size: 12, muted: true },
    { x: 270, y: 246, text: 'Toronto ON M5H 2Y4', size: 12, muted: true },
    label(40, 300, t.desc),
    label(330, 300, t.qty, true),
    label(400, 300, t.rate, true),
    label(480, 300, t.amount, true),
    ...ITEMS.flatMap(([q, r, a], i): Line[] => [
      { x: 40, y: 334 + i * 32, text: t.items[i], size: 13 },
      { x: 330, y: 334 + i * 32, text: String(q), size: 13, right: true },
      { x: 400, y: 334 + i * 32, text: n(r), size: 13, right: true },
      { x: 480, y: 334 + i * 32, text: n(a), size: 13, right: true },
    ]),
    { x: 300, y: 454, text: t.subtotal, size: 12, muted: true },
    { x: 480, y: 454, text: n(SAMPLE.total_amount), size: 12, right: true, muted: true },
    { x: 300, y: 478, text: t.tax, size: 12, muted: true },
    { x: 480, y: 478, text: n(0), size: 12, right: true, muted: true },
    { x: 300, y: 524, text: t.total, size: 13, weight: 620 },
    total,
    { x: 40, y: 586, text: t.thanks, size: 17, font: 'serif' },
    { x: 40, y: 620, text: t.terms, size: 9.5, font: 'mono', muted: true },
  ]
}
const cache = new Map<Lang, Line[]>()
/** Invoice lines for the active locale (built after fonts load, so measurements are exact). */
export function useLines() {
  const lang = useLang()
  if (!cache.has(lang)) cache.set(lang, buildLines(lang))
  return cache.get(lang)!
}
export const fieldLine = (lines: Line[], f: Field) => lines.find((l) => l.field === f)!

let ctx: CanvasRenderingContext2D | null = null
/** Rendered text width in invoice-local px (fonts are loaded before mount). */
export function measure(l: Line) {
  ctx ??= document.createElement('canvas').getContext('2d')!
  const st = lineStyle(l)
  ctx.font = `${st.fontWeight} ${l.size}px ${l.font === 'serif' ? '"Fraunces Variable"' : l.font === 'mono' ? '"JetBrains Mono Variable"' : '"Inter Variable"'}`
  return ctx.measureText(l.text).width
}

export function lineStyle(l: Line): CSSProperties {
  return {
    fontFamily: `var(--font-${l.font ?? 'sans'})`,
    fontSize: l.size,
    fontWeight: l.weight ?? (l.font === 'serif' ? 400 : 450),
    lineHeight: 1,
    color: l.muted ? 'var(--color-ink-3)' : 'var(--color-ink)',
    letterSpacing: l.caps ? '0.08em' : l.font === 'serif' ? '-0.01em' : '-0.005em',
    textTransform: l.caps ? 'uppercase' : undefined,
    whiteSpace: 'nowrap',
  }
}

/** Map an invoice-local point to stage coordinates given the invoice's centre and scale. */
export const toStage = (cx: number, cy: number, s: number, lx: number, ly: number) => [cx + s * (lx - INV_W / 2), cy + s * (ly - INV_H / 2)] as const

export function Invoice({ overlay, children }: { overlay?: (l: Line, i: number) => ReactNode; children?: ReactNode }) {
  const LINES = useLines()
  return (
    <div className="sheet absolute overflow-hidden" style={{ width: INV_W, height: INV_H, borderRadius: 3 }}>
      <div className="absolute" style={{ left: 40, top: 44, width: 22, height: 22, borderRadius: 4, background: 'var(--color-ink)' }}>
        <div className="absolute" style={{ left: 7, top: 7, width: 8, height: 8, borderRadius: 8, background: 'var(--color-terra)' }} />
      </div>
      {[158, 318, 436].map((y) => (
        <div key={y} className="absolute" style={{ left: 40, right: 40, top: y, height: 1, background: 'var(--color-rule)' }} />
      ))}
      <div className="absolute" style={{ left: 300, right: 40, top: 504, height: 1, background: 'var(--color-ink)' }} />
      {LINES.map((l, i) => (
        <span
          key={i}
          className="absolute"
          style={{ ...lineStyle(l), top: l.y, ...(l.right ? { right: INV_W - l.x } : { left: l.x }) }}
        >
          {overlay?.(l, i)}
          <span className="relative">{l.text}</span>
        </span>
      ))}
      {children}
    </div>
  )
}

/** Generic thumbnails for the document collection — each format is recognisable at a glance. */
export type DocKind = 'pdf' | 'scan' | 'form' | 'hand' | 'report' | 'skeleton'

const bar = (x: number, y: number, w: number, h = 5, c = 'var(--color-rule)'): CSSProperties => ({
  position: 'absolute',
  left: x,
  top: y,
  width: w,
  height: h,
  borderRadius: h,
  background: c,
})

export function MiniDoc({ kind, w, h, children }: { kind: DocKind; w: number; h: number; children?: ReactNode }) {
  const p = Math.round(w * 0.1)
  const inner = w - p * 2
  const sheet = (
    <div
      className="sheet absolute inset-0 overflow-hidden"
      style={{
        borderRadius: 3,
        background: kind === 'scan' ? '#ece6da' : undefined,
      }}
    >
      {kind === 'pdf' && (
        <>
          <div style={bar(p, p, inner * 0.55, 10, 'var(--color-ink)')} />
          <div style={{ ...bar(w - p - 34, p - 2, 34, 16, 'var(--color-terra)'), borderRadius: 3 }} />
          <span className="label absolute" style={{ left: w - p - 30, top: p, fontSize: 9, color: '#fff', letterSpacing: '0.1em' }}>
            PDF
          </span>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} style={bar(p, p + 34 + i * 17 + (i > 4 ? 16 : 0), inner * (i % 4 === 3 ? 0.62 : 0.97))} />
          ))}
        </>
      )}
      {kind === 'scan' && (
        <div className="absolute inset-0" style={{ transform: 'rotate(-1.6deg) translate(4px, 2px)', filter: 'contrast(0.9)' }}>
          <div style={bar(p, p, inner * 0.4, 9, '#5f5a52')} />
          <div style={bar(w - p - inner * 0.3, p, inner * 0.3, 9, '#8a837a')} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} style={bar(p, p + 40 + i * 19, inner * (i % 3 === 2 ? 0.5 : 0.92), 5, '#b9b0a2')} />
          ))}
          <div style={{ ...bar(p, h - p - 46, inner, 1, '#8a837a') }} />
          <div style={bar(w - p - 80, h - p - 30, 80, 8, '#5f5a52')} />
          <div className="absolute rounded-full" style={{ left: p + 6, top: h - p - 64, width: 54, height: 54, border: '2px solid rgb(200 100 59 / 0.45)', transform: 'rotate(-14deg)' }} />
        </div>
      )}
      {kind === 'scan' && <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 30px rgb(80 60 40 / 0.22)' }} />}
      {kind === 'form' && (
        <>
          <div style={bar(p, p, inner * 0.6, 9, 'var(--color-ink)')} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div style={bar(p, p + 34 + i * 46, inner * 0.3, 4, 'var(--color-ink-3)')} />
              <div className="absolute" style={{ left: p, top: p + 44 + i * 46, width: inner, height: 20, border: '1px solid var(--color-rule)', borderRadius: 2 }} />
            </div>
          ))}
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="absolute" style={{ left: p, top: p + 230 + i * 22, width: 11, height: 11, border: '1.2px solid var(--color-ink-2)', borderRadius: 2, background: i === 1 ? 'var(--color-ink)' : undefined }} />
              <div style={bar(p + 20, p + 233 + i * 22, inner * 0.5, 4)} />
            </div>
          ))}
        </>
      )}
      {kind === 'hand' && (
        <svg className="absolute inset-0" width={w} height={h}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const y = p + 18 + i * 28
            const len = inner * (i === 0 ? 0.45 : i % 3 === 2 ? 0.6 : 0.92)
            let d = `M${p} ${y}`
            for (let k = 0; k < len; k += 12) d += ` q 3 ${-7 + ((k * 7 + i * 3) % 5)} 6 0 t 6 0`
            return <path key={i} d={d} fill="none" stroke={i === 0 ? '#2b3a55' : '#3d4a63'} strokeWidth={i === 0 ? 2 : 1.4} strokeLinecap="round" opacity={0.85} />
          })}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <line key={i} x1={0} x2={w} y1={p + 24 + i * 28} y2={p + 24 + i * 28} stroke="#d7dbe0" strokeWidth={1} />
          ))}
        </svg>
      )}
      {(kind === 'report' || kind === 'skeleton') && (
        <>
          <div style={bar(p, p, inner * 0.5, 8, 'var(--color-ink)')} />
          {kind === 'report' ? (
            <>
              <div style={bar(p, p + 22, inner * 0.8, 4)} />
              {[0.55, 0.8, 0.4, 0.95, 0.7].map((v, i) => (
                <div key={i} className="absolute" style={{ left: p + i * (inner / 5) + 4, bottom: h * 0.42, width: inner / 5 - 8, height: v * h * 0.22, background: i === 3 ? 'var(--color-terra)' : 'var(--color-sage-soft)', borderRadius: 2 }} />
              ))}
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={bar(p, h * 0.62 + i * 14, inner * (i === 4 ? 0.5 : 0.95), 4)} />
              ))}
              <span className="label absolute" style={{ right: p, bottom: p - 4, fontSize: 9, color: 'var(--color-ink-3)' }}>
                p. 1 / 3
              </span>
            </>
          ) : null}
        </>
      )}
      {children}
    </div>
  )
  if (kind !== 'report') return <div className="absolute" style={{ width: w, height: h }}>{sheet}</div>
  return (
    <div className="absolute" style={{ width: w, height: h }}>
      <div className="sheet absolute inset-0" style={{ transform: 'translate(16px, -14px) rotate(3deg)', borderRadius: 3 }} />
      <div className="sheet absolute inset-0" style={{ transform: 'translate(8px, -7px) rotate(1.5deg)', borderRadius: 3 }} />
      {sheet}
    </div>
  )
}

/** Tiny document glyph used as a token travelling through diagrams. */
export function Glyph({ w = 26, tone = 'var(--color-sheet)', mark = 'var(--color-ink)' }: { w?: number; tone?: string; mark?: string }) {
  const h = w * 1.3
  return (
    <svg width={w} height={h} viewBox="0 0 26 34" style={{ overflow: 'visible', display: 'block' }}>
      <path d="M1 1h16l8 8v24H1z" fill={tone} stroke={mark} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M17 1v8h8" fill="none" stroke={mark} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M6 16h14M6 21h14M6 26h9" stroke={mark} strokeWidth={1.4} strokeLinecap="round" opacity={0.55} />
    </svg>
  )
}
