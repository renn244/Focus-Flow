/**
 * The animation kit: easing helpers, a 3D camera, a cursor, kinetic text and
 * the pieces of FocusFlow's UI (rebuilt in code so every part can move).
 */
import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { Leaf, Search } from 'lucide-react'
import { C, fontFamily } from './theme'

export const EASE = Easing.bezier(0.16, 1, 0.3, 1)
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1)

/** 0 → 1 between frames `start` and `start + dur`, clamped and eased. */
export const prog = (frame: number, start: number, dur: number, easing = EASE) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })

export const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Springy pop (overshoots a little) for things that land. */
export const pop = (frame: number, start: number, fps: number) =>
  interpolate(frame, [start, start + 0.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.spring({ damping: 12, stiffness: 140 }),
  })

/** App colours (light UI), matching frontend/src/index.css. */
export const A = {
  page: '#f4f6fb',
  card: '#ffffff',
  border: '#e3e8f1',
  ink: '#0f172a',
  text: '#334155',
  muted: '#64748b',
  navy: '#0a1430',
  navy2: '#13204a',
  blue: '#2563eb',
  blueBg: '#eff4ff',
  purple: '#a855f7',
  green: '#10b981',
  red: '#dc2626',
  amber: '#b45309',
}

// ───────────────────────── camera ─────────────────────────

type Key = { f: number; rx?: number; ry?: number; s?: number; x?: number; y?: number }

/**
 * Moves its children through 3D keyframes (rotateX/rotateY in degrees, scale,
 * x/y in px). Values not given on a key carry over from the previous one.
 */
export const Camera = ({ keys, children, style }: { keys: Key[]; children: ReactNode; style?: CSSProperties }) => {
  const frame = useCurrentFrame()
  const filled: Required<Key>[] = []
  keys.forEach((k, i) => {
    const prev = filled[i - 1] ?? { f: 0, rx: 0, ry: 0, s: 1, x: 0, y: 0 }
    filled.push({ ...prev, ...k })
  })
  const frames = filled.map((k) => k.f)
  const at = (prop: keyof Omit<Key, 'f'>) =>
    filled.length === 1
      ? filled[0][prop]
      : interpolate(frame, frames, filled.map((k) => k[prop]), {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE_IO,
        })
  return (
    <div style={{ perspective: 2200, ...style }}>
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate(${at('x')}px, ${at('y')}px) rotateX(${at('rx')}deg) rotateY(${at('ry')}deg) scale(${at('s')})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ───────────────────────── cursor ─────────────────────────

type CursorKey = { f: number; x: number; y: number; down?: boolean }

/** A mouse pointer that glides between points and shows a ripple on each click. */
export const Cursor = ({ path, appear = 0 }: { path: CursorKey[]; appear?: number }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fs = path.map((p) => p.f)
  const x = interpolate(frame, fs, path.map((p) => p.x), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IO })
  const y = interpolate(frame, fs, path.map((p) => p.y), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IO })
  const down = path.some((p, i) => p.down && frame >= p.f && frame < (path[i + 1]?.f ?? Infinity))
  const clicks = path.filter((p, i) => p.down && !path[i - 1]?.down).map((p) => p.f)
  const opacity = prog(frame, appear, 8)

  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity, zIndex: 50, pointerEvents: 'none' }}>
      {clicks.map((cf) => {
        const t = prog(frame, cf, 0.45 * fps, Easing.out(Easing.cubic))
        return frame >= cf ? (
          <div
            key={cf}
            style={{
              position: 'absolute',
              left: -26,
              top: -26,
              width: 52,
              height: 52,
              borderRadius: 26,
              border: `3px solid ${A.blue}`,
              opacity: 1 - t,
              scale: String(0.3 + t),
            }}
          />
        ) : null
      })}
      <svg width="34" height="34" viewBox="0 0 24 24" style={{ scale: down ? '0.86' : '1', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
        <path d="M4 2.5 L4 19 L8.6 14.6 L11.6 21.2 L14.4 20 L11.5 13.6 L17.8 13.6 Z" fill="#0f172a" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ───────────────────────── text ─────────────────────────

/** Headline that arrives word by word, each word sliding up out of a blur. */
export const Words = ({
  text,
  start = 0,
  stagger = 3,
  style,
  accent,
}: {
  text: string
  start?: number
  stagger?: number
  style?: CSSProperties
  /** Words (from this index on) shown in the accent colour. */
  accent?: number
}) => {
  const frame = useCurrentFrame()
  return (
    <div style={{ fontFamily, ...style }}>
      {text.split(' ').map((w, i) => {
        const t = prog(frame, start + i * stagger, 18)
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.24em',
              opacity: t,
              translate: `0 ${(1 - t) * 0.45}em`,
              filter: `blur(${(1 - t) * 10}px)`,
              color: accent !== undefined && i >= accent ? C.blueSoft : undefined,
            }}
          >
            {w}
          </span>
        )
      })}
    </div>
  )
}

/** Characters of `text` revealed at `cps` characters per second from `start`. */
export const typed = (text: string, frame: number, start: number, fps: number, cps = 22) =>
  text.slice(0, Math.max(0, Math.floor(((frame - start) / fps) * cps)))

