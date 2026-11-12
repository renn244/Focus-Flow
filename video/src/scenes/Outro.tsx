import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { Leaf } from 'lucide-react'
import { Backdrop } from '../components'
import { C, fontFamily } from '../theme'
import { Words, pop, prog } from '../ui'

export const Outro = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const icon = pop(frame, 4, fps)
  const ring = prog(frame, 8, 30)
  const name = 'FocusFlow'.split('')
  return (
    <AbsoluteFill>
      <Backdrop glow="center" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ position: 'relative', width: 104, height: 104 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 28, border: `3px solid ${C.blueSoft}`, opacity: 1 - ring, scale: String(1 + ring * 0.8) }} />
            <div style={{ width: 104, height: 104, borderRadius: 28, background: C.blue, display: 'grid', placeItems: 'center', boxShadow: '0 20px 60px rgba(37,99,235,0.6)', scale: String(icon), rotate: `${(1 - icon) * -40}deg` }}>
              <Leaf color="white" size={58} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{ display: 'flex', color: C.ink, fontSize: 96, fontWeight: 700, letterSpacing: '-0.045em' }}>
            {name.map((ch, i) => {
              const t = prog(frame, 10 + i * 2, 16)
              return (
                <span key={i} style={{ display: 'inline-block', opacity: t, translate: `0 ${(1 - t) * 40}px`, filter: `blur(${(1 - t) * 8}px)` }}>
                  {ch}
                </span>
              )
            })}
          </div>
        </div>
        <Words text="Plan the work together." start={34} style={{ color: C.ink, fontSize: 60, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 60 }} />
        <Words text="Know what's yours today." start={46} accent={0} style={{ color: C.ink, fontSize: 60, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 4 }} />
        <div style={{ marginTop: 56, display: 'flex', gap: 14, alignItems: 'center', color: C.muted, fontSize: 24, opacity: prog(frame, 70, 20) }}>
          <span style={{ padding: '10px 22px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}>github.com/renn244/Focus-Flow</span>
          <span>React · NestJS · MongoDB</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
