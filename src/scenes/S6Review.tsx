import type { ReactNode } from 'react'
import { Check, Step } from '../components/Panel'
import { FIELDS, SAMPLE, type Field } from '../components/Invoice'
import { money, useLang, useT } from '../i18n'
import { linear, M } from '../timeline'

/* Step 6 · Human review: Mistral's candidate annotations for a training invoice are checked by a person
   against the source invoice (left); the wrong total is corrected, all four fields are marked verified,
   the invoice joins the curated dataset, and the dataset feeds LayoutLMv3 fine-tuning. */

const ROW = 72
const FLAG = FIELDS.indexOf('total_amount')
const WRONG = 1250.8 // Mistral's misread; the source invoice prints 1,250.00
const T = { rows: 103.6, flag: 107, look: 108.4, fix: 111, verify: 112.4, dataset: 113.6, train: 116 }
const SIDE = 820 // right column: dataset and model

function Chip({ bg, fg, t, o, children }: { bg: string; fg: string; t: number[]; o: number[]; children: ReactNode }) {
  return (
    <M className="absolute flex items-center whitespace-nowrap" style={{ left: 560, top: 22, height: 28, padding: '0 10px', gap: 6, background: bg, color: fg, fontSize: 15, fontWeight: 600 }} t={t} o={o}>
      {children}
    </M>
  )
}

