import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Audio } from '@remotion/media'
import { Backdrop } from '../components'
import { A, AppWindow, Camera, Caption, Count, Cursor, Priority, pop, prog } from '../ui'

const W = 1120
const H = 740
// Frames for the "Overdue" tab click.
const CLICK = 140

const DAYS = [
  { d: 'Today', n: 12, dots: [A.purple, A.blue] },
  { d: 'Fri', n: 13, dots: [A.purple] },
  { d: 'Sat', n: 14, dots: [A.blue] },
  { d: 'Sun', n: 15, dots: [] },
  { d: 'Mon', n: 16, dots: [] },
  { d: 'Tue', n: 17, dots: [A.blue] },
  { d: 'Wed', n: 18, dots: [] },
]

const TODAY = [
  { time: '10:30', title: 'Summarise interview notes', project: 'User research', status: 'To do', dot: A.purple, p: 'Medium' as const },
  { time: '15:00', title: 'Build the sign-up flow', project: 'Capstone app', status: 'In progress', dot: A.blue, p: 'High' as const },
]
const OVERDUE = [{ time: 'Nov 11', title: 'Fix the date picker on mobile', project: 'Capstone app', status: 'Review', dot: A.blue, p: 'High' as const }]

const Row = ({ r, late, style }: { r: (typeof TODAY)[number]; late?: boolean; style?: React.CSSProperties }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '18px 22px', borderTop: `1px solid ${A.border}`, background: 'white', ...style }}>
    <div style={{ width: 70, fontSize: 17, fontWeight: 600, color: late ? A.red : A.text }}>{r.time}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 19, fontWeight: 600 }}>{r.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, fontSize: 15, color: A.muted }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: r.dot }} />
        {r.project} · {r.status}
      </div>
    </div>
    <Priority level={r.p} />
  </div>
)