export const Caret = ({ color = A.blue }: { color?: string }) => {
  const frame = useCurrentFrame()
  return <span style={{ display: 'inline-block', width: 3, height: '1.05em', background: color, marginLeft: 2, verticalAlign: '-0.15em', opacity: Math.floor(frame / 15) % 2 ? 0.15 : 1 }} />
}

/** Counts from `from` to `to` over the given frames. */
export const Count = ({ from = 0, to, start, dur = 20 }: { from?: number; to: number; start: number; dur?: number }) => {
  const frame = useCurrentFrame()
  return <>{Math.round(mix(from, to, prog(frame, start, dur)))}</>
}

export const Caption = ({ eyebrow, title, accentFrom, body, start = 0, width = 560 }: { eyebrow: string; title: string; accentFrom?: number; body?: string; start?: number; width?: number }) => {
  const frame = useCurrentFrame()
  const e = prog(frame, start, 18)
  const b = prog(frame, start + 22, 22)
  return (
    <div style={{ fontFamily, width }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: e, translate: `${(1 - e) * -20}px 0` }}>
        <span style={{ width: 36 * e, height: 3, background: C.blueSoft, borderRadius: 2 }} />
        <span style={{ color: C.blueSoft, fontSize: 24, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{eyebrow}</span>
      </div>
      <Words text={title} start={start + 6} accent={accentFrom} style={{ color: C.ink, fontSize: 70, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.04em', marginTop: 20 }} />
      {body && <div style={{ color: C.muted, fontSize: 28, lineHeight: 1.45, marginTop: 26, opacity: b, translate: `0 ${(1 - b) * 16}px` }}>{body}</div>}
    </div>
  )
}

// ───────────────────────── app pieces ─────────────────────────

export const Logo = ({ size = 34 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.27, background: A.blue, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
    <Leaf color="white" size={size * 0.55} strokeWidth={2.3} />
  </div>
)

/** Browser window with FocusFlow's dark top bar. */
export const AppWindow = ({ width, height, tab, children, style }: { width: number; height: number; tab: 'my' | 'capstone'; children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 20,
      overflow: 'hidden',
      background: A.page,
      fontFamily,
      color: A.ink,
      boxShadow: '0 60px 140px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.10)',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}
  >
    <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: '#141d36', flexShrink: 0 }}>
      {['#f87171', '#fbbf24', '#34d399'].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
      ))}
      <span style={{ marginLeft: 16, padding: '4px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', color: '#8f9bbb', fontSize: 14 }}>localhost:5173</span>
    </div>
    <div style={{ height: 58, display: 'flex', alignItems: 'center', gap: 30, padding: '0 22px', background: A.navy, color: 'white', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 20 }}>
        <Logo size={32} />
        FocusFlow
      </div>
      <TopTab active={tab === 'my'}>My work</TopTab>
      <TopTab active={tab === 'capstone'} dot={A.blue}>Capstone app</TopTab>
      <TopTab dot={A.purple}>User research</TopTab>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '7px 14px', color: '#9aa8c7', fontSize: 15, width: 200 }}>
        <Search size={16} /> Search
        <span style={{ marginLeft: 'auto', fontSize: 12, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 5, padding: '1px 6px' }}>Ctrl K</span>
      </div>
      <Avatar name="AR" color="#e0e7ff" ink={A.blue} size={34} />
    </div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
  </div>
)

const TopTab = ({ children, active, dot }: { children: ReactNode; active?: boolean; dot?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: active ? 600 : 500, color: active ? 'white' : '#9aa8c7', height: 58, borderBottom: active ? `3px solid ${C.blueSoft}` : '3px solid transparent', boxSizing: 'border-box', paddingTop: 3 }}>
    {dot && <span style={{ width: 8, height: 8, borderRadius: 4, background: dot }} />}
    {children}
  </div>
)

export const Avatar = ({ name, color, ink = 'white', size = 30, style }: { name: string; color: string; ink?: string; size?: number; style?: CSSProperties }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, color: ink, display: 'grid', placeItems: 'center', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0, ...style }}>{name}</div>
)

const PRIORITY = {
  High: { bg: '#fef2f2', fg: '#dc2626', bd: '#fecaca' },
  Medium: { bg: '#fffbeb', fg: '#b45309', bd: '#fde68a' },
  Low: { bg: '#ecfdf5', fg: '#059669', bd: '#a7f3d0' },
}

export const Priority = ({ level }: { level: keyof typeof PRIORITY }) => {
  const p = PRIORITY[level]
  return <span style={{ fontSize: 13, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: p.bg, color: p.fg, border: `1px solid ${p.bd}` }}>{level}</span>
}

export const Tag = ({ children }: { children: ReactNode }) => (
  <span style={{ fontSize: 13, padding: '2px 9px', borderRadius: 6, background: '#f1f5f9', color: A.text, fontWeight: 500 }}>{children}</span>
)

export const Check = ({ on, size = 20 }: { on: number; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: 5, border: `2px solid ${on > 0.5 ? A.blue : '#94a3b8'}`, background: on > 0.5 ? A.blue : 'white', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
      <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" strokeDashoffset={30 * (1 - on)} />
    </svg>
  </div>
)
