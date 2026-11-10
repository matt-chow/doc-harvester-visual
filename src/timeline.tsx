import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cubicBezier, interpolate, type EasingFunction } from 'motion'
import { useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { LangContext, LANGS, type Lang } from './i18n'
import { monotone } from './monotone'

/* One clock drives everything. A single accumulator (cycle seconds) advances on the frame loop
   unless paused; every element is a pure function of it, so nothing can drift or run independently.
   Scene keyframes are authored in "scene time" (0–60); WARP maps presentation time onto it,
   stretching transitions and inserting near-still holds after reveals rather than scaling uniformly. */

export const D = 102 // seconds per language pass
export const CYCLE = D * 2 // en-CA pass, then fr-CA pass

// [presentation s, scene s] — steep segments are motion, shallow ones are holds
const WARP: [number, number][] = [
  [0, 0], [0.8, 0.45], [3.6, 2.4], [6.0, 4.4], [9.0, 5.0], [11.0, 6.6], [13.0, 7.0],
  [16, 9], [18.6, 10.6], [20.4, 11], [22.8, 12.4], [25.2, 13.9], [26.6, 14.2], [28.6, 15.8], [30.2, 16.4], [33.6, 19.9], [36, 20.5],
  [38, 22], [41, 24.2], [42.6, 24.7], [45.4, 27.2], [47.2, 28.2], [49.6, 28.3], [52.6, 31.3], [56.2, 33.9], [58.6, 34.0],
  [60, 35], [62.6, 37.0], [63.6, 37.2], [65.6, 38.8], [67.4, 40.4], [68.6, 40.6], [70.4, 41.9], [73.4, 43.7], [74.4, 43.9], [77, 46.3], [79.2, 46.45],
  [80, 47], [82.6, 49.0], [83.4, 49.2], [86.2, 51.6], [88.2, 51.8], [90.6, 53.6], [92.6, 54.5], [94.4, 55.0], [96.4, 57.0], [99.4, 58.4],
  [D, 60],
]
export const warp = monotone(WARP)

/** start: presentation seconds; hold: settled scene-time frame shown under reduced motion */
export const SCENES = [
  { start: 0, hold: 4.9 },
  { start: 16, hold: 20.8 },
  { start: 38, hold: 33.95 },
  { start: 60, hold: 46.4 },
  { start: 80, hold: 56.9 },
] as const

export const inOut = cubicBezier(0.65, 0, 0.35, 1)
export const out = cubicBezier(0.16, 1, 0.3, 1)
export const inn = cubicBezier(0.6, 0, 0.9, 0.4)
export const linear = (v: number) => v

const params = new URLSearchParams(location.search)
// ?t=110 freezes a frame in cycle seconds (≥102 is the French pass); ?from=100 starts playing there; ?rate=10 speeds playback
const FREEZE = params.has('t') ? Number(params.get('t')) % CYCLE : null
const RATE = Number(params.get('rate')) || 1
const FROM = (Number(params.get('from')) || 0) % CYCLE
const langAt = (c: number): Lang => LANGS[c < D ? 0 : 1]

const Clock = createContext<MotionValue<number>>(null!)
/** scene time, for scene keyframes */
export const useClock = () => useContext(Clock)
/** Re-base M elements inside onto another time axis (presentation or cycle seconds). */
export const ClockScope = Clock.Provider

const Times = createContext<{ local: MotionValue<number>; cycle: MotionValue<number>; paused: boolean }>(null!)
export const useTimes = () => useContext(Times)

export function ClockProvider({ children }: { children: (lang: Lang) => ReactNode }) {
  const reduced = useReducedMotion()
  const acc = useRef(FREEZE ?? FROM)
  const cycle = useMotionValue(acc.current)
  const local = useTransform(cycle, (c) => c % D)
  const scene = useTransform(local, (s) => {
    if (!reduced) return warp(s)
    // reduced motion: hold each scene's settled frame instead of animating through it
    let i = SCENES.length - 1
    while (SCENES[i].start > s) i--
    return SCENES[i].hold
  })
  const [lang, setLang] = useState(langAt(acc.current))
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  const langRef = useRef(lang)

  useEffect(() => {
    if (FREEZE !== null) return
    let id = 0
    let last: number | undefined
    const tick = (now: number) => {
      // rAF's vsync frame time, not callback time (motion's frame loop reads performance.now(), whose
      // scheduling jitter showed up as uneven steps on fast movers); clamped so a backgrounded tab resumes in place
      const dt = last === undefined ? 0 : Math.min(now - last, 40)
      last = now
      if (!pausedRef.current) {
        acc.current = (acc.current + (dt / 1000) * RATE) % CYCLE
        cycle.set(acc.current)
        const l = langAt(acc.current)
        if (l !== langRef.current) setLang((langRef.current = l))
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [cycle])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (e.repeat) return
      pausedRef.current = !pausedRef.current
      setPaused(pausedRef.current)
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [])
  useEffect(() => void (document.documentElement.lang = lang), [lang])

  return (
    <Times.Provider value={{ local, cycle, paused }}>
      <LangContext.Provider value={lang}>
        <Clock.Provider value={scene}>{children(lang)}</Clock.Provider>
      </LangContext.Provider>
    </Times.Provider>
  )
}

type KF = readonly number[]
/** 'smooth': one monotone spline through all keyframes — velocity carries through intermediate keyframes
    instead of stopping at each, and still rests at holds, reversals and both ends. Times must strictly increase. */
type Ease = EasingFunction | EasingFunction[] | 'smooth'

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
    const f = (k?: KF) => (!k ? null : ease === 'smooth' ? monotone(t.map((ti, i) => [ti, k[i]]), true) : interpolate(t as number[], k as number[], { ease }))
    const fo = f(o), fx = f(x), fy = f(y), fs = f(s), fr = f(rot), fd = f(draw)
    const moves = fx || fy || fs || fr
    // HTML (and root <svg>) elements get their own compositor layer only across segments where they change,
    // promoted slightly early so the layer is rasterised before motion starts; otherwise every frame
    // re-rasterises the region beneath them (sheet shadows, grain). SVG children can't be layered.
    const layer = as === 'div' || as === 'span' || as === 'svg'
    const kfs = [o, x, y, s, rot].filter(Boolean) as KF[]
    const live = t.slice(1).flatMap((b, i) => (kfs.some((k) => k[i] !== k[i + 1]) ? [[t[i] - 0.3, b + 0.05]] : []))
    const hint = o ? (moves ? 'transform, opacity' : 'opacity') : 'transform'
    const w = { o: '', vis: '', tf: '', d: '', wc: '' }
    // writes only on change: static elements cost nothing per frame
    const set = (k: keyof typeof w, prop: 'opacity' | 'visibility' | 'transform' | 'strokeDashoffset' | 'willChange', v: string) => {
      if (w[k] !== v) el.style[prop] = w[k] = v
    }
    const apply = (v: number) => {
      if (fo) {
        const a = fo(v)
        set('o', 'opacity', String(a))
        set('vis', 'visibility', a < 0.002 ? 'hidden' : '')
      }
      if (moves)
        set('tf', 'transform', `translate(${fx ? fx(v) : 0}${u},${fy ? fy(v) : 0}${u}) scale(${fs ? fs(v) : 1}) rotate(${fr ? fr(v) : 0}deg)`)
      if (fd) set('d', 'strokeDashoffset', String(1 - fd(v)))
      if (layer) set('wc', 'willChange', live.some(([a, b]) => v >= a && v <= b) ? hint : '')
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
