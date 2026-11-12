import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Leaf } from 'lucide-react'
import { C, fontFamily } from './theme'

/** Deep navy backdrop with a slow-drifting blue glow, like the app's top bar. */
export const Backdrop = ({ glow = 'right' }: { glow?: 'left' | 'right' | 'center' }) => {
  const frame = useCurrentFrame()
  const drift = Math.sin(frame / 90) * 40
  const x = glow === 'left' ? 20 : glow === 'right' ? 80 : 50
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1100px 800px at calc(${x}% + ${drift}px) 40%, rgba(37,99,235,0.28), transparent 70%), linear-gradient(180deg, ${C.bg}, ${C.bgDeep})`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(180deg, black, transparent 85%)',
        }}
      />
    </AbsoluteFill>
  )
}

export const Brand = ({ size = 1 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18 * size, fontFamily }}>
    <div
      style={{
        width: 64 * size,
        height: 64 * size,
        borderRadius: 16 * size,
        background: C.blue,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 12px 40px rgba(37,99,235,0.45)',
      }}
    >
      <Leaf color="white" size={34 * size} strokeWidth={2.2} />
    </div>
    <span style={{ color: C.ink, fontSize: 54 * size, fontWeight: 700, letterSpacing: '-0.03em' }}>FocusFlow</span>
  </div>
)

/** Fades and lifts its child in, starting at `delay` frames. */
export const Rise = ({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: CSSProperties }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 24 })
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 28}px)`, ...style }}>{children}</div>
}

export const Caption = ({ eyebrow, title, body }: { eyebrow: string; title: ReactNode; body: string }) => (
  <div style={{ fontFamily, width: 520 }}>
    <Rise delay={4}>
      <div style={{ color: C.blueSoft, fontSize: 24, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{eyebrow}</div>
    </Rise>
    <Rise delay={9}>
      <div style={{ color: C.ink, fontSize: 64, fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.035em', marginTop: 18 }}>{title}</div>
    </Rise>
    <Rise delay={16}>
      <div style={{ color: C.muted, fontSize: 28, lineHeight: 1.45, marginTop: 26 }}>{body}</div>
    </Rise>
  </div>
)

type Focus = { x: number; y: number; s: number }
export type Box = { x: number; y: number; w: number; h: number; at: number }

/**
 * A screenshot in a browser window. The camera eases from `from` to `to`
 * (x/y are the focus point as fractions of the image, s is zoom), and each
 * highlight box (in source pixels) draws a ring from frame `at`.
 */
export const Shot = ({
  src,
  width,
  srcW = 1280,
  srcH = 800,
  from = { x: 0.5, y: 0.5, s: 1 },
  to = { x: 0.5, y: 0.5, s: 1 },
  boxes = [],
  duration,
}: {
  src: string
  width: number
  srcW?: number
  srcH?: number
  from?: Focus
  to?: Focus
  boxes?: Box[]
  duration: number
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 })
  const t = interpolate(frame, [12, duration - 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  })
  const s = from.s + (to.s - from.s) * t
  const fx = from.x + (to.x - from.x) * t
  const fy = from.y + (to.y - from.y) * t
  const k = width / srcW
  const height = srcH * k

  return (
    <div
      style={{
        width,
        borderRadius: 18,
        overflow: 'hidden',
        background: '#1b2747',
        boxShadow: '0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
        opacity: enter,
        transform: `translateY(${(1 - enter) * 60}px) scale(${0.96 + enter * 0.04})`,
      }}
    >
      <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', background: '#16213f' }}>
        {['#f87171', '#fbbf24', '#34d399'].map((c) => (
          <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85 }} />
        ))}
        <span
          style={{
            marginLeft: 18,
            padding: '5px 18px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            color: C.muted,
            fontFamily,
            fontSize: 15,
          }}
        >
          localhost:5173
        </span>
      </div>
      <div style={{ width, height, overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            width,
            height,
            transformOrigin: `${fx * 100}% ${fy * 100}%`,
            transform: `scale(${s})`,
            position: 'relative',
          }}
        >
          <Img src={staticFile(src)} style={{ width, height, display: 'block' }} />
          {boxes.map((b, i) => (
            <Highlight key={i} box={b} k={k} />
          ))}
        </div>
      </div>
    </div>
  )
}

const Highlight = ({ box, k }: { box: Box; k: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - box.at, fps, config: { damping: 14, stiffness: 120 } })
  const pad = 6
  return (
    <div
      style={{
        position: 'absolute',
        left: box.x * k - pad,
        top: box.y * k - pad,
        width: box.w * k + pad * 2,
        height: box.h * k + pad * 2,
        borderRadius: 12,
        border: `3px solid ${C.blue}`,
        boxShadow: '0 0 0 6px rgba(37,99,235,0.18), 0 0 40px rgba(37,99,235,0.35)',
        opacity: Math.min(1, Math.max(0, p)),
        transform: `scale(${1.12 - 0.12 * p})`,
      }}
    />
  )
}

export const Phone = ({ src, delay = 0, tilt = 0 }: { src: string; delay?: number; tilt?: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 30 })
  const float = Math.sin((frame - delay) / 28) * 6
  const w = 360
  return (
    <div
      style={{
        width: w + 24,
        padding: 12,
        borderRadius: 54,
        background: '#0d1426',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.1)',
        opacity: p,
        transform: `translateY(${(1 - p) * 120 + float}px) rotate(${tilt * p}deg)`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: w, height: (w * 932) / 430, borderRadius: 42, display: 'block' }} />
    </div>
  )
}
