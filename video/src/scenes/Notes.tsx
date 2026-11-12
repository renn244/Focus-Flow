import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Audio } from '@remotion/media'
import { Highlight, StrikeThrough } from '@remotion/rough-notation'
import { ArrowLeft, Bold, Code, Hash, History, Italic, Link, List, ListChecks, Pin } from 'lucide-react'
import { Backdrop } from '../components'
import { fontFamily } from '../theme'
import { A, Caption, Caret, Camera, mix, pop, prog, typed, EASE_IO } from '../ui'

const W = 1120
const H = 740
const LINE = 'A working sign-up and task list by Monday, ready to demo.'
const HASH = 100 // "#" typed: task picker opens
const PICKED = 130 // task chosen
const FLIP = 158 // flip to version history

const TASKS = ['Build the sign-up flow', 'Fix the date picker on mobile', 'Rehearse the demo']

const Toolbar = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 0', borderBottom: `1px solid ${A.border}`, color: A.muted }}>
    {[Bold, Italic, List, ListChecks, Code, Link].map((I, i) => (
      <I key={i} size={18} />
    ))}
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: A.blue, fontWeight: 600, fontSize: 15 }}>
      <Hash size={16} /> Task
    </span>
  </div>
)

const Editor = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const text = typed(LINE, frame, 24, fps, 30)
  const picker = prog(frame, HASH + 2, 10) * (1 - prog(frame, PICKED, 8))
  // The highlight starts on the second task, then moves up to the one we pick.
  const selRow = mix(1, 0, prog(frame, HASH + 14, 8))
  const chip = pop(frame, PICKED, fps)
  const typingNext = frame >= 86
  const nextText = typed('Next up: ', frame, 86, fps, 24)
  const linked = prog(frame, PICKED + 6, 14)

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {/* Notes list */}
      <div style={{ width: 230, background: '#eef1f7', padding: '22px 16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 600 }}>
          Notes <span style={{ background: A.blue, color: 'white', borderRadius: 8, padding: '5px 12px', fontSize: 14 }}>+ New</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 12, color: A.muted, fontWeight: 600, letterSpacing: '0.06em' }}>PINNED</div>
        <div style={{ marginTop: 8, background: 'white', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600 }}>
            <Pin size={13} color={A.blue} /> Sprint 3 plan
          </div>
          <div style={{ fontSize: 13, color: A.muted, marginTop: 3 }}>Jordan Lee · just now</div>
        </div>
        <div style={{ marginTop: 8, borderRadius: 10, padding: '10px 12px', fontSize: 15, color: A.text }}>Interview questions</div>
        <div style={{ borderRadius: 10, padding: '10px 12px', fontSize: 15, color: A.text }}>Demo checklist</div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, background: 'white', padding: '30px 40px', position: 'relative' }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>Sprint 3 plan</div>
        <div style={{ fontSize: 14, color: A.muted, marginTop: 4 }}>Last edited by Jordan Lee, just now</div>
        <Toolbar />
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 24 }}>Goal</div>
        <div style={{ fontSize: 18, marginTop: 10, color: A.ink, minHeight: 28 }}>
          {text}
          {!typingNext && <Caret />}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 26, opacity: prog(frame, 70, 10) }}>Open questions</div>
        <div style={{ fontSize: 18, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, minHeight: 34, position: 'relative' }}>
          {nextText}
          {frame >= HASH && frame < PICKED && <span style={{ color: A.blue, fontWeight: 600 }}>#</span>}
          {frame >= PICKED && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, background: A.blueBg, color: A.blue, fontWeight: 600, fontSize: 16, scale: String(chip), border: `1px solid #c7d7fe` }}>
              <Hash size={14} /> Build the sign-up flow
            </span>
          )}
          {typingNext && <Caret />}

          {/* Task picker */}
          <div style={{ position: 'absolute', left: 90, top: 42, width: 340, background: 'white', borderRadius: 12, border: `1px solid ${A.border}`, boxShadow: '0 20px 50px rgba(15,23,42,0.18)', padding: 6, opacity: picker, translate: `0 ${(1 - picker) * -10}px`, scale: String(0.96 + picker * 0.04), zIndex: 5 }}>
            <div style={{ position: 'absolute', left: 6, right: 6, top: 6 + selRow * 40, height: 40, borderRadius: 8, background: A.blueBg }} />
            {TASKS.map((t) => (
              <div key={t} style={{ position: 'relative', height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', fontSize: 15 }}>
                <Hash size={14} color={A.muted} /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 250, borderLeft: `1px solid ${A.border}`, background: 'white', padding: '26px 20px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Linked tasks {frame >= PICKED + 6 ? 1 : 0}</div>
        <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${A.border}`, fontSize: 14, fontWeight: 600, opacity: linked, translate: `${(1 - linked) * 30}px 0` }}>
          Build the sign-up flow
          <div style={{ fontSize: 12, color: A.blue, fontWeight: 500, marginTop: 3 }}>In progress · 3/5</div>
        </div>
        <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 0', borderRadius: 9, background: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>
          <History size={15} /> Version history
        </div>
      </div>
    </div>
  )
}

const VersionHistory = () => {
  const frame = useCurrentFrame()
  const strike = prog(frame, FLIP + 30, 16)
  const hi = prog(frame, FLIP + 44, 22)
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#eef1f7' }}>
      <div style={{ height: 60, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', background: 'white', borderBottom: `1px solid ${A.border}`, fontSize: 15 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${A.border}`, borderRadius: 8, padding: '6px 12px' }}>
          <ArrowLeft size={15} /> Back
        </span>
        <span style={{ color: A.muted }}>
          Sprint 3 plan · <b style={{ color: A.ink }}>Version history</b>
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <span style={{ width: 40, height: 22, borderRadius: 11, background: A.blue, position: 'relative' }}>
            <span style={{ position: 'absolute', right: 3, top: 3, width: 16, height: 16, borderRadius: 8, background: 'white' }} />
          </span>
          Show changes
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 22, padding: 24 }}>
        <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: '28px 36px', border: `1px solid ${A.border}` }}>
          <div style={{ fontSize: 14, color: A.muted }}>Current version · last edited by Jordan Lee</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 12 }}>Sprint 3 plan</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 26 }}>Goal</div>
          <div style={{ fontSize: 20, marginTop: 12, paddingLeft: 16, borderLeft: '4px solid #facc15', lineHeight: 1.6 }}>
            A working sign-up and task list by{' '}
            <StrikeThrough color={A.red} strokeWidth={3} progress={strike}>
              <span style={{ color: strike > 0 ? A.red : A.ink }}>Friday</span>
            </StrikeThrough>{' '}
            <Highlight color="rgba(16,185,129,0.28)" progress={hi}>
              <span style={{ opacity: prog(frame, FLIP + 40, 8) }}>Monday, ready to demo</span>
            </Highlight>
            .
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 26 }}>Open questions</div>
          <div style={{ fontSize: 18, marginTop: 10, color: A.text }}>Next up: <span style={{ color: A.blue, fontWeight: 600 }}>#Build the sign-up flow</span></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 30, fontSize: 13 }}>
            <span style={{ background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 5 }}>added</span>
            <span style={{ background: '#fee2e2', color: A.red, padding: '2px 8px', borderRadius: 5, textDecoration: 'line-through' }}>removed</span>
          </div>
        </div>
        <div style={{ width: 280, background: 'white', borderRadius: 16, border: `1px solid ${A.border}`, padding: 14, fontSize: 14 }}>
          {[
            { t: 'Current version', s: 'Jordan Lee · +1 −1', i: 'JL', on: true },
            { t: 'Yesterday, 9:49 PM', s: 'Alex Rivera · +5', i: 'AR' },
            { t: 'Monday, 4:12 PM', s: 'Priya Shah · +12', i: 'PS' },
          ].map((v, k) => {
            const p = prog(frame, FLIP + 14 + k * 5, 12)
            return (
              <div key={v.t} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 10px', borderRadius: 10, background: v.on ? A.blueBg : 'transparent', borderLeft: v.on ? `3px solid ${A.blue}` : '3px solid transparent', marginBottom: 6, opacity: p, translate: `${(1 - p) * 20}px 0` }}>
                <span style={{ width: 30, height: 30, borderRadius: 15, background: '#e2e8f0', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>{v.i}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{v.t}</div>
                  <div style={{ color: A.muted, fontSize: 13 }}>{v.s}</div>
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 14, textAlign: 'center', padding: '9px 0', borderRadius: 9, border: `1px solid ${A.border}`, fontWeight: 600, opacity: prog(frame, FLIP + 34, 12) }}>Restore this version</div>
        </div>
      </div>
    </div>
  )
}

const NotesWindow = () => {
  const frame = useCurrentFrame()
  // Flip: rotate the editor away, swap to history half way, rotate it in.
  const a = prog(frame, FLIP, 10, EASE_IO)
  const b = prog(frame, FLIP + 10, 14)
  const showHistory = frame >= FLIP + 10
  const rot = showHistory ? (1 - b) * -90 : a * 90
  return (
    <div style={{ transform: `rotateY(${rot}deg)`, transformStyle: 'preserve-3d' }}>
      <div style={{ width: W, height: H, borderRadius: 20, overflow: 'hidden', position: 'relative', fontFamily, color: A.ink, boxShadow: '0 60px 140px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)' }}>
        <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: '#141d36' }}>
          {['#f87171', '#fbbf24', '#34d399'].map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
          ))}
          <span style={{ marginLeft: 16, padding: '4px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', color: '#8f9bbb', fontSize: 14 }}>localhost:5173 · Capstone app · Notes</span>
        </div>
        <div style={{ position: 'absolute', top: 38, left: 0, right: 0, bottom: 0 }}>{showHistory ? <VersionHistory /> : <Editor />}</div>
      </div>
    </div>
  )
}

