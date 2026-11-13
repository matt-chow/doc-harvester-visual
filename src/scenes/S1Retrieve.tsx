import { Check, FileIcon, Step } from '../components/Panel'
import { useT } from '../i18n'
import { M } from '../timeline'

/* Step 1 · Retrieve document: the storage listing; the sample invoice is selected, then loaded. */

const FILES = [
  ['INV-2026-0039.pdf', '2026-11-03'],
  ['INV-2026-0040.pdf', '2026-11-05'],
  ['INV-2026-0041.pdf', '2026-11-07'],
  ['INV-2026-0042.pdf', '2026-11-10'],
  ['INV-2026-0043.pdf', '2026-11-12'],
]
const ROW = 58
const SEL = 3

export function S1Retrieve() {
  const tr = useT()
  const cols = { name: 0, type: 660, modified: 840 }
  const head = { fontSize: 15, fontWeight: 600, color: 'var(--color-ink-2)' }
  return (
    <Step i={0} title="Azure Blob Storage" sub="invoices/">
      <div className="absolute" style={{ ...head, left: cols.name + 48 }}>{tr.s1.name}</div>
      <div className="absolute" style={{ ...head, left: cols.type }}>{tr.s1.type}</div>
      <div className="absolute" style={{ ...head, left: cols.modified }}>{tr.s1.modified}</div>
      {FILES.map(([name, date], i) => {
        const top = 36 + i * ROW
        return (
          <div key={name} className="absolute" style={{ left: -12, right: -12, top, height: ROW, borderTop: '1px solid var(--color-rule)' }}>
            {i === SEL && (
              <M className="absolute inset-0" style={{ background: 'var(--color-blue-soft)', borderLeft: '4px solid var(--color-blue)' }} t={[4.6, 5.8]} o={[0, 1]} />
            )}
            <div className="absolute flex items-center" style={{ left: 12, top: 0, height: ROW, gap: 18, fontSize: 18 }}>
              <FileIcon />
              {name}
            </div>
            <div className="absolute flex items-center" style={{ left: cols.type + 12, top: 0, height: ROW, fontSize: 18, color: 'var(--color-ink-2)' }}>PDF</div>
            <div className="absolute flex items-center" style={{ left: cols.modified + 12, top: 0, height: ROW, fontSize: 18, color: 'var(--color-ink-2)' }}>{date}</div>
            {i === SEL && (
              <M className="absolute flex items-center" style={{ right: 24, top: 0, height: ROW, gap: 8, fontSize: 17, color: 'var(--color-ok)', fontWeight: 600 }} t={[9.0, 10.2]} o={[0, 1]}>
                <Check size={20} />
                {tr.s1.loaded}
              </M>
            )}
          </div>
        )
      })}
    </Step>
  )
}
