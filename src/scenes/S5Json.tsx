import { Check, Step } from '../components/Panel'
import { FIELDS, SAMPLE } from '../components/Invoice'
import { useT } from '../i18n'
import { M } from '../timeline'

/* Step 5 · Return JSON: the response body, three validation checks, then the HTTP status. */

// JSON values are locale-neutral; only the labels around them are translated
const JSON_LINES = ['{', ...FIELDS.map((f, i) => `  "${f}": ${f === 'total_amount' ? SAMPLE[f].toFixed(2) : `"${SAMPLE[f]}"`}${i < 3 ? ',' : ''}`), '}']

export function S5Json() {
  const tr = useT()
  return (
    <Step i={4} title="FastAPI" sub={`${tr.s5.response} · application/json`}>
      <div className="absolute" style={{ left: 0, right: 0, top: 0, height: 196, background: '#faf9f8', border: '1px solid var(--color-rule)' }}>
        {JSON_LINES.map((l, i) => (
          <div key={i} className="absolute whitespace-pre" style={{ left: 20, top: 14 + i * 28, fontFamily: 'var(--font-mono)', fontSize: 19, lineHeight: '28px' }}>
            {l}
          </div>
        ))}
      </div>
      {tr.s5.checks.map((c, i) => (
        <M key={c} className="absolute flex items-center" style={{ left: 0, top: 220 + i * 40, gap: 12, fontSize: 19 }} t={[84.4 + i * 1.2, 85.4 + i * 1.2]} o={[0, 1]}>
          <Check />
          {c}
        </M>
      ))}
      <M className="absolute flex items-center" style={{ right: 0, top: 260, height: 40, padding: '0 18px', background: 'var(--color-ok)', color: '#fff', fontSize: 18, fontWeight: 600 }} t={[88.6, 89.8]} o={[0, 1]}>
        200 OK
      </M>
    </Step>
  )
}
