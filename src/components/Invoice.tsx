import type { CSSProperties, ReactNode } from 'react'

/* The hero invoice, laid out in fixed local coordinates (520×680) so every
   text line's position is known exactly — OCR boxes and lifted field fragments rely on it. */

export const INV_W = 520
export const INV_H = 680

export type Field = 'date' | 'amount' | 'client' | 'recipient'
export const FIELDS: Field[] = ['date', 'amount', 'client', 'recipient']

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

export const LINES: Line[] = [
  { x: 72, y: 47, text: 'Northstar Inc.', size: 15, weight: 620 },
  { x: 480, y: 38, text: 'Invoice', size: 32, font: 'serif', weight: 420, right: true },
  label(40, 104, 'Invoice no.'),
  { x: 40, y: 121, text: 'NS-0417', size: 13 },
  label(190, 104, 'Issued'),
  { x: 190, y: 121, text: '2026-11-10', size: 13, field: 'date' },
  label(330, 104, 'Due'),
  { x: 330, y: 121, text: '2026-12-10', size: 13 },
  label(40, 184, 'Client'),
  { x: 40, y: 202, text: 'Acme Ltd.', size: 16, weight: 620, field: 'client' },
  { x: 40, y: 228, text: '14 Harbour Row', size: 12, muted: true },
  { x: 40, y: 246, text: 'Leeds LS1 4AB', size: 12, muted: true },
  label(280, 184, 'Recipient'),
  { x: 280, y: 202, text: 'Northstar Inc.', size: 16, weight: 620, field: 'recipient' },
  { x: 280, y: 228, text: 'Accounts Receivable', size: 12, muted: true },
  { x: 280, y: 246, text: 'Bristol BS1 6QH', size: 12, muted: true },
  label(40, 300, 'Description'),
  label(330, 300, 'Qty', true),
  label(400, 300, 'Rate', true),
  label(480, 300, 'Amount', true),
  { x: 40, y: 334, text: 'Document review', size: 13 },
  { x: 330, y: 334, text: '10', size: 13, right: true },
  { x: 400, y: 334, text: '75.00', size: 13, right: true },
  { x: 480, y: 334, text: '750.00', size: 13, right: true },
  { x: 40, y: 366, text: 'Data structuring', size: 13 },
  { x: 330, y: 366, text: '4', size: 13, right: true },
  { x: 400, y: 366, text: '100.00', size: 13, right: true },
  { x: 480, y: 366, text: '400.00', size: 13, right: true },
  { x: 40, y: 398, text: 'Archive indexing', size: 13 },
  { x: 330, y: 398, text: '1', size: 13, right: true },
  { x: 400, y: 398, text: '100.00', size: 13, right: true },
  { x: 480, y: 398, text: '100.00', size: 13, right: true },
  { x: 300, y: 454, text: 'Subtotal', size: 12, muted: true },
  { x: 480, y: 454, text: '1,250.00', size: 12, right: true, muted: true },
  { x: 300, y: 478, text: 'Tax (0%)', size: 12, muted: true },
  { x: 480, y: 478, text: '0.00', size: 12, right: true, muted: true },
  { x: 300, y: 524, text: 'Total due', size: 13, weight: 620 },
  { x: 386, y: 519, text: '$1,250.00', size: 19, weight: 680, field: 'amount' },
  { x: 40, y: 586, text: 'Thank you.', size: 17, font: 'serif' },
  { x: 40, y: 620, text: 'Payment within 30 days · Ref NS-0417', size: 9.5, font: 'mono', muted: true },
]

export const fieldLine = (f: Field) => LINES.find((l) => l.field === f)!

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
