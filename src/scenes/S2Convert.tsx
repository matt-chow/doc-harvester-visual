import { FileIcon, Step } from '../components/Panel'
import { SAMPLE } from '../components/Invoice'
import { useT } from '../i18n'
import { M } from '../timeline'

/* Step 2 · Convert PDF to images: one PDF tile → one page-image tile. */

function Tile({ img, name, sub }: { img?: boolean; name: string; sub: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ border: '1px solid var(--color-rule)', background: '#faf9f8', gap: 18 }}>
      <FileIcon size={72} img={img} />
      <div style={{ fontSize: 20, fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 17, color: 'var(--color-ink-2)' }}>{sub}</div>
    </div>
  )
}

export function S2Convert() {
  const tr = useT()
  const tile = { top: 40, width: 300, height: 260 }
  return (
    <Step i={1} title="PDF → PNG">
      <div className="absolute" style={{ ...tile, left: 200 }}>
        <Tile name={`${SAMPLE.invoice_number}.pdf`} sub={tr.s2.pages} />
      </div>
      <M as="svg" className="absolute" style={{ left: 540, top: tile.top + tile.height / 2 - 12 }} width={168} height={24} viewBox="0 0 168 24" t={[23.4, 24.6]} o={[0, 1]}>
        <path d="M0 12H160M150 4l10 8-10 8" fill="none" stroke="var(--color-ink-2)" strokeWidth={2} />
      </M>
      <M className="absolute" style={{ ...tile, left: 748 }} t={[24.4, 25.8]} o={[0, 1]} x={[-16, 0]}>
        <Tile img name="page_01.png" sub={tr.s2.image} />
      </M>
    </Step>
  )
}
