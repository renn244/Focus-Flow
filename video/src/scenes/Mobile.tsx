import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Backdrop, Phone } from '../components'
import { Caption, Camera } from '../ui'

export const Mobile = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill>
      <Backdrop glow="center" />
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120 }}>
        <Caption eyebrow="Mobile" title="Works on your phone." accentFrom={2} body="The board stacks, tasks become one scrolling page, and your agenda is a tap away." start={4} width={520} />
        <Camera
          keys={[
            { f: 0, ry: 38, rx: 10, s: 0.9 },
            { f: 40, ry: -6, rx: 4, s: 1 },
            { f: 150, ry: -14, rx: 3, s: 1.03 },
          ]}
        >
          <div style={{ display: 'flex', gap: 46, transformStyle: 'preserve-3d' }}>
            <div style={{ translate: `0 ${Math.sin(frame / 26) * 10}px` }}>
              <Phone src="shots/mobile-my-work.png" delay={4} />
            </div>
            <div style={{ translate: `0 ${50 + Math.sin(frame / 26 + 1.5) * 10}px` }}>
              <Phone src="shots/mobile-task.png" delay={12} />
            </div>
          </div>
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
