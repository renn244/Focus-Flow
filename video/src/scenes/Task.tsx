import { AbsoluteFill, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Audio } from '@remotion/media'
import { Calendar, Paperclip } from 'lucide-react'
import { Backdrop } from '../components'
import { A, Avatar, Camera, Caption, Caret, Check, Cursor as CursorWrap, Tag, mix, prog, typed } from '../ui'
import { fontFamily } from '../theme'

const W = 1120
const H = 720
const TICK1 = 78
const TICK2 = 112
const COMMENT = 140

const ITEMS = ['Email check', 'Password rules', 'Error messages', 'Welcome screen', 'Tests']
const LIST_TOP = 300 // top of the first checklist row inside the right column
const ROW = 40

const Burst = ({ at }: { at: number }) => {
  const frame = useCurrentFrame()
  const t = prog(frame, at, 22)
  if (frame < at || t >= 1) return null
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + random(`b${i}`)
        const d = 20 + t * (50 + random(`d${i}`) * 40)
        return <span key={i} style={{ position: 'absolute', left: Math.cos(a) * d, top: Math.sin(a) * d, width: 7, height: 7, borderRadius: 4, background: [A.blue, A.green, '#60a5fa'][i % 3], opacity: 1 - t, scale: String(1 - t * 0.6) }} />
      })}
    </>
  )
}

