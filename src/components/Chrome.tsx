import { translations, useT } from '../i18n'
import { ClockScope, CYCLE, D, linear, M, SCENES, span, useTimes } from '../timeline'

/* The app frame: black app bar, blue header with the step title, a callout with what/why,
   and a five-step tracker. The frame itself never moves; only text inside it fades. */

export const LAYOUT = { header: 48, headerH: 140, top: 236, bottom: 712, callout: 772, stepper: 904 }
const X0 = 96
const W = 1920 - X0 * 2
const STEP_W = (W - 16 * (SCENES.length - 1)) / SCENES.length
// the frame's per-scene text fades in after the previous scene's has gone; nothing cross-dissolves in place
const textIn = (i: number, lag = 0) => {
  const [s, e] = span(i)
  return { t: [s + 0.4 + lag, s + 1.6 + lag, e - 1.2, e], o: [0, 1, 1, 0], y: [8, 0, 0, 0] }
}

function Waffle() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18">
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={c * 7} y={r * 7} width={4} height={4} fill="#fff" />))}
    </svg>
  )
}

export function Chrome() {
  const tr = useT()
  const { local } = useTimes()
  return (
    <ClockScope value={local}>
      {/* app bar */}
      <div className="absolute flex items-center" style={{ left: 0, top: 0, width: 1920, height: LAYOUT.header, background: '#000', color: '#fff', padding: '0 24px', gap: 20 }}>
        <Waffle />
        <span style={{ fontSize: 17, fontWeight: 600 }}>Doc-Harvester</span>
        <span style={{ fontSize: 15, color: '#c8c6c4' }}>{tr.app.subtitle}</span>
        <span className="ml-auto flex items-center" style={{ height: 32, padding: '0 16px', gap: 8, background: 'var(--color-green)', borderRadius: 2, fontSize: 14, fontWeight: 600 }}>
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth={1.2}>
            <circle cx={7} cy={7} r={6} />
            <path d="M1 7h12M7 1c-2 2-2 10 0 12M7 1c2 2 2 10 0 12" />
          </svg>
          {tr.language}
        </span>
      </div>

      {/* blue header strip */}
      <div className="absolute" style={{ left: 0, top: LAYOUT.header, width: 1920, height: LAYOUT.headerH, background: 'var(--color-blue)', color: '#fff' }}>
        {tr.steps.map((st, i) => (
          <M key={i} className="absolute" style={{ left: X0, top: 26 }} {...textIn(i)}>
            <div style={{ fontSize: 17, opacity: 0.85 }}>{tr.app.step(i + 1)}</div>
            <div style={{ fontSize: 44, fontWeight: 600, lineHeight: 1.2, marginTop: 2 }}>{st.title}</div>
          </M>
        ))}
        <div className="absolute overflow-hidden" style={{ left: 0, right: 0, bottom: 0, height: 4, background: 'rgb(255 255 255 / 0.25)' }}>
          {/* fades out as the pass ends, so the bar never snaps from full back to empty at the seam */}
          <M className="absolute inset-0" t={[D - 1.4, D - 0.3]} o={[1, 0]}>
            <M className="absolute inset-0" data-progress style={{ background: '#fff' }} t={[0, D]} x={[-100, 0]} u="%" ease={linear} />
          </M>
        </div>
      </div>

      {/* what / why callout */}
      <div className="panel absolute" style={{ left: X0, top: LAYOUT.callout, width: W, height: 104, borderLeft: '4px solid var(--color-blue)' }}>
        <svg className="absolute" style={{ left: 28, top: 22 }} width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={1.6}>
          <circle cx={12} cy={12} r={10.5} />
          <path d="M12 10.5V17M12 7v.5" strokeLinecap="round" />
        </svg>
        {tr.steps.map((st, i) => (
          <div key={i}>
            <M className="absolute whitespace-nowrap" style={{ left: 72, top: 16, fontSize: 25, color: 'var(--color-ink)' }} {...textIn(i, 0.4)}>
              {st.desc}
            </M>
            <M className="absolute whitespace-nowrap" style={{ left: 72, top: 56, fontSize: 20, color: 'var(--color-ink-2)' }} {...textIn(i, 0.9)}>
              {st.help}
            </M>
          </div>
        ))}
      </div>

      {/* step tracker: gray = upcoming (disabled), blue = current, white with check = done */}
      {tr.steps.map((st, i) => {
        const [s, e] = span(i)
        const last = i === SCENES.length - 1
        const card = { className: 'absolute inset-0 flex items-center', style: { padding: '0 20px', gap: 14, fontSize: 19, borderRadius: 2 } }
        const num = (bg: string, fg: string, mark = String(i + 1)) => (
          <span className="grid place-items-center rounded-full" style={{ width: 30, height: 30, background: bg, color: fg, fontSize: 15, fontWeight: 600, flex: 'none' }}>
            {mark}
          </span>
        )
        return (
          <div key={i} className="absolute" style={{ left: X0 + i * (STEP_W + 16), top: LAYOUT.stepper, width: STEP_W, height: 72 }}>
            <div {...card} style={{ ...card.style, background: 'var(--color-off)', color: 'var(--color-off-ink)' }}>
              {num('#fff', 'var(--color-off-ink)')}
              {st.short}
            </div>
            {!last && (
              <M {...card} style={{ ...card.style, background: '#fff', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }} t={[e - 0.8, e + 0.4, D - 1.4, D - 0.4]} o={[0, 1, 1, 0]}>
                {num('var(--color-ok)', '#fff', '✓')}
                {st.short}
              </M>
            )}
            <M {...card} style={{ ...card.style, background: 'var(--color-blue)', color: '#fff', fontWeight: 600 }} t={last ? [s + 0.2, s + 1.2, D - 1.4, D - 0.4] : [s + 0.2, s + 1.2, e - 0.8, e + 0.4]} o={[0, 1, 1, 0]}>
              {num('#fff', 'var(--color-blue)')}
              {st.short}
            </M>
          </div>
        )
      })}

      <div className="absolute" style={{ left: X0, top: 1010, fontSize: 14, color: 'var(--color-ink-2)', fontWeight: 600 }}>
        {tr.tag}
      </div>
      <div className="absolute" style={{ right: X0, top: 1010, fontSize: 14, color: 'var(--color-ink-3)' }}>
        {tr.app.footnote}
      </div>
    </ClockScope>
  )
}

