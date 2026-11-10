import {
  createContext,
  createElement,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cubicBezier, interpolate, type EasingFunction } from 'motion'
import { useReducedMotion, useTime, useTransform, type MotionValue } from 'motion/react'

/* One clock drives everything: every element is a pure function of loop time t (seconds).
   No per-element timers exist, so loops can't drift or accumulate, and frame rate only affects smoothness. */

export const DURATION = 60

export const SCENES = [
  { start: 0, label: 'The problem', hold: 4.9 },
  { start: 9, label: 'The extraction', hold: 20.8 },
  { start: 22, label: 'The intelligence', hold: 33.95 },
  { start: 35, label: 'The research', hold: 46.4 },
  { start: 47, label: 'The outcome', hold: 56.9 },
] as const

export const inOut = cubicBezier(0.65, 0, 0.35, 1)
export const out = cubicBezier(0.16, 1, 0.3, 1)
export const inn = cubicBezier(0.6, 0, 0.9, 0.4)
export const linear = (v: number) => v

const params = new URLSearchParams(location.search)
// ?t=12.5 freezes the frame (used for screenshot verification); ?rate=10 speeds up playback (loop testing)
const FREEZE = params.has('t') ? Number(params.get('t')) : null
const RATE = Number(params.get('rate')) || 1

const Clock = createContext<MotionValue<number>>(null!)
export const useClock = () => useContext(Clock)

export function ClockProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const time = useTime()
  const t = useTransform(time, (ms) => {
    if (FREEZE !== null) return FREEZE % DURATION
    const s = ((ms / 1000) * RATE) % DURATION
    if (!reduced) return s
    // reduced motion: hold each scene's settled frame instead of animating through it
    let i = SCENES.length - 1
    while (SCENES[i].start > s) i--
    return SCENES[i].hold
  })
  return <Clock.Provider value={t}>{children}</Clock.Provider>
}

type KF = readonly number[]
type Ease = EasingFunction | EasingFunction[]

export interface MProps {
  t: KF
  o?: KF
  x?: KF
  y?: KF
  s?: KF
  rot?: KF
  /** stroke reveal 0..1 for SVG paths */
  draw?: KF
  ease?: Ease
  u?: 'px' | 'em' | '%'
  as?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
  [attr: string]: unknown
}

/** Keyframed element. `t` holds the times; each animated prop holds a value per time. */
export function M({ t, o, x, y, s, rot, draw, ease = inOut, u = 'px', as = 'div', style, children, ...rest }: MProps) {
  const clock = useClock()
  const ref = useRef<HTMLElement & SVGElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    const f = (k?: KF) => (k ? interpolate(t as number[], k as number[], { ease }) : null)
    const fo = f(o), fx = f(x), fy = f(y), fs = f(s), fr = f(rot), fd = f(draw)
    const moves = fx || fy || fs || fr
    const apply = (v: number) => {
      if (fo) {
        const a = fo(v)
        el.style.opacity = String(a)
        el.style.visibility = a < 0.002 ? 'hidden' : ''
      }
      if (moves)
        el.style.transform = `translate(${fx ? fx(v) : 0}${u},${fy ? fy(v) : 0}${u}) scale(${fs ? fs(v) : 1}) rotate(${fr ? fr(v) : 0}deg)`
      if (fd) el.style.strokeDashoffset = String(1 - fd(v))
    }
    apply(clock.get())
    return clock.on('change', apply)
    // keyframes are static per element; the closure is built once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock])
  const svg = as !== 'div' && as !== 'span'
  return createElement(
    as,
    {
      ref,
      ...(draw ? { pathLength: 1, strokeDasharray: '1 1' } : null),
      style: svg ? { transformBox: 'fill-box', transformOrigin: 'center', ...style } : style,
      ...rest,
    },
    children,
  )
}

/** Masked word-by-word reveal; words rise in at `at`, and lift out at `end`. */
export function Words({
  lines,
  at,
  end,
  step = 0.06,
  className,
  style,
}: {
  lines: string[]
  at: number
  end: number
  step?: number
  className?: string
  style?: CSSProperties
}) {
  let i = 0
  return (
    <div className={className} style={style}>
      {lines.map((line, li) => (
        <div key={li} className="whitespace-nowrap">
          {line.split(' ').map((w, wi) => {
            const k = i++
            const a = at + k * step
            const e = end + k * step * 0.4
            return (
              <span key={wi} className="inline-block overflow-hidden align-top" style={{ padding: '0.08em 0.02em 0.16em', margin: '-0.08em -0.02em -0.16em' }}>
                <M as="span" className="inline-block" t={[a, a + 1.1, e, e + 0.7]} y={[1.8, 0, 0, -1.8]} u="em" ease={[out, linear, inOut]}>
                  {w}
                  {' '}
                </M>
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** SVG stroke that draws on; dashed strokes are revealed through a drawn mask so the dash pattern survives. */
export function Stroke({
  d,
  t,
  draw,
  o,
  dashed,
  color = 'var(--color-ink)',
  width = 1.5,
  ease,
}: {
  d: string
  t: KF
  draw: KF
  o?: KF
  dashed?: boolean
  color?: string
  width?: number
  ease?: Ease
}) {
  const id = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '')
  if (!dashed)
    return <M as="path" d={d} t={t} draw={draw} o={o} ease={ease} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
  return (
    <g>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
        <M as="path" d={d} t={t} draw={draw} ease={ease} fill="none" stroke="#fff" strokeWidth={width + 6} />
      </mask>
      <M as="path" d={d} t={t} o={o ?? t.map(() => 1)} ease={ease} mask={`url(#${id})`} fill="none" stroke={color} strokeWidth={width} strokeDasharray="5 6" />
    </g>
  )
}

/** Small mono tag. */
export function Tag({ children, color = 'var(--color-ink-2)', className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={`label ${className}`} style={{ color }}>
      {children}
    </span>
  )
}
