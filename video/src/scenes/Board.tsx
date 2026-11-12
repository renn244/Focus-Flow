import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Audio } from '@remotion/media'
import { Calendar, ListChecks, Plus } from 'lucide-react'
import { Backdrop } from '../components'
import { C, fontFamily } from '../theme'
import { A, AppWindow, Avatar, Camera, Cursor, Priority, Tag, Words, mix, pop, prog, EASE_IO } from '../ui'

const W = 1560
const H = 800
const SIDEBAR = 290
const COL_W = 284
const GAP = 18
const COL_X = (i: number) => SIDEBAR + 30 + i * (COL_W + GAP)
const COL_TOP = 190
const CARD_TOP = COL_TOP + 56
const CARD_H = 150
const slotY = (k: number) => CARD_TOP + k * (CARD_H + 12)

// Drag timeline (frames from scene start)
const PICK = 100
const DROP = 146

type CardData = { title: string; desc: string; p: 'High' | 'Medium' | 'Low'; date: string; today?: boolean; late?: boolean; tag?: string; check?: string; you?: boolean }

const COLUMNS: { title: string; color: string; cards: CardData[] }[] = [
  {
    title: 'To do',
    color: '#94a3b8',
    cards: [
      { title: 'Set up the staging database', desc: 'A separate database for testing before the demo.', p: 'Medium', date: 'Nov 15' },
      { title: 'Review Jordan’s pull request', desc: 'Check the tasks API changes and leave comments.', p: 'Medium', date: 'Nov 14', you: true },
      { title: 'Rehearse the demo', desc: 'Run through the full demo twice before presenting.', p: 'High', date: 'Nov 17', you: true },
    ],
  },
  {
    title: 'In progress',
    color: A.blue,
    cards: [
      { title: 'Build the sign-up flow', desc: 'Email check, password rules and the welcome screen.', p: 'High', date: 'Today', today: true, tag: 'frontend', check: '3/5', you: true },
      { title: 'Connect the tasks API', desc: 'Hook the board up to the real create, move and delete…', p: 'Medium', date: 'Nov 13', tag: 'backend', check: '1/4' },
    ],
  },
  { title: 'Review', color: '#a78bfa', cards: [{ title: 'Fix the date picker on mobile', desc: 'The calendar popup is cut off on small screens.', p: 'High', date: 'Nov 11', late: true, tag: 'bug', you: true }] },
  { title: 'Done', color: A.green, cards: [{ title: 'Agree on the colour palette', desc: 'Choose the main and accent colours for the app.', p: 'Low', date: 'Nov 9', check: '0/3' }] },
]

const TaskCard = ({ c, style }: { c: CardData; style?: React.CSSProperties }) => (
  <div style={{ position: 'absolute', width: COL_W - 20, height: CARD_H, boxSizing: 'border-box', padding: '14px 16px', borderRadius: 12, background: 'white', border: `1px solid ${A.border}`, boxShadow: '0 1px 2px rgba(15,23,42,0.06)', ...style }}>
    <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{c.title}</div>
    <div style={{ fontSize: 13.5, color: A.muted, marginTop: 6, lineHeight: 1.4, height: 38, overflow: 'hidden' }}>{c.desc}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, fontSize: 13, color: c.late ? A.red : c.today ? A.blue : A.muted, fontWeight: 500 }}>
      <Priority level={c.p} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Calendar size={13} /> {c.date}
      </span>
      {c.check && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: A.muted }}>
          <ListChecks size={13} /> {c.check}
        </span>
      )}
      {c.tag && <Tag>{c.tag}</Tag>}
    </div>
  </div>
)

