import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from './theme'
import { pop } from './ui'

/** Deep navy backdrop with a slow-drifting blue glow and a faint dot grid. */
export const Backdrop = ({ glow = 'right' }: { glow?: 'left' | 'right' | 'center' }) => {
  const frame = useCurrentFrame()
  const drift = Math.sin(frame / 70) * 60
  const x = glow === 'left' ? 22 : glow === 'right' ? 78 : 50
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1000px 760px at calc(${x}% + ${drift}px) calc(42% + ${drift / 3}px), rgba(37,99,235,0.34), transparent 70%), radial-gradient(700px 500px at ${100 - x}% 100%, rgba(168,85,247,0.12), transparent 70%), linear-gradient(180deg, ${C.bg}, ${C.bgDeep})`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          backgroundPosition: `0 ${-frame * 0.4}px`,
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />
    </AbsoluteFill>
  )
}

/** A phone showing one of the real mobile screenshots. */
export const Phone = ({ src, delay = 0 }: { src: string; delay?: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = pop(frame, delay, fps)
  const w = 360
  return (
    <div
      style={{
        width: w + 24,
        padding: 12,
        borderRadius: 56,
        background: '#0d1426',
        boxShadow: '0 50px 110px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12), inset 0 0 0 2px rgba(255,255,255,0.05)',
        opacity: Math.min(1, p * 1.5),
        translate: `0 ${(1 - p) * 160}px`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: w, height: (w * 932) / 430, borderRadius: 44, display: 'block' }} />
    </div>
  )
}
