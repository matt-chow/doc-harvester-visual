import { DURATION, linear, M, SCENES } from '../timeline'

/* Editorial frame: masthead, scene counter, and a hairline progress rule. */
export function Chrome() {
  return (
    <>
      <div className="absolute label flex gap-3" style={{ left: 72, top: 44, fontSize: 13 }}>
        <span className="text-ink">Doc-Harvester</span>
        <span className="text-ink-3">Research notes · document intelligence</span>
      </div>
      <div className="absolute overflow-hidden label text-right" style={{ right: 72, top: 44, width: 400, height: 20, fontSize: 13 }}>
        {SCENES.map((s, i) => {
          const end = SCENES[i + 1]?.start ?? DURATION
          return (
            <M key={i} className="absolute right-0 top-0 whitespace-nowrap" t={[s.start, s.start + 0.6, end - 0.5, end - 0.01]} y={[22, 0, 0, -22]} o={[0, 1, 1, 0]}>
              <span className="text-terra">0{i + 1}</span>
              <span className="text-ink-3"> / 05 — </span>
              <span className="text-ink">{s.label}</span>
            </M>
          )
        })}
      </div>
      <div className="absolute" style={{ left: 72, right: 72, top: 1030, height: 1, background: 'var(--color-rule)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <M className="absolute inset-0" style={{ background: 'var(--color-ink)' }} t={[0, DURATION]} x={[-100, 0]} u="%" ease={linear} />
        </div>
        {SCENES.map((s, i) => (
          <div key={i} className="absolute" style={{ left: `${(s.start / DURATION) * 100}%`, top: -4, width: 1, height: 9, background: 'var(--color-ink-3)' }} />
        ))}
      </div>
      <div className="absolute label text-ink-3" style={{ right: 72, top: 1044, fontSize: 11 }}>
        Illustrative visualization · fictional sample data
      </div>
    </>
  )
}