const BoardUI = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const drag = prog(frame, PICK + 4, DROP - PICK - 6, EASE_IO)
  const lift = prog(frame, PICK, 8) * (1 - prog(frame, DROP, 10))
  const dropped = frame >= DROP
  const closeGap = prog(frame, PICK + 12, 16)
  const agendaGlow = prog(frame, PICK, 10) * (1 - prog(frame, DROP + 30, 20))

  const from = { x: COL_X(1) + 10, y: slotY(0) }
  const to = { x: COL_X(2) + 10, y: slotY(1) }
  const counts = [3, dropped ? 1 : 2, dropped ? 2 : 1, 1]

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Agenda sidebar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR, background: A.navy, color: 'white', padding: '22px 16px', boxSizing: 'border-box', opacity: prog(frame, 6, 16) }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 19, fontWeight: 700 }}>
          My agenda <span style={{ fontSize: 13, color: '#9aa8c7', fontWeight: 500 }}>Thu, Nov 12</span>
        </div>
        <div style={{ display: 'flex', marginTop: 16, padding: 4, borderRadius: 10, background: A.navy2, fontSize: 14 }}>
          {['Overdue 1', 'Today 2', '7 days 3'].map((t, i) => (
            <div key={t} style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 7, background: i === 1 ? A.blue : 'transparent', fontWeight: 600, color: i === 1 ? 'white' : '#c7d0e6' }}>{t}</div>
          ))}
        </div>
        {[
          { t: 'Summarise interview notes', s: 'User research', time: '10:30', dot: A.purple },
          { t: 'Build the sign-up flow', s: 'Capstone app · On this board', time: '15:00', dot: A.blue },
        ].map((r, i) => (
          <div key={r.t} style={{ marginTop: 12, padding: '12px 12px', borderRadius: 10, background: i === 1 ? `rgba(37,99,235,${0.18 + agendaGlow * 0.3})` : 'transparent', boxShadow: i === 1 ? `0 0 0 ${agendaGlow * 2}px ${C.blueSoft}` : undefined, opacity: prog(frame, 14 + i * 6, 14) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600 }}>
              {r.t} <span style={{ color: '#9aa8c7', fontWeight: 500 }}>{r.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, fontSize: 13, color: i === 1 ? C.blueSoft : '#9aa8c7' }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: r.dot }} />
              {r.s}
            </div>
          </div>
        ))}
      </div>

      {/* Project header */}
      <div style={{ position: 'absolute', left: SIDEBAR, right: 0, top: 0, height: 120, background: 'white', borderBottom: `1px solid ${A.border}`, padding: '20px 30px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 700 }}>
          <span style={{ width: 13, height: 13, borderRadius: 3, background: A.blue }} /> Capstone app
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            {[
              ['JL', '#0ea5e9'],
              ['PS', '#f97316'],
              ['AR', A.blue],
            ].map(([n, c], i) => {
              const p = pop(frame, 50 + i * 6, fps)
              return <Avatar key={n} name={n} color={c} size={36} style={{ marginLeft: i ? -10 : 0, border: '3px solid white', scale: String(p), position: 'relative' }} />
            })}
            <span style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: A.green, fontWeight: 600, opacity: prog(frame, 70, 12) }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: A.green, scale: String(1 + Math.sin(frame / 6) * 0.25) }} /> 3 online
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 18, fontSize: 16, color: A.muted }}>
          {['Board', 'My list', 'Calendar', 'Team', 'Notes', 'Settings'].map((t, i) => (
            <span key={t} style={{ paddingBottom: 10, color: i === 0 ? A.ink : A.muted, fontWeight: i === 0 ? 600 : 500, borderBottom: i === 0 ? `2px solid ${A.blue}` : '2px solid transparent' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Sprint row */}
      <div style={{ position: 'absolute', left: SIDEBAR + 30, right: 30, top: 134, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>Sprint 3</span>
        <span style={{ fontSize: 15, color: A.muted }}>Two weeks to a working sign-up and task list.</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: A.blue, color: 'white', padding: '8px 16px', borderRadius: 9, fontSize: 15, fontWeight: 600 }}>
          <Plus size={16} /> New task
        </span>
      </div>

      {/* Columns */}
      {COLUMNS.map((col, i) => {
        const p = prog(frame, 10 + i * 5, 20)
        return (
          <div key={col.title} style={{ position: 'absolute', left: COL_X(i), top: COL_TOP, width: COL_W, height: H - 96 - COL_TOP - 20, borderRadius: 14, background: '#e9edf5', opacity: p, translate: `0 ${(1 - p) * 40}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 14px', fontSize: 16, fontWeight: 600 }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: col.color }} />
              {col.title} <span style={{ color: A.muted, fontWeight: 500 }}>{counts[i]}</span>
            </div>
          </div>
        )
      })}

      {/* Cards (all but the dragged one) */}
      {COLUMNS.flatMap((col, i) =>
        col.cards.map((c, k) => {
          if (i === 1 && k === 0) return null
          const slot = i === 1 ? mix(k, k - 1, closeGap) : k
          const p = pop(frame, 22 + i * 6 + k * 7, fps)
          return <TaskCard key={c.title} c={c} style={{ left: COL_X(i) + 10, top: slotY(slot), opacity: Math.min(1, p * 1.5), translate: `0 ${(1 - p) * -60}px` }} />
        }),
      )}

      {/* Drop placeholder */}
      <div style={{ position: 'absolute', left: to.x, top: to.y, width: COL_W - 20, height: CARD_H, borderRadius: 12, border: `2px dashed ${A.blue}`, background: 'rgba(37,99,235,0.06)', opacity: prog(frame, PICK + 20, 10) * (1 - prog(frame, DROP, 6)) }} />

      {/* The dragged card */}
      {(() => {
        const p = pop(frame, 28, fps)
        return (
          <TaskCard
            c={COLUMNS[1].cards[0]}
            style={{
              left: mix(from.x, to.x, drag),
              top: mix(from.y, to.y, drag),
              zIndex: 10,
              opacity: Math.min(1, p * 1.5),
              translate: `0 ${(1 - p) * -60}px`,
              rotate: `${lift * 4 * (1 - Math.abs(drag - 0.5))}deg`,
              scale: String(1 + lift * 0.06),
              boxShadow: `0 ${4 + lift * 30}px ${6 + lift * 50}px rgba(15,23,42,${0.08 + lift * 0.2})`,
              border: `1px solid ${lift > 0.1 ? A.blue : A.border}`,
            }}
          />
        )
      })()}

      {/* Live update toast */}
      {(() => {
        const t = pop(frame, DROP + 14, fps)
        return (
          <div style={{ position: 'absolute', right: 30, bottom: 30, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 12, background: A.navy, color: 'white', fontSize: 15, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', opacity: Math.min(1, t), translate: `0 ${(1 - t) * 40}px` }}>
            <Avatar name="PS" color="#f97316" size={28} />
            <span>
              <b>Priya</b> sees it moved to Review, live
            </span>
          </div>
        )
      })()}

      <Cursor
        appear={78}
        path={[
          { f: 78, x: 1250, y: 650 },
          { f: PICK - 2, x: from.x + 150, y: from.y + 40 },
          { f: PICK, x: from.x + 150, y: from.y + 40, down: true },
          { f: PICK + 4, x: from.x + 150, y: from.y + 40, down: true },
          { f: DROP - 2, x: to.x + 150, y: to.y + 40, down: true },
          { f: DROP, x: to.x + 150, y: to.y + 40 },
          { f: DROP + 40, x: to.x + 260, y: to.y + 230 },
        ]}
      />
    </div>
  )
}

export const Board = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill>
      <Backdrop glow="center" />
      <div style={{ position: 'absolute', top: 64, width: '100%', textAlign: 'center', fontFamily }}>
        <div style={{ color: C.blueSoft, fontSize: 22, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: prog(frame, 2, 14) }}>Boards</div>
        <Words text="Plan together. Keep your own focus." start={6} accent={2} style={{ color: C.ink, fontSize: 60, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 10 }} />
      </div>
      <Camera
        style={{ position: 'absolute', left: (1920 - W) / 2, top: 236 }}
        keys={[
          { f: 0, rx: 34, s: 0.86, y: 160 },
          { f: 50, rx: 12, s: 0.95, y: 20 },
          { f: PICK, rx: 9, s: 0.97, x: -20, y: 10 },
          { f: DROP + 10, rx: 7, s: 1.0, x: -60, y: 0 },
          { f: 240, rx: 5, s: 1.02, x: -80, y: -10 },
        ]}
      >
        <AppWindow width={W} height={H} tab="capstone">
          <BoardUI />
        </AppWindow>
      </Camera>
      <Sequence from={PICK} durationInFrames={20}>
        <Audio src={staticFile('sfx/mouse-click.wav')} volume={0.45} />
      </Sequence>
      <Sequence from={DROP} durationInFrames={20}>
        <Audio src={staticFile('sfx/switch.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  )
}
