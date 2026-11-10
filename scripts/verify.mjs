// Visual + playback verification. Usage: node scripts/verify.mjs [baseUrl] [--shots-only|--loop-only]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const base = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4173'
const only = process.argv.find((a) => a.startsWith('--'))
const TIMES = (process.env.TIMES ?? '0.2,1.2,2.5,4.9,6.4,8.0,9.8,11.3,13.5,15.8,18.0,20.4,22.0,24.5,27.5,29.9,32.7,33.9,35.2,37.6,39.0,40.4,42.4,43.4,44.6,45.8,47.0,48.6,50.3,51.5,52.6,54.6,57.0,58.9,59.6')
  .split(',')
  .map(Number)
const SIZES = (process.env.SIZES ?? '1920x1080,1366x768').split(',').map((s) => s.split('x').map(Number))

const browser = await chromium.launch()
let failed = false

if (only !== '--loop-only') {
  mkdirSync('shots', { recursive: true })
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    page.on('pageerror', (e) => ((failed = true), console.error('pageerror', e.message)))
    for (const t of TIMES) {
      await page.goto(`${base}/?t=${t}`)
      await page.waitForTimeout(250)
      await page.screenshot({ path: `shots/${w}-${t.toFixed(1).padStart(4, '0')}.png` })
    }
    await page.close()
  }
  console.log(`screenshots: ${TIMES.length * SIZES.length} written to shots/`)
}

if (only !== '--shots-only') {
  // 20× speed for 10 s ≈ 3.3 full loops; watch for errors and growth in DOM nodes / heap
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Performance.enable')
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]))
  await page.goto(`${base}/?rate=20`)
  await page.waitForTimeout(1500)
  const a = await metrics()
  await page.waitForTimeout(10000)
  const b = await metrics()
  // real-speed frame rate sample
  await page.goto(base)
  await page.waitForTimeout(800)
  const fps = await page.evaluate(
    () => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => (++n, performance.now() - s < 3000 ? requestAnimationFrame(f) : r((n / (performance.now() - s)) * 1000)); requestAnimationFrame(f) }),
  )
  const mb = (v) => (v / 1048576).toFixed(1) + 'MB'
  console.log(`loop: nodes ${a.Nodes} → ${b.Nodes}, listeners ${a.JSEventListeners} → ${b.JSEventListeners}, heap ${mb(a.JSHeapUsedSize)} → ${mb(b.JSHeapUsedSize)}, fps≈${fps.toFixed(0)} (headless)`)
  if (errors.length) ((failed = true), console.error('errors:', errors))
  if (b.Nodes > a.Nodes * 1.1 || b.JSEventListeners > a.JSEventListeners * 1.1) ((failed = true), console.error('growth detected across loops'))
}

await browser.close()
console.log(failed ? 'VERIFY FAILED' : 'VERIFY OK')
process.exit(failed ? 1 : 0)
