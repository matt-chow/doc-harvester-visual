// Visual + playback verification. Usage: node scripts/verify.mjs [baseUrl] [--shots-only|--loop-only]
// Times are presentation seconds within one language pass; each is shot in both languages.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { translations } from '../src/i18n.ts'
import { monotone } from '../src/monotone.ts'

const D = 102
const CYCLE = D * 2
const base = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4173'
const only = process.argv.find((a) => a.startsWith('--'))
const TIMES = (process.env.TIMES ?? '1,4,7,12,19.5,21,24,30,42,47,55,62,67,75,82,86,92,100.8')
  .split(',')
  .map(Number)
const LANGS = (process.env.LANGS ?? 'en-CA,fr-CA').split(',')
const SIZES = (process.env.SIZES ?? '1920x1080,1366x768').split(',').map((s) => s.split('x').map(Number))

let failed = false
const fail = (...m) => ((failed = true), console.error('FAIL', ...m))
const ok = (...m) => console.log('ok  ', ...m)

// --- warp: monotone cubic must hit every knot, never run backwards, and change speed continuously
{
  const K = [[0, 0], [3, 2.4], [6, 2.5], [8, 5], [10, 5.05], [12, 9]]
  const f = monotone(K)
  const hits = K.every(([x, y]) => Math.abs(f(x) - y) < 1e-9)
  let back = false, maxJump = 0
  // stop a step short of the last knot: past it the spline clamps flat, which is intended
  for (let x = 0, p = f(0), v = 0; x < 11.998; x += 0.001) {
    const q = f(x + 0.001), nv = (q - p) / 0.001
    if (q < p - 1e-12) back = true
    if (x > 0.001) maxJump = Math.max(maxJump, Math.abs(nv - v))
    ;[p, v] = [q, nv]
  }
  hits && !back && maxJump < 0.02 ? ok(`warp spline: passes every knot, monotone, max speed step ${maxJump.toFixed(4)} per ms`) : fail('warp spline', { hits, back, maxJump })
}

const browser = await chromium.launch()

if (only !== '--loop-only') {
  mkdirSync('shots', { recursive: true })
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    page.on('pageerror', (e) => fail('pageerror', e.message))
    for (const lang of LANGS)
      for (const t of TIMES) {
        await page.goto(`${base}/?t=${t + (lang === 'fr-CA' ? D : 0)}`)
        await page.waitForTimeout(250)
        await page.screenshot({ path: `shots/${w}-${lang.slice(0, 2)}-${t.toFixed(1).padStart(5, '0')}.png` })
      }
    await page.close()
  }
  console.log(`screenshots: ${TIMES.length * LANGS.length * SIZES.length} written to shots/`)
}

