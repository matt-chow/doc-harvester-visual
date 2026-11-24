import {
  createContext,
  createElement,
  useContext,
  useEffect,
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
   Keyframes are authored directly in presentation seconds (0–D); the clock runs at constant speed. */

export const D = 124 // seconds per language pass
export const CYCLE = D * 2 // en-CA pass, then fr-CA pass

/** start: presentation seconds; hold: settled frame shown under reduced motion */
export const SCENES = [
  { start: 0, hold: 12 },
  { start: 20, hold: 32 },
  { start: 40, hold: 52 },
  { start: 60, hold: 72 },
  { start: 80, hold: 94 },
  { start: 100, hold: 119 },
] as const
/** content area clears here at the end of each pass, before the seam label appears */
export const CLEAR = [D - 3.4, D - 2.2]
/** [start, end] of scene i */
export const span = (i: number): [number, number] => [SCENES[i].start, SCENES[i + 1]?.start ?? D]

// soft in-out: low peak velocity, so slow fades and slides never appear to lurch
export const inOut = cubicBezier(0.45, 0, 0.55, 1)
export const out = cubicBezier(0.16, 1, 0.3, 1)
export const inn = cubicBezier(0.6, 0, 0.9, 0.4)
export const linear = (v: number) => v

const params = new URLSearchParams(location.search)
// ?t=110 freezes a frame in cycle seconds (≥124 is the French pass); ?from=100 starts playing there; ?rate=10 speeds playback
const FREEZE = params.has('t') ? Number(params.get('t')) % CYCLE : null
const RATE = Number(params.get('rate')) || 1
const FROM = (Number(params.get('from')) || 0) % CYCLE
const langAt = (c: number): Lang => LANGS[c < D ? 0 : 1]

const Clock = createContext<MotionValue<number>>(null!)
/** scene time, for scene keyframes */
export const useClock = () => useContext(Clock)
/** Re-base M elements inside onto another time axis (presentation or cycle seconds). */
export const ClockScope = Clock.Provider

export const SPEEDS = [1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

const Times = createContext<{
  local: MotionValue<number>
  cycle: MotionValue<number>
  paused: boolean
  speed: Speed
  togglePause: () => void
  setSpeed: (s: Speed) => void
  /** jump to the start of step i in the current language pass; play/pause state is kept */
  goTo: (i: number) => void
  /** jump to the other language at the same point in the pass; the en→fr loop carries on from there */
  switchLang: () => void
}>(null!)
export const useTimes = () => useContext(Times)

export function ClockProvider({ children }: { children: (lang: Lang) => ReactNode }) {
  const reduced = useReducedMotion()
  const acc = useRef(FREEZE ?? FROM)
  const cycle = useMotionValue(acc.current)
  const local = useTransform(cycle, (c) => c % D)
  const scene = useTransform(local, (s) => {
    if (!reduced) return s
    // reduced motion: hold each scene's settled frame instead of animating through it
    let i = SCENES.length - 1
    while (SCENES[i].start > s) i--
    return SCENES[i].hold
  })
  const [lang, setLang] = useState(langAt(acc.current))
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  // playback speed on top of ?rate=: the on-screen buttons, or keys 1 / 2 / 4
  const [speed, setSpeedState] = useState<Speed>(1)
  const speedRef = useRef<Speed>(1)
  const setSpeed = (s: Speed) => setSpeedState((speedRef.current = s))
  const togglePause = () => setPaused((pausedRef.current = !pausedRef.current))
  const goTo = (i: number) => {
    const n = Math.max(0, Math.min(SCENES.length - 1, i))
    acc.current = (acc.current < D ? 0 : D) + SCENES[n].start
    cycle.set(acc.current)
  }
  const switchLang = () => {
    acc.current = (acc.current + D) % CYCLE
    cycle.set(acc.current)
    // set here too: the frame loop only updates the language while playing
    setLang((langRef.current = langAt(acc.current)))
  }
  /** index of the step on screen now */
  const current = () => {
    let i = SCENES.length - 1
    while (SCENES[i].start > acc.current % D) i--
    return i
  }

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
        acc.current = (acc.current + (dt / 1000) * RATE * speedRef.current) % CYCLE
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
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const digit = Number(e.code.match(/^(?:Digit|Numpad)([124])$/)?.[1])
      if (digit) {
        // pressing the current speed again returns to 1× (so 2 still toggles double speed)
        if (!e.repeat) setSpeed(speedRef.current === digit && digit !== 1 ? 1 : (digit as Speed))
        return
      }
      // presentation navigation: arrows step between the six steps
      if (e.code === 'ArrowRight' || e.code === 'ArrowLeft' || e.code === 'PageDown' || e.code === 'PageUp') {
        e.preventDefault()
        const fwd = e.code === 'ArrowRight' || e.code === 'PageDown'
        // back from partway into a step restarts it; from its first seconds it goes to the previous step
        const i = current()
        goTo(fwd ? i + 1 : (acc.current % D) - SCENES[i].start > 2 ? i : i - 1)
        return
      }
      if (e.code === 'KeyL') {
        if (!e.repeat) switchLang()
        return
      }
      if (e.code !== 'Space') return
      // a focused control button handles Space itself, as a click
      if (e.target instanceof HTMLButtonElement) return
      e.preventDefault()
      if (!e.repeat) togglePause()
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [])
  useEffect(() => void (document.documentElement.lang = lang), [lang])

  return (
    <Times.Provider value={{ local, cycle, paused, speed, togglePause, setSpeed, goTo, switchLang }}>
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
