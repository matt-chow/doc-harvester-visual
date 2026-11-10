import { useLayoutEffect, useState } from 'react'
import { Chrome, PauseIndicator, Seam } from './components/Chrome'
import { Dot, Hero } from './components/Hero'
import { S1Problem } from './scenes/S1Problem'
import { S2Extraction } from './scenes/S2Extraction'
import { S3Intelligence } from './scenes/S3Intelligence'
import { MistralNode, S4Research } from './scenes/S4Research'
import { S5Outcome } from './scenes/S5Outcome'
import { ClockProvider } from './timeline'

/* A fixed 1920×1080 stage, scaled to fit any viewport; the paper colour fills the letterbox. */
function Stage() {
  const [k, setK] = useState(1)
  useLayoutEffect(() => {
    const fit = () => setK(Math.min(innerWidth / 1920, innerHeight / 1080))
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  return (
    <div className="grain fixed inset-0 overflow-hidden bg-paper">
      <div className="absolute overflow-hidden" style={{ width: 1920, height: 1080, left: '50%', top: '50%', marginLeft: -960, marginTop: -540, transform: `scale(${k})` }}>
        <ClockProvider>
          {(lang) => (
            <>
              {/* one scene tree for both languages; it remounts at the seam dot (an empty frame),
                  so text-measured layouts are rebuilt for the new locale */}
              <div key={lang} className="contents">
                <S1Problem />
                <S3Intelligence />
                <S4Research />
                <Hero />
                <MistralNode />
                <S2Extraction />
                <S5Outcome />
                <Dot />
                <Chrome />
              </div>
              <Seam />
              <PauseIndicator />
            </>
          )}
        </ClockProvider>
      </div>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  useLayoutEffect(() => {
    // exact text metrics (OCR boxes, connectors) need the real fonts before first layout
    const faces = ['400 16px "Fraunces Variable"', 'italic 400 16px "Fraunces Variable"', '400 16px "Inter Variable"', '400 16px "JetBrains Mono Variable"']
    Promise.all(faces.map((f) => document.fonts.load(f)))
      .catch(() => undefined)
      .then(() => setReady(true))
  }, [])
  return ready ? <Stage /> : <div className="fixed inset-0 bg-paper" />
}