export const Notes = () => (
  <AbsoluteFill>
    <Backdrop glow="left" />
    <AbsoluteFill style={{ flexDirection: 'row-reverse', alignItems: 'center', padding: '0 110px 0 0', gap: 70 }}>
      <Caption eyebrow="Notes" title="Notes that sit next to the work." accentFrom={3} body="Type # to link a task. Every save keeps a version you can compare and restore." start={4} width={500} />
      <Camera
        keys={[
          { f: 0, rx: 14, ry: 28, s: 0.8, x: -140, y: 60 },
          { f: 40, rx: 4, ry: 8, s: 0.97, x: 0, y: 0 },
          { f: HASH, rx: 3, ry: 6, s: 1.05, x: 60, y: 10 },
          { f: FLIP, rx: 3, ry: 6, s: 1.0, x: 20, y: 0 },
          { f: 240, rx: 2, ry: 4, s: 1.06, x: 50, y: 10 },
        ]}
      >
        <NotesWindow />
      </Camera>
    </AbsoluteFill>
    <Sequence from={PICKED} durationInFrames={20}>
      <Audio src={staticFile('sfx/switch.wav')} volume={0.35} />
    </Sequence>
    <Sequence from={FLIP - 2} durationInFrames={30}>
      <Audio src={staticFile('sfx/whoosh.wav')} volume={0.3} />
    </Sequence>
  </AbsoluteFill>
)
