/** Monotone cubic (Fritsch–Carlson) through the knots: the clock's speed changes continuously instead of
    jumping at each knot (piecewise-linear warping lurched every element in motion), and it never runs backwards. */
/** `rest`: start and end with zero velocity (keyframed motion), rather than continuing the end slopes (the clock). */
export function monotone(k: [number, number][], rest = false) {
  const n = k.length
  const h = k.slice(1).map(([x], i) => x - k[i][0])
  const s = k.slice(1).map(([, y], i) => (y - k[i][1]) / h[i])
  const m = k.map((_, i) => {
    if (i === 0) return rest ? 0 : s[0]
    if (i === n - 1) return rest ? 0 : s[n - 2]
    const [a, b] = [s[i - 1], s[i]]
    if (a * b <= 0) return 0
    const [w1, w2] = [2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]]
    return (w1 + w2) / (w1 / a + w2 / b)
  })
  return (x: number) => {
    if (x <= k[0][0]) return k[0][1]
    if (x >= k[n - 1][0]) return k[n - 1][1]
    let i = 0
    while (x > k[i + 1][0]) i++
    const u = (x - k[i][0]) / h[i]
    const [u2, u3] = [u * u, u * u * u]
    return (2 * u3 - 3 * u2 + 1) * k[i][1] + (u3 - 2 * u2 + u) * h[i] * m[i] + (-2 * u3 + 3 * u2) * k[i + 1][1] + (u3 - u2) * h[i] * m[i + 1]
  }
}