/** Names the next language pass while the content area is empty; lives outside the per-language remount. */
export function Seam() {
  const { cycle } = useTimes()
  const label = 'absolute text-center whitespace-nowrap'
  const at = { left: 960 - 300, top: (LAYOUT.top + LAYOUT.bottom) / 2 - 18, width: 600, fontSize: 28, color: 'var(--color-ink-2)' }
  return (
    <ClockScope value={cycle}>
      <M className={label} style={at} t={[D - 1.8, D - 0.6, D + 0.6, D + 1.6]} o={[0, 1, 1, 0]}>
        {translations['fr-CA'].seam}
      </M>
      {/* the English label spans the wrap from the end of the cycle back to 0 */}
      <M className={label} style={at} t={[0, 0.6, 1.6, CYCLE - 1.8, CYCLE - 0.6, CYCLE]} o={[1, 1, 0, 0, 1, 1]}>
        {translations['en-CA'].seam}
      </M>
    </ClockScope>
  )
}

/** Shown only while Space has paused the clock, or while 2 has doubled its speed. A CSS fade; the clock itself is stopped. */
export function PauseIndicator() {
  const { paused, fast } = useTimes()
  const tr = useT()
  const at = { left: X0 + 72, top: 1010, fontSize: 14, transition: 'opacity 420ms ease' }
  return (
    <>
      <div className="absolute flex items-center gap-2" style={{ ...at, color: 'var(--color-ink-2)', opacity: paused ? 1 : 0 }} aria-live="polite">
        <span style={{ width: 8, height: 11, borderLeft: '3px solid var(--color-blue)', borderRight: '3px solid var(--color-blue)' }} />
        {paused ? tr.controls.paused : ''}
      </div>
      <div className="absolute" style={{ ...at, color: 'var(--color-blue)', fontWeight: 600, opacity: fast && !paused ? 1 : 0 }}>
        2×
      </div>
    </>
  )
}