export function S6Review() {
  const tr = useT()
  const lang = useLang()
  const shown: Record<Field, string> = { ...SAMPLE, total_amount: money(lang, WRONG) }
  const head = { fontSize: 15, fontWeight: 600, color: 'var(--color-ink-2)' }
  const card = { border: '1px solid var(--color-rule)', background: '#faf9f8' }
  return (
    <Step i={5} title={tr.s6.title} sub={tr.s6.sub}>
      <M className="absolute flex items-center" style={{ right: 0, top: -72, height: 32, gap: 8, fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }} t={[T.look, T.look + 0.8]} o={[0, 1]}>
        <svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke="var(--color-ink-2)" strokeWidth={1.4}>
          <circle cx={11} cy={7.5} r={4} />
          <path d="M3 20c.8-4.4 4-6.5 8-6.5s7.2 2.1 8 6.5" strokeLinecap="round" />
        </svg>
        {tr.s6.reviewer}
      </M>

      {/* candidate annotations, one row per field */}
      <div className="absolute" style={{ ...head, left: 0 }}>{tr.s6.field}</div>
      <div className="absolute" style={{ ...head, left: 250 }}>Mistral</div>
      <div className="absolute" style={{ ...head, left: 560 }}>{tr.s6.status}</div>
      {FIELDS.map((f, i) => {
        const r = T.rows + i * 0.6
        const ok = T.verify + i * 0.2
        const flagged = i === FLAG
        return (
          <div key={f} className="absolute" style={{ left: -12, width: 792, top: 36 + i * ROW, height: ROW, borderTop: '1px solid var(--color-rule)' }}>
            {flagged && (
              <M className="absolute inset-0" style={{ background: 'var(--color-warn-soft)', borderLeft: '4px solid var(--color-warn)' }} t={[T.flag, T.flag + 0.8, T.verify, T.verify + 0.8]} o={[0, 1, 1, 0]} />
            )}
            <M className="absolute inset-0" t={[r, r + 0.8]} o={[0, 1]}>
              <span className="absolute flex items-center" style={{ left: 12, height: ROW, fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--color-blue)' }}>{f}</span>
              <span className="absolute flex items-center" style={{ left: 262, height: ROW, gap: 16, fontSize: 20 }}>
                <span className="relative">
                  {flagged ? (
                    <M as="span" t={[T.fix, T.fix + 0.8]} o={[1, 0.5]}>
                      {shown[f]}
                    </M>
                  ) : (
                    shown[f]
                  )}
                  {flagged && <M className="absolute" style={{ left: -2, right: -2, top: '52%', height: 2, background: 'var(--color-warn)' }} t={[T.fix, T.fix + 0.8]} o={[0, 1]} />}
                </span>
                {/* the reviewer's correction, typed from the source invoice */}
                {flagged && (
                  <M as="span" style={{ fontWeight: 600 }} t={[T.fix + 0.4, T.fix + 1.2]} o={[0, 1]} x={[-8, 0]}>
                    {money(lang, SAMPLE.total_amount)}
                  </M>
                )}
              </span>
              <Chip bg="var(--color-off)" fg="var(--color-ink-2)" t={flagged ? [T.flag, T.flag + 0.8] : [ok, ok + 0.8]} o={[1, 0]}>
                {tr.s6.candidate}
              </Chip>
            </M>
            {flagged && (
              <Chip bg="var(--color-warn)" fg="#fff" t={[T.flag, T.flag + 0.8, ok, ok + 0.8]} o={[0, 1, 1, 0]}>
                {tr.s6.review}
              </Chip>
            )}
            <Chip bg="var(--color-ok)" fg="#fff" t={[ok, ok + 0.8]} o={[0, 1]}>
              {tr.s6.verified}
            </Chip>
          </div>
        )
      })}

      {/* the verified invoice joins the curated dataset */}
      <M className="absolute" style={{ ...card, left: SIDE, right: 0, top: 0, height: 196 }} t={[T.dataset, T.dataset + 1]} o={[0, 1]} y={[8, 0]}>
        <div className="absolute" style={{ left: 18, top: 12, fontSize: 17, fontWeight: 600 }}>{tr.s6.dataset}</div>
        {['INV-2026-0039', 'INV-2026-0040', 'INV-2026-0041', SAMPLE.invoice_number].map((n, i) => {
          const row = (
            <>
              <Check size={16} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15 }}>{n}</span>
              <span style={{ marginLeft: 'auto', fontSize: 15, color: 'var(--color-ink-2)' }}>{tr.s6.fields}</span>
            </>
          )
          const style = { left: 18, right: 18, top: 46 + i * 34, height: 30, gap: 10 }
          return i < 3 ? (
            <div key={n} className="absolute flex items-center" style={{ ...style, opacity: 0.6 }}>{row}</div>
          ) : (
            <M key={n} className="absolute flex items-center" style={{ ...style, background: 'var(--color-blue-soft)', margin: '0 -8px', padding: '0 8px' }} t={[T.dataset + 1, T.dataset + 2]} o={[0, 1]} y={[8, 0]}>
              {row}
            </M>
          )
        })}
      </M>

      {/* dataset → LayoutLMv3 fine-tuning */}
      <M as="svg" className="absolute" style={{ left: SIDE + 202, top: 200 }} width={24} height={32} viewBox="0 0 24 32" t={[T.train, T.train + 0.8]} o={[0, 1]}>
        <path d="M12 0V28M4 20l8 8 8-8" fill="none" stroke="var(--color-ink-2)" strokeWidth={2} />
      </M>
      <M className="absolute" style={{ ...card, left: SIDE, right: 0, top: 236, height: 128 }} t={[T.train + 0.4, T.train + 1.4]} o={[0, 1]}>
        <div className="absolute" style={{ left: 18, top: 16, fontSize: 20, fontWeight: 600 }}>LayoutLMv3</div>
        <div className="absolute" style={{ left: 18, top: 48, fontSize: 16, color: 'var(--color-ink-2)' }}>{tr.s6.train}</div>
        <div className="absolute overflow-hidden" style={{ left: 18, right: 18, top: 92, height: 6, background: 'var(--color-off)' }}>
          <M className="absolute inset-0" style={{ background: 'var(--color-blue)' }} t={[T.train + 1.2, T.train + 4.4]} x={[-100, 0]} u="%" ease={linear} />
        </div>
      </M>
    </Step>
  )
}
