import { Step } from '../components/Panel'
import { FIELDS, SAMPLE, type Field } from '../components/Invoice'
import { money, useLang, useT } from '../i18n'
import { M } from '../timeline'

/* Step 4 · Extract invoice fields: Mistral returns the four fields, one row per field,
   in step with the highlights appearing on the invoice. */

const ROW = 72

export function S4Extract() {
  const tr = useT()
  const lang = useLang()
  const shown: Record<Field, string> = { ...SAMPLE, total_amount: money(lang, SAMPLE.total_amount) }
  const head = { fontSize: 15, fontWeight: 600, color: 'var(--color-ink-2)' }
  return (
    <Step i={3} title="Mistral" sub={tr.s4.output}>
      <div className="absolute" style={{ ...head, left: 0 }}>{tr.s4.field}</div>
      <div className="absolute" style={{ ...head, left: 440 }}>{tr.s4.value}</div>
      {FIELDS.map((f, i) => (
        <div key={f} className="absolute" style={{ left: 0, right: 0, top: 36 + i * ROW, height: ROW, borderTop: '1px solid var(--color-rule)' }}>
          <M className="absolute inset-0 flex items-center" t={[63.4 + i * 1.2, 64.4 + i * 1.2]} o={[0, 1]}>
            <span style={{ width: 440, fontFamily: 'var(--font-mono)', fontSize: 19, color: 'var(--color-blue)' }}>{f}</span>
            <span style={{ fontSize: 22 }}>{shown[f]}</span>
          </M>
        </div>
      ))}
    </Step>
  )
}
