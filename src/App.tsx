import { useLayoutEffect, useState } from 'react'
import { Chrome, PauseIndicator, Seam } from './components/Chrome'
import { Hero } from './components/Hero'
import { PanelFrame } from './components/Panel'
import { S1Retrieve } from './scenes/S1Retrieve'
import { S2Convert } from './scenes/S2Convert'
import { S3Ocr } from './scenes/S3Ocr'
import { S4Extract } from './scenes/S4Extract'
import { S5Json } from './scenes/S5Json'
import { ClockProvider } from './timeline'

/* A fixed 1920×1080 stage, scaled to fit any viewport; the page gray fills the letterbox. */
export default function App() {
  const [k, setK] = useState(1)
  useLayoutEffect(() => {
    const fit = () => setK(Math.min(innerWidth / 1920, innerHeight / 1080))
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  return (
    <div className="fixed inset-0 overflow-hidden bg-bg">
      <div className="absolute overflow-hidden bg-bg" style={{ width: 1920, height: 1080, left: '50%', top: '50%', marginLeft: -960, marginTop: -540, transform: `scale(${k})` }}>
        <ClockProvider>
          {(lang) => (
            <>
              {/* one scene tree for both languages; it remounts at the seam, while the content area is empty */}
              <div key={lang} className="contents">
                <Chrome />
                <PanelFrame />
                <Hero />
                <S1Retrieve />
                <S2Convert />
                <S3Ocr />
                <S4Extract />
                <S5Json />
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
