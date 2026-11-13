import type { ReactNode } from 'react'
import { CLEAR, D, M, span } from '../timeline'
import { LAYOUT } from './Chrome'

/* The right-hand work panel. The white card stays put for the whole pass; each step swaps only
   its header text and body, fading out fully before the next fades in. */

export const PANEL = { x: 520, y: LAYOUT.top, w: 1304, h: LAYOUT.bottom - LAYOUT.top }
const HEAD = 64

export function PanelFrame() {
  return <M className="panel absolute" style={{ left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h }} t={[1.6, 2.8, ...CLEAR]} o={[0, 1, 1, 0]} />
}

/** One step's panel content: header (title · subtitle) and a body in panel-local coordinates. */
export function Step({ i, title, sub, children }: { i: number; title: string; sub?: string; children: ReactNode }) {
  const [s, e] = span(i)
  const t = [s + 2.0, s + 3.2, ...(e === D ? CLEAR : [e - 1.4, e - 0.2])]
  return (
    <M className="absolute" style={{ left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h }} t={t} o={[0, 1, 1, 0]}>
      <div className="absolute flex items-baseline" style={{ left: 28, top: 18, gap: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 600 }}>{title}</span>
        {sub && <span style={{ fontSize: 17, color: 'var(--color-ink-2)' }}>{sub}</span>}
      </div>
      <div className="absolute" style={{ left: 0, right: 0, top: HEAD, height: 1, background: 'var(--color-rule)' }} />
      <div className="absolute" style={{ left: 28, right: 28, top: HEAD + 24, bottom: 24 }}>
        {children}
      </div>
    </M>
  )
}

/** Flat file icon; `img` draws a picture glyph instead of text lines. */
export function FileIcon({ size = 24, img = false }: { size?: number; img?: boolean }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 20 25" fill="none" stroke="var(--color-ink-2)" strokeWidth={1.2} style={{ flex: 'none' }}>
      <path d="M1 1h12l6 6v17H1z" fill="#fff" strokeLinejoin="round" />
      <path d="M13 1v6h6" strokeLinejoin="round" />
      {img ? (
        <>
          <circle cx={7} cy={12} r={1.6} fill="var(--color-blue)" stroke="none" />
          <path d="M4 20l4-4 3 3 2-2 3 3" stroke="var(--color-blue)" />
        </>
      ) : (
        <>
          <rect x={4} y={14} width={12} height={5} fill="#c43e1c" stroke="none" />
        </>
      )}
    </svg>
  )
}

/** Small green check, used for "done" states. */
export function Check({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" style={{ flex: 'none' }}>
      <circle cx={11} cy={11} r={11} fill="var(--color-ok)" />
      <path d="M6 11.5l3.2 3.2L16 8" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
