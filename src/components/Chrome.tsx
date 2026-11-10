import { translations, useT } from '../i18n'
import { ClockScope, CYCLE, D, linear, M, SCENES, useTimes } from '../timeline'

/* Editorial frame: masthead, scene counter, and a hairline progress rule — all on presentation time. */
export function Chrome() {
  const tr = useT()
  const { local } = useTimes()
  return (
    <ClockScope value={local}>
      <div className="absolute label flex gap-3" style={{ left: 72, top: 44, fontSize: 13 }}>
        <span className="text-ink">Doc-Harvester</span>
        <span className="text-ink-3">{tr.chrome.notes}</span>
      </div>
      <div className="absolute overflow-hidden label text-right" style={{ right: 72, top: 44, width: 480, height: 20, fontSize: 13 }}>
        {SCENES.map((s, i) => {
          const end = SCENES[i + 1]?.start ?? D
          return (
            <M key={i} className="absolute right-0 top-0 whitespace-nowrap" t={[s.start, s.start + 0.9, end - 0.8, end - 0.01]} y={[22, 0, 0, -22]} o={[0, 1, 1, 0]}>
              <span className="text-terra">0{i + 1}</span>
              <span className="text-ink-3"> / 05 — </span>
              <span className="text-ink">{tr.chrome.scenes[i]}</span>
            </M>
          )
        })}
      </div>
      <div className="absolute" style={{ left: 72, right: 72, top: 1030, height: 1, background: 'var(--color-rule)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <M className="absolute inset-0" data-progress style={{ background: 'var(--color-ink)' }} t={[0, D]} x={[-100, 0]} u="%" ease={linear} />
        </div>
        {SCENES.map((s, i) => (
          <div key={i} className="absolute" style={{ left: `${(s.start / D) * 100}%`, top: -4, width: 1, height: 9, background: 'var(--color-ink-3)' }} />
        ))}
      </div>
      <div className="absolute label text-ink-3" style={{ left: 72, top: 1044, fontSize: 11 }}>
        <span className="text-ink-2">{tr.tag}</span>
      </div>
      <div className="absolute label text-ink-3" style={{ right: 72, top: 1044, fontSize: 11 }}>
        {tr.chrome.footnote}
      </div>
    </ClockScope>
  )
}

/** Names the next language pass as the seam dot holds; lives outside the per-language remount. */
export function Seam() {
  const { cycle } = useTimes()
  const label = 'absolute label text-terra text-center whitespace-nowrap'
  const at = { left: 1380 - 200, top: 560 + 34, width: 400, fontSize: 12, letterSpacing: '0.14em' }
  return (
    <ClockScope value={cycle}>
      <M className={label} style={at} t={[D - 2.0, D - 1.1, D + 0.9, D + 1.7]} o={[0, 1, 1, 0]} y={[6, 0, 0, -4]}>
        {translations['fr-CA'].seam}
      </M>
      {/* the English label spans the wrap from the end of the cycle back to 0 */}
      <M className={label} style={at} t={[0, 0.9, 1.7, CYCLE - 2.0, CYCLE - 1.1, CYCLE]} o={[1, 1, 0, 0, 1, 1]} y={[0, 0, -4, 6, 0, 0]}>
        {translations['en-CA'].seam}
      </M>
    </ClockScope>
  )
}

/** Discreet pause state, only shown while Space has paused the clock. A CSS fade; the clock itself is stopped. */
export function PauseIndicator() {
  const { paused } = useTimes()
  const tr = useT()
  return (
    <div className="absolute label flex items-center gap-2 text-ink-2" style={{ left: 72, top: 1044, marginLeft: 64, fontSize: 11, opacity: paused ? 1 : 0, transition: 'opacity 420ms cubic-bezier(.16,1,.3,1)' }} aria-live="polite">
      <span style={{ width: 7, height: 9, borderLeft: '2px solid var(--color-terra)', borderRight: '2px solid var(--color-terra)' }} />
      {paused ? tr.controls.paused : ''}
    </div>
  )
}
