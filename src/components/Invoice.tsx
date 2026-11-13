import type { CSSProperties, ReactNode } from 'react'
import { money, translations, useLang, type Lang } from '../i18n'

/* The sample invoice, laid out in fixed local coordinates (520×680) so every
   text line can carry its own OCR box and field highlight. */

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
  font?: 'sans' | 'mono'
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
  return [
    { x: 72, y: 47, text: 'Northstar Supplies', size: 15, weight: 620 },
    { x: 480, y: 38, text: t.title, size: 30, weight: 300, right: true },
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
    { x: 480, y: 519, text: money(lang, SAMPLE.total_amount), size: 19, weight: 700, right: true, field: 'total_amount' },
    { x: 40, y: 586, text: t.thanks, size: 15 },
    { x: 40, y: 620, text: t.terms, size: 9.5, font: 'mono', muted: true },
  ]
}
const cache = new Map<Lang, Line[]>()
/** Invoice lines for the active locale. */
export function useLines() {
  const lang = useLang()
  if (!cache.has(lang)) cache.set(lang, buildLines(lang))
  return cache.get(lang)!
}

export function lineStyle(l: Line): CSSProperties {
  return {
    fontFamily: `var(--font-${l.font ?? 'sans'})`,
    fontSize: l.size,
    fontWeight: l.weight ?? 400,
    lineHeight: 1,
    color: l.muted ? 'var(--color-ink-3)' : 'var(--color-ink)',
    letterSpacing: l.caps ? '0.06em' : undefined,
    textTransform: l.caps ? 'uppercase' : undefined,
    whiteSpace: 'nowrap',
  }
}

export function Invoice({ overlay, children }: { overlay?: (l: Line, i: number) => ReactNode; children?: ReactNode }) {
  const LINES = useLines()
  return (
    <div className="panel absolute overflow-hidden" style={{ width: INV_W, height: INV_H }}>
      <div className="absolute" style={{ left: 40, top: 44, width: 22, height: 22, borderRadius: 4, background: 'var(--color-ink)' }}>
        <div className="absolute" style={{ left: 7, top: 7, width: 8, height: 8, borderRadius: 8, background: 'var(--color-blue)' }} />
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
