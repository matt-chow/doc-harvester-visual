import { Step } from '../components/Panel'
import { useLines, type Line } from '../components/Invoice'
import { useT } from '../i18n'
import { M } from '../timeline'

/* Step 3 · Run OCR: the invoice's own lines, read top-to-bottom, appear as plain text. */

export function S3Ocr() {
  const tr = useT()
  const lines = useLines()
  // group invoice lines into text rows (same baseline within a few px), left to right
  const rows: Line[][] = []
  let lastY = -100
  for (const l of [...lines].sort((a, b) => a.y - b.y)) {
    if (l.y - lastY > 12) rows.push([])
    rows.at(-1)!.push(l)
    lastY = l.y
  }
  return (
    <Step i={2} title="Tesseract OCR" sub={tr.s3.output}>
      <div className="absolute inset-0" style={{ background: '#faf9f8', border: '1px solid var(--color-rule)' }} />
      {rows.map((r, i) => (
        <M key={i} className="absolute whitespace-pre" style={{ left: 20, top: 12 + i * 19, fontFamily: 'var(--font-mono)', fontSize: 15, lineHeight: '19px', color: 'var(--color-ink)' }} t={[43.4 + i * 0.25, 44.2 + i * 0.25]} o={[0, 1]}>
          {r.sort((a, b) => a.x - b.x).map((l) => l.text).join('   ')}
        </M>
      ))}
    </Step>
  )
}