const Dashboard = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const tab = prog(frame, CLICK + 2, 12) // 0 = Today, 1 = Overdue
  const tabW = [96, 86, 120]
  const pillX = 4 + tab * 0 + (1 - tab) * (4 + tabW[0] + 4)
  const pillW = tab * tabW[0] + (1 - tab) * tabW[1]
  const head = prog(frame, 10, 20)

  return (
    <div style={{ padding: '30px 34px', position: 'absolute', inset: 0 }}>
      <div style={{ opacity: head, translate: `0 ${(1 - head) * 14}px` }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>Thursday, November 12</div>
        <div style={{ fontSize: 18, color: A.muted, marginTop: 6 }}>
          Hi Alex. <Count to={2} start={22} /> due today, <span style={{ color: A.red }}><Count to={1} start={26} /> overdue</span>, <Count to={3} start={30} /> more this week.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
        {DAYS.map((d, i) => {
          const p = pop(frame, 24 + i * 4, fps)
          const today = i === 0
          return (
            <div
              key={d.n}
              style={{
                flex: 1,
                height: 82,
                borderRadius: 14,
                padding: '12px 14px',
                boxSizing: 'border-box',
                background: today ? A.navy : 'white',
                color: today ? 'white' : A.ink,
                border: today ? 'none' : `1px solid ${A.border}`,
                opacity: Math.min(1, p * 1.4),
                scale: String(0.7 + p * 0.3),
                translate: `0 ${(1 - p) * 30}px`,
              }}
            >
              <div style={{ fontSize: 14, opacity: 0.75 }}>{d.d}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{d.n}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                {d.dots.map((c, k) => (
                  <span key={k} style={{ width: 16 * prog(frame, 44 + i * 4 + k * 3, 10), height: 5, borderRadius: 3, background: c }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 22, marginTop: 22 }}>
        <div style={{ width: 680, borderRadius: 16, background: 'white', border: `1px solid ${A.border}`, overflow: 'hidden', opacity: prog(frame, 46, 16), translate: `0 ${(1 - prog(frame, 46, 20)) * 30}px` }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 0 22px' }}>
            <div style={{ fontSize: 19, fontWeight: 700 }}>My tasks</div>
            <div style={{ position: 'relative', display: 'flex', gap: 4, padding: 4, borderRadius: 11, background: '#eef1f6', fontSize: 15 }}>
              <div style={{ position: 'absolute', top: 4, bottom: 4, left: pillX, width: pillW, borderRadius: 8, background: 'white', boxShadow: '0 1px 3px rgba(15,23,42,0.15)' }} />
              {[
                ['Overdue', '1'],
                ['Today', '2'],
                ['Next 7 days', '3'],
              ].map(([label, n], i) => (
                <div key={label} style={{ position: 'relative', width: tabW[i], textAlign: 'center', padding: '7px 0', color: A.text, fontWeight: 500 }}>
                  {label} <span style={{ color: i === 0 ? A.red : A.ink, fontWeight: 700 }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 200 }}>
            {TODAY.map((r, i) => {
              const inP = prog(frame, 58 + i * 7, 18)
              return <Row key={r.title} r={r} style={{ position: 'absolute', left: 0, right: 0, top: i * 90, opacity: inP * (1 - tab), translate: `${(1 - inP) * 40 - tab * 40}px 0` }} />
            })}
            {OVERDUE.map((r) => (
              <Row key={r.title} r={r} late style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: tab, translate: `${(1 - tab) * 40}px 0` }} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, borderRadius: 16, background: 'white', border: `1px solid ${A.border}`, padding: 20, opacity: prog(frame, 52, 16) }}>
          <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 600 }}>November 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 14, fontSize: 14, textAlign: 'center' }}>
            {Array.from({ length: 35 }, (_, i) => {
              const day = i + 1 <= 30 ? i + 1 : i - 29
              const isToday = i === 11
              const p = prog(frame, 56 + i * 0.8, 10)
              return (
                <div key={i} style={{ height: 30, display: 'grid', placeItems: 'center', borderRadius: 8, background: isToday ? A.blue : 'transparent', color: isToday ? 'white' : [10, 12, 13, 16].includes(i) ? A.blue : i >= 30 ? '#94a3b8' : A.ink, fontWeight: isToday ? 700 : 500, opacity: p, scale: String(isToday ? 1 + Math.sin(frame / 8) * 0.04 * prog(frame, 80, 10) : 1) }}>
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Cursor
        appear={108}
        path={[
          { f: 108, x: 760, y: 560 },
          { f: CLICK - 4, x: 422, y: 278 },
          { f: CLICK, x: 422, y: 278, down: true },
          { f: CLICK + 6, x: 422, y: 278 },
          { f: CLICK + 40, x: 600, y: 380 },
        ]}
      />
    </div>
  )
}

export const MyWork = () => (
  <AbsoluteFill>
    <Backdrop glow="right" />
    <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', padding: '0 0 0 110px', gap: 70 }}>
      <Caption eyebrow="My work" title="Your day, at a glance." accentFrom={2} body="Overdue, due today and the week ahead, across every project you're in." start={4} width={520} />
      <Camera
        keys={[
          { f: 0, ry: -26, rx: 12, s: 0.82, x: 160, y: 40 },
          { f: 45, ry: -10, rx: 5, s: 0.96, x: 0, y: 0 },
          { f: 125, ry: -6, rx: 3, s: 1.0, x: 10, y: 0 },
          { f: 200, ry: -4, rx: 2, s: 1.03, x: -30, y: 10 },
        ]}
      >
        <AppWindow width={W} height={H} tab="my">
          <Dashboard />
        </AppWindow>
      </Camera>
    </AbsoluteFill>
    <Sequence from={CLICK} durationInFrames={20}>
      <Audio src={staticFile('sfx/mouse-click.wav')} volume={0.5} />
    </Sequence>
  </AbsoluteFill>
)