if (only !== '--shots-only') {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  // presentation seconds within the current pass, read back from the progress rule
  const local = () => page.$eval('[data-progress]', (el, d) => ((parseFloat(el.style.transform.slice(10)) + 100) / 100) * d, D)
  const lang = () => page.evaluate(() => document.documentElement.lang)
  const space = () => page.keyboard.press('Space')
  const indicator = () => page.$eval('[aria-live]', (el) => [getComputedStyle(el).opacity, el.textContent])

  // --- localization: the whole scene tree for each language contains no strings from the other one
  const strings = (o) => (typeof o === 'string' ? [o] : Object.values(o).flatMap(strings))
  const [en, fr] = [strings(translations['en-CA']), strings(translations['fr-CA'])]
  const seam = [translations['en-CA'].seam, translations['fr-CA'].seam]
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const has = (text, s) => new RegExp(`(?<![\\p{L}_])${esc(s)}(?![\\p{L}_])`, 'u').test(text)
  const foreign = (text, own, other) => other.filter((s) => !own.includes(s) && !seam.includes(s) && has(text, s))
  const textOf = () => page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '))
  const KEYS = ['invoice_number', 'invoice_date', 'vendor_name', 'total_amount']
  for (const [l, own, other, t] of [['en-CA', en, fr, 30], ['fr-CA', fr, en, D + 30]]) {
    await page.goto(`${base}/?t=${t}`)
    await page.waitForTimeout(400)
    const text = await textOf()
    const leaks = foreign(text, own, other)
    const missing = own.filter((s) => !seam.includes(s) && !text.includes(s.replace(/\s+/g, ' ')))
    const keys = KEYS.filter((k) => !text.includes(k))
    const stale = ['"date"', '"amount"', '"client"', '"recipient"', 'NS-0417', 'Northstar Inc.'].filter((s) => text.includes(s))
    if (leaks.length || keys.length || stale.length) fail(l, { leaks, keys, stale })
    else ok(`${l}: no strings from the other language, all four field keys present, no legacy field names`)
    if (missing.length) console.log(`note ${l}: dictionary strings not found verbatim in DOM:`, missing)
    if ((await lang()) !== l) fail('html lang', await lang(), '≠', l)
  }

  // --- cursor stays visible
  const hidden = await page.evaluate(() => [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).cursor === 'none').length)
  hidden ? fail(`${hidden} elements with cursor:none`) : ok('no element hides the cursor')

  // --- pause / resume at real speed
  await page.goto(`${base}/?from=20`)
  await page.waitForTimeout(1200)
  await space()
  const p0 = await local()
  const scroll = await page.evaluate(() => scrollY)
  await page.waitForTimeout(450)
  const ind = await indicator()
  await page.waitForTimeout(1500)
  const p1 = await local()
  p0 === p1 ? ok(`paused: frame held at ${p0.toFixed(3)} s for 2 s`) : fail('paused clock moved', p0, p1)
  ind[0] === '1' && ind[1].includes('Paused') ? ok('pause indicator shown:', ind[1].trim()) : fail('indicator', ind)
  scroll === 0 ? ok('Space did not scroll the page') : fail('page scrolled', scroll)
  await space()
  await page.waitForTimeout(1000)
  const p2 = await local()
  p2 - p1 > 0.8 && p2 - p1 < 1.25 ? ok(`resumed from the same frame (+${(p2 - p1).toFixed(2)} s after 1 s)`) : fail('resume', p1, p2)
  await page.waitForTimeout(500)
  ;(await indicator())[0] === '0' ? ok('indicator faded out on resume') : fail('indicator still visible')

  // --- drift: many pause/resume toggles; advance must equal unpaused wall time
  {
    await space()
    const a = await local()
    let run = 0
    for (let i = 0; i < 8; i++) {
      await space()
      const s = Date.now()
      await page.waitForTimeout(300)
      await space()
      run += Date.now() - s
      await page.waitForTimeout(250)
    }
    const b = await local()
    await space()
    const err = Math.abs(b - a - run / 1000)
    err < 0.25 ? ok(`drift after 8 pause/resume cycles: ${err.toFixed(3)} s`) : fail('drift', { advanced: b - a, expected: run / 1000 })
  }

  // --- pause across a scene change, the language change, and the end of the cycle
  for (const [from, label, before, after] of [
    [19.4, 'scene 1→2 transition', 'en-CA', 'en-CA'],
    [D - 1, 'en-CA→fr-CA transition', 'en-CA', 'fr-CA'],
    [CYCLE - 1, 'end of cycle', 'fr-CA', 'en-CA'],
  ]) {
    await page.goto(`${base}/?from=${from}`)
    await page.waitForTimeout(300)
    await space()
    const l0 = await lang()
    const a = await local()
    await page.waitForTimeout(2000)
    const [l1, b] = [await lang(), await local()]
    await space()
    await page.waitForTimeout(2000)
    const [l2, c] = [await lang(), await local()]
    const good = l0 === before && l1 === before && a === b && l2 === after && (after === before ? c > b : c < 3)
    good ? ok(`pause during ${label}: held ${before} at ${a.toFixed(2)} s, resumed into ${after} at ${c.toFixed(2)} s`) : fail(label, { l0, l1, l2, a, b, c })
  }

  // --- three full bilingual cycles at 60× (≈ 3.4 s each): language order, leaks after every switch, growth
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Performance.enable')
  // collect first: each language switch remounts the scene tree, leaving garbage that isn't a leak
  const metrics = async () => (await cdp.send('HeapProfiler.collectGarbage'), Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value])))
  await page.goto(`${base}/?rate=60`)
  await page.waitForTimeout(800)
  const m0 = await metrics()
  const seq = []
  const leaks = []
  const end = Date.now() + 11500
  while (Date.now() < end) {
    const [l, text] = await page.evaluate(() => [document.documentElement.lang, document.body.textContent.replace(/\s+/g, ' ')])
    if (seq.at(-1) !== l) {
      seq.push(l)
      leaks.push(...(l === 'fr-CA' ? foreign(text, fr, en) : foreign(text, en, fr)))
    }
    await page.waitForTimeout(100)
  }
  const m1 = await metrics()
  seq.length >= 6 && !leaks.length ? ok(`language passes: ${seq.join(' → ')}`) : fail('bilingual loop', seq, leaks)
  const mb = (v) => (v / 1048576).toFixed(1) + 'MB'
  console.log(`loop: nodes ${m0.Nodes} → ${m1.Nodes}, listeners ${m0.JSEventListeners} → ${m1.JSEventListeners}, heap ${mb(m0.JSHeapUsedSize)} → ${mb(m1.JSHeapUsedSize)}`)
  if (m1.Nodes > m0.Nodes * 1.1 || m1.JSEventListeners > m0.JSEventListeners * 1.1) fail('growth detected across loops')

  await page.goto(base)
  await page.waitForTimeout(800)
  const fps = await page.evaluate(
    () => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => (++n, performance.now() - s < 3000 ? requestAnimationFrame(f) : r((n / (performance.now() - s)) * 1000)); requestAnimationFrame(f) }),
  )
  console.log(`fps≈${fps.toFixed(0)} (headless)`)
  if (errors.length) fail('errors:', errors)
}

await browser.close()
console.log(failed ? 'VERIFY FAILED' : 'VERIFY OK')
process.exit(failed ? 1 : 0)
