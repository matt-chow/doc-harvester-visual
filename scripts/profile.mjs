// Real-time playback profile. Usage: node scripts/profile.mjs [baseUrl] [--full]
// Per window: frame pacing (rAF deltas), long animation frames (script / style+layout), and motion smoothness:
// kinks: frames where a visible element's velocity changes far more than on the frames around it (lurches, snaps).
import { chromium } from 'playwright'

const base = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4173'
const full = process.argv.includes('--full')
const SIZES = (process.env.SIZES ?? '1920x1080,1366x768').split(',').map((s) => s.split('x').map(Number))
// [cycle start s, seconds] — each scene, the language seam and the cycle end; --full plays one whole bilingual cycle
const WINDOWS = full
  ? [[0, 204]]
  : [[0.5, 19], [19, 20], [39, 20], [59, 20], [79, 21], [99.5, 5], [102, 14], [201.5, 5]]

const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-unsafe-swiftshader'] })
for (const [w, h] of SIZES) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  if (w === SIZES[0][0]) console.log('renderer:', await page.evaluate(() => {
    const g = document.createElement('canvas').getContext('webgl')
    const x = g?.getExtension('WEBGL_debug_renderer_info')
    return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'n/a'
  }))
  const all = []
  for (const [from, secs] of WINDOWS) {
    await page.goto(`${base}/?from=${from}`)
    await page.waitForTimeout(300)
    const r = await page.evaluate(
      (ms) =>
        new Promise((done) => {
          const loaf = []
          const po = new PerformanceObserver((l) => loaf.push(...l.getEntries().map((e) => ({ d: e.duration, s: e.scripts.reduce((a, x) => a + x.duration, 0), l: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0 }))))
          try { po.observe({ type: 'long-animation-frame', buffered: false }) } catch {}
          const deltas = []
          const stalls = []
          const who = []
          const prev = new Map() // element → { x, y, v: [vx, vy], dv: [|Δv| two frames ago, |Δv| last frame] }
          let kinks = 0, maxKink = 0, last = performance.now()
          const t0 = last
          const at = () => { const el = document.querySelector('[data-progress]'); return el ? (((parseFloat(el.style.transform.slice(10)) + 100) / 100) * 102).toFixed(1) : '?' }
          const frame = (now) => {
            const dt = (now - last) / 1000
            last = now
            deltas.push(dt * 1000)
            if (dt > 0.1) stalls.push(`${(dt * 1000).toFixed(0)}ms@${document.documentElement.lang.slice(0, 2)} ${at()}s`)
            // only judge motion on evenly paced frames, so a dropped frame isn't counted as a lurch
            const even = dt > 0.012 && dt < 0.021
            for (const el of document.querySelectorAll('[style*="translate("]')) {
              const m = /translate\(([-\d.e]+)[a-z%]*,\s*([-\d.e]+)/.exec(el.style.transform)
              if (!m || el.style.visibility === 'hidden' || (el.style.opacity && +el.style.opacity < 0.05) || !el.checkVisibility({ opacityProperty: true })) { prev.delete(el); continue }
              const k = el.style.transform.includes('em') ? 40 : 1 // em-based word rises ≈ 40–60 px font
              const [x, y] = [m[1] * k, m[2] * k]
              const p = prev.get(el)
              if (!p || !even) { prev.set(el, { x, y }); continue }
              const v = [(x - p.x) / dt, (y - p.y) / dt]
              const dv = p.v ? Math.hypot(v[0] - p.v[0], v[1] - p.v[1]) : undefined
              // a kink: one frame's change in velocity far exceeds its neighbours' (a jump, not a fast ease)
              if (p.dv && p.dv[0] !== undefined && dv !== undefined) {
                const mid = p.dv[1]
                if (mid > 60 && mid > 3 * Math.max(p.dv[0], dv)) { kinks++; if (mid > maxKink) maxKink = mid; who.push(`${at()}s ${mid.toFixed(0)}px/s ${(el.textContent.trim().slice(0, 24) || el.outerHTML.slice(0, 90)).replace(/\s+/g, ' ')}`) }
              }
              prev.set(el, { x, y, v, dv: [p.dv?.[1], dv] })
            }
            now - t0 < ms ? requestAnimationFrame(frame) : (po.disconnect(), done({ deltas, loaf, kinks, maxKink, stalls, who }))
          }
          requestAnimationFrame(frame)
        }),
      secs * 1000,
    )
    all.push(r)
    if (process.env.KINKS && r.who.length) console.log(r.who.join('\n'))
    const d = r.deltas.slice(1).sort((a, b) => a - b)
    const q = (p) => d[Math.floor(p * (d.length - 1))].toFixed(1)
    const dropped = d.filter((x) => x > 25).length
    const lf = r.loaf.filter((e) => e.d > 50)
    console.log(
      `${w}  ${String(from).padStart(5)}+${secs}s  fps ${(1000 / (d.reduce((a, b) => a + b, 0) / d.length)).toFixed(1)}  p50 ${q(0.5)} p95 ${q(0.95)} p99 ${q(0.99)} max ${q(1)} ms  dropped ${dropped}/${d.length}` +
        `  LoAF>50ms ${lf.length}${lf.length ? ` (max ${Math.max(...lf.map((e) => e.d)).toFixed(0)} ms, script ${Math.max(...lf.map((e) => e.s)).toFixed(0)}, style+layout ${Math.max(...lf.map((e) => e.l)).toFixed(0)})` : ''}` +
        `  kinks ${r.kinks} (max ${r.maxKink.toFixed(0)} px/s)` + (r.stalls.length ? `  stalls: ${r.stalls.join(', ')}` : ''),
    )
  }
  const d = all.flatMap((r) => r.deltas.slice(1))
  console.log(`${w}  total: fps ${(1000 / (d.reduce((a, b) => a + b, 0) / d.length)).toFixed(1)}, dropped ${d.filter((x) => x > 25).length}/${d.length}, kinks ${all.reduce((a, r) => a + r.kinks, 0)}`)
  await page.close()
}
await browser.close()
