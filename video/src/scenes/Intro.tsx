import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion'
import { Backdrop } from '../components'
import { C, fontFamily } from '../theme'
import { A, EASE_IO, Logo, Priority, Words, mix, pop, prog } from '../ui'

/** Scattered tasks from every project ("the project")… */
const CLUTTER = [
  'Set up the staging database', 'Review Jordan’s pull request', 'Rehearse the demo', 'Connect the tasks API',
  'Write onboarding copy', 'Agree on the colour palette', 'Plan user interviews', 'Draft survey questions',
  'Fix the login redirect', 'Update the README', 'Book the meeting room', 'Clean up old branches',
  'Sketch the settings page', 'Collect test feedback',
]
/** …that collapse into what's yours today. */
const FOCUS = [
  { title: 'Fix the date picker on mobile', meta: 'Overdue · Capstone app', dot: A.red, p: 'High' as const },
  { title: 'Summarise interview notes', meta: '10:30 · User research', dot: A.purple, p: 'Medium' as const },
  { title: 'Build the sign-up flow', meta: '15:00 · Capstone app', dot: A.blue, p: 'High' as const },
]

const MiniCard = ({ title, meta, dot, p }: { title: string; meta: string; dot: string; p?: 'High' | 'Medium' | 'Low' }) => (
  <div style={{ width: 420, padding: '18px 22px', borderRadius: 16, background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', fontFamily }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: A.ink }}>{title}</div>
      {p && <Priority level={p} />}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 17, color: A.muted }}>
      <span style={{ width: 9, height: 9, borderRadius: 5, background: dot }} />
      {meta}
    </div>
  </div>
)

export const Intro = () => {
  const frame = useCurrentFrame()
  const { fps, width, height, durationInFrames } = useVideoConfig()
  const gather = Math.round(durationInFrames * 0.42) // when the clutter collapses
  const g = prog(frame, gather, 26, EASE_IO)
  const line1Out = prog(frame, gather - 6, 14)

  const card = (i: number, total: number, seed: string, focusSlot?: number) => {
    // Scatter in a band above or below the headline so it stays readable.
    const top = random(seed + 'band') < 0.4
    const sx = 140 + random(seed + 'x') * (width - 280)
    const sy = top ? 230 + random(seed + 'y') * 110 : 640 + random(seed + 'y') * 360
    const a = Math.atan2(sy - height / 2, sx - width / 2)
    const rot = (random(seed + 'rot') - 0.5) * 24
    const depth = 0.55 + random(seed + 'd') * 0.45
    const appear = pop(frame, 4 + (i / total) * 30, fps)
    const floatY = Math.sin((frame + i * 20) / 22) * 10
    if (focusSlot === undefined) {
      // Clutter: drifts, then flies outward and fades when things get focused.
      const out = g
      return {
        left: sx + Math.cos(a) * out * 600 - 210,
        top: sy + Math.sin(a) * out * 400 + floatY - 40,
        rotate: `${rot + out * rot}deg`,
        scale: String(depth * appear * (1 - out * 0.4)),
        opacity: Math.min(1, appear) * (1 - out) * (0.45 + depth * 0.55),
        filter: `blur(${(1 - depth) * 6 + out * 8}px)`,
        zIndex: Math.round(depth * 10),
      }
    }
    const tx = width / 2 - 210
    const ty = 560 + focusSlot * 124
    return {
      left: mix(sx - 210, tx, g),
      top: mix(sy - 40 + floatY, ty, g),
      rotate: `${mix(rot, 0, g)}deg`,
      scale: String(mix(depth * appear, 1, g)),
      opacity: Math.min(1, appear),
      filter: `blur(${mix((1 - depth) * 6, 0, g)}px)`,
      zIndex: 20,
    }
  }

  const all = [...CLUTTER.map((t, i) => ({ t, i, focus: undefined as number | undefined })), ...FOCUS.map((_, k) => ({ t: '', i: CLUTTER.length + k, focus: k }))]
  const total = all.length

  return (
    <AbsoluteFill>
      <Backdrop glow="center" />
      {all.map(({ t, i, focus }) => (
        <div key={i} style={{ position: 'absolute', ...card(i, total, `c${i}`, focus) }}>
          {focus === undefined ? <MiniCard title={t} meta={['Capstone app', 'User research'][i % 2]} dot={[A.blue, A.purple][i % 2]} /> : <MiniCard {...FOCUS[focus]} />}
        </div>
      ))}
      {/* Darken the middle so the headline reads over the cards. */}
      <AbsoluteFill style={{ background: `radial-gradient(900px 300px at 50% ${mix(50, 30, g)}%, rgba(6,13,34,${mix(0.85, 0.6, g)}), transparent 75%)` }} />

      <AbsoluteFill style={{ alignItems: 'center', fontFamily, textAlign: 'center' }}>
        <div style={{ marginTop: 120, display: 'flex', alignItems: 'center', gap: 16, opacity: prog(frame, 0, 16), color: C.ink, fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em' }}>
          <Logo size={48} />
          FocusFlow
        </div>
        <div style={{ position: 'absolute', top: interpolate(g, [0, 1], [450, 300]), width: '100%' }}>
          <div style={{ opacity: 1 - line1Out, filter: `blur(${line1Out * 12}px)`, translate: `0 ${-line1Out * 30}px`, position: 'absolute', width: '100%' }}>
            <Words text="Most task apps show you the project." start={12} style={{ color: C.ink, fontSize: 84, fontWeight: 700, letterSpacing: '-0.045em' }} />
          </div>
          <div style={{ position: 'absolute', width: '100%' }}>
            <Words text="FocusFlow tells you what to do next." start={gather + 10} accent={3} style={{ color: C.ink, fontSize: 84, fontWeight: 700, letterSpacing: '-0.045em' }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