const TaskModal = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const ticks = [1, 1, 1, prog(frame, TICK1 + 2, 10), prog(frame, TICK2 + 2, 10)]
  const done = ticks.reduce((a, b) => a + (b > 0.5 ? 1 : 0), 0)
  const bar = mix(3, 5, (prog(frame, TICK1 + 2, 14) + prog(frame, TICK2 + 2, 14)) / 2) / 5
  const complete = frame >= TICK2 + 4

  const activity = [
    { who: 'Alex Rivera', what: 'Checked off “Tests”', at: TICK2 + 4 },
    { who: 'Alex Rivera', what: 'Checked off “Welcome screen”', at: TICK1 + 4 },
    { who: 'Alex Rivera', what: 'Checked off “Error messages”', at: -100 },
    { who: 'Jordan Lee', what: 'Moved it to In progress', at: -100 },
    { who: 'Alex Rivera', what: 'Created the task', at: -100 },
  ]

  return (
    <div style={{ position: 'relative', width: W, height: H, borderRadius: 22, background: 'white', fontFamily, color: A.ink, display: 'flex', overflow: 'hidden', boxShadow: '0 60px 140px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)' }}>
      {/* Left: title, description, activity */}
      <div style={{ flex: 1, padding: '28px 34px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: A.muted }}>
          #6af4726d <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: A.text, fontWeight: 600 }}>High</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8, letterSpacing: '-0.02em' }}>Build the sign-up flow</div>
        <div style={{ height: 1, background: A.border, margin: '20px 0' }} />
        <div style={{ fontSize: 17, fontWeight: 600 }}>Description</div>
        <div style={{ fontSize: 16, color: A.text, marginTop: 6 }}>Email check, password rules and the welcome screen.</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Tag>frontend</Tag>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: A.muted }}>
            <Paperclip size={14} /> signup-wireframe.png
          </span>
        </div>
        <div style={{ height: 1, background: A.border, margin: '20px 0' }} />
        <div style={{ fontSize: 17, fontWeight: 600 }}>Activity</div>
        <div style={{ position: 'relative', marginTop: 8 }}>
          {activity.map((a, i) => {
            if (frame < a.at) return null
            // Rows above this one push it down as they arrive (newest on top).
            const above = activity.slice(0, i).reduce((sum, x) => sum + prog(frame, x.at, 14), 0)
            const p = prog(frame, a.at, 14)
            return (
              <div key={a.what} style={{ position: 'absolute', left: -10, right: -10, top: above * 40, display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '9px 10px', borderRadius: 8, opacity: p, background: a.at > 0 ? `rgba(37,99,235,${0.1 * (1 - prog(frame, a.at + 20, 30))})` : undefined }}>
                <span>
                  <b>{a.who}</b> <span style={{ color: A.muted }}>{a.what}</span>
                </span>
                <span style={{ color: A.muted }}>{a.at > 0 ? 'just now' : '2 hours ago'}</span>
              </div>
            )
          })}
        </div>
        {/* Comment being typed */}
        <div style={{ position: 'absolute', left: 34, right: 34, bottom: 26, display: 'flex', gap: 12, alignItems: 'flex-start', opacity: prog(frame, COMMENT - 10, 12), translate: `0 ${(1 - prog(frame, COMMENT - 10, 16)) * 30}px` }}>
          <Avatar name="PS" color="#f97316" size={34} />
          <div style={{ flex: 1, border: `1.5px solid ${A.blue}`, borderRadius: 12, padding: '12px 14px', fontSize: 16, color: A.ink, minHeight: 22 }}>
            {typed('Nice! I’ll test it on my phone tonight.', frame, COMMENT, fps, 26)}
            <Caret />
          </div>
        </div>
      </div>

      {/* Right: details and checklist */}
      <div style={{ width: 400, background: '#fafbfd', borderLeft: `1px solid ${A.border}`, padding: '28px 26px', position: 'relative' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Details</div>
        <div style={{ fontSize: 14, color: A.muted, marginTop: 16 }}>Assignee</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, padding: '8px 12px', border: `1px solid ${A.border}`, borderRadius: 10, background: 'white', fontSize: 16, fontWeight: 500 }}>
          <Avatar name="AR" color="#e0e7ff" ink={A.blue} size={26} /> Alex Rivera
        </div>
        <div style={{ display: 'flex', gap: 26, marginTop: 16, fontSize: 14, color: A.muted }}>
          <div>
            Status
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 15, color: A.ink, fontWeight: 500 }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: A.blue }} /> In progress
            </div>
          </div>
          <div>
            Due date
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 15, color: A.ink, fontWeight: 500 }}>
              <Calendar size={15} /> Today, 15:00
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: A.border, margin: '20px 0 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, position: 'relative' }}>
          Checklist
          <span style={{ color: complete ? A.green : A.muted, position: 'relative' }}>
            {done}/5
            <span style={{ position: 'absolute', left: 12, top: 10 }}>
              <Burst at={TICK2 + 4} />
            </span>
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', marginTop: 10, overflow: 'hidden' }}>
          <div style={{ width: `${bar * 100}%`, height: '100%', borderRadius: 4, background: complete ? A.green : A.blue }} />
        </div>
        <div style={{ position: 'absolute', left: 26, right: 26, top: LIST_TOP }}>
          {ITEMS.map((t, i) => (
            <div key={t} style={{ height: ROW, display: 'flex', alignItems: 'center', gap: 12, fontSize: 16 }}>
              <Check on={ticks[i]} />
              <span style={{ position: 'relative', color: ticks[i] > 0.5 ? A.muted : A.ink }}>
                {t}
                <span style={{ position: 'absolute', left: 0, top: '52%', height: 1.5, background: A.muted, width: `${(i < 3 ? 1 : ticks[i]) * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 26, right: 26, bottom: 26, fontSize: 13, color: A.muted, lineHeight: 1.6 }}>
          Mentioned in notes: <span style={{ color: A.blue, fontWeight: 600 }}>Sprint 3 plan</span>
        </div>
      </div>

      <Cursor2 />
    </div>
  )
}

/** Cursor in modal coordinates: ticks the last two checklist items. */
const Cursor2 = () => {
  const rowY = (i: number) => LIST_TOP + i * ROW + 14
  const x = W - 400 + 26 + 6
  return (
    <CursorWrap
      path={[
        { f: 50, x: 900, y: 700 },
        { f: TICK1 - 3, x, y: rowY(3) },
        { f: TICK1, x, y: rowY(3), down: true },
        { f: TICK1 + 5, x, y: rowY(3) },
        { f: TICK2 - 3, x, y: rowY(4) },
        { f: TICK2, x, y: rowY(4), down: true },
        { f: TICK2 + 5, x, y: rowY(4) },
        { f: TICK2 + 40, x: x + 120, y: rowY(4) + 140 },
      ]}
    />
  )
}

export const Task = () => (
  <AbsoluteFill>
    <Backdrop glow="right" />
    <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', padding: '0 0 0 110px', gap: 70 }}>
      <Caption eyebrow="Tasks" title="Everything about a task, in one place." accentFrom={4} body="Owner, checklist, files, comments, and a full history of who changed what." start={4} width={520} />
      <Camera
        keys={[
          { f: 0, rx: 18, ry: -30, s: 0.6, x: 120, y: 60 },
          { f: 36, rx: 4, ry: -8, s: 0.97, x: 0, y: 0 },
          { f: TICK1, rx: 3, ry: -10, s: 1.04, x: -40, y: -10 },
          { f: TICK2 + 20, rx: 3, ry: -7, s: 1.05, x: -60, y: -10 },
          { f: COMMENT + 10, rx: 4, ry: -5, s: 1.03, x: -30, y: -30 },
        ]}
      >
        <TaskModal />
      </Camera>
    </AbsoluteFill>
    {[TICK1, TICK2].map((f) => (
      <Sequence key={f} from={f} durationInFrames={20}>
        <Audio src={staticFile('sfx/mouse-click.wav')} volume={0.45} />
      </Sequence>
    ))}
    <Sequence from={TICK2 + 4} durationInFrames={60}>
      <Audio src={staticFile('sfx/ding.wav')} volume={0.25} />
    </Sequence>
  </AbsoluteFill>
)
