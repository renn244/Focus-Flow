import type { ReactNode } from 'react'
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { Backdrop, Brand, Caption, Phone, Rise, Shot, type Box } from './components'
import { TRANSITION, hasVoice, scenes, type SceneId } from './narration'
import { C, fontFamily } from './theme'

const SHOT_W = 1180

const frames = (id: SceneId) => scenes.find((s) => s.id === id)!.frames

/** Converts highlight timings given as a fraction of the scene into frames. */
const at = (id: SceneId, boxes: (Omit<Box, 'at'> & { at: number })[]) =>
  boxes.map((b) => ({ ...b, at: Math.round(b.at * frames(id)) }))

const Feature = ({ side, caption, children, glow }: { side: 'left' | 'right'; caption: ReactNode; children: ReactNode; glow?: 'left' | 'right' }) => (
  <AbsoluteFill>
    <Backdrop glow={glow ?? (side === 'left' ? 'right' : 'left')} />
    <AbsoluteFill
      style={{
        flexDirection: side === 'left' ? 'row' : 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 90,
        padding: '0 70px',
      }}
    >
      {caption}
      <div style={{ position: 'relative', width: SHOT_W }}>{children}</div>
    </AbsoluteFill>
  </AbsoluteFill>
)

const Accent = ({ children }: { children: ReactNode }) => <span style={{ color: C.blueSoft }}>{children}</span>

const Intro = () => {
  const frame = useCurrentFrame()
  const d = frames('intro')
  const out = interpolate(frame, [d * 0.42, d * 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill>
      <Backdrop glow="center" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily, textAlign: 'center' }}>
        <Rise delay={0}>
          <Brand />
        </Rise>
        <div style={{ position: 'relative', height: 200, width: 1500, marginTop: 70 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: out }}>
            <Rise delay={12}>
              <div style={{ color: C.muted, fontSize: 76, fontWeight: 600, letterSpacing: '-0.035em' }}>Most task apps show you the project.</div>
            </Rise>
          </div>
          <div style={{ position: 'absolute', inset: 0 }}>
            <Rise delay={Math.round(d * 0.5)}>
              <div style={{ color: C.ink, fontSize: 76, fontWeight: 700, letterSpacing: '-0.035em' }}>
                FocusFlow tells you <Accent>what to do next.</Accent>
              </div>
            </Rise>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

const MyWork = () => (
  <Feature
    side="left"
    caption={<Caption eyebrow="My work" title={<>Your day, <Accent>at a glance.</Accent></>} body="Overdue, due today and the week ahead, across every project you're in." />}
  >
    <Shot
      src="shots/my-work.png"
      width={SHOT_W}
      duration={frames('mywork')}
      to={{ x: 0.3, y: 0.3, s: 1.12 }}
      boxes={at('mywork', [
        { x: 46, y: 110, w: 305, h: 22, at: 0.18 },
        { x: 46, y: 151, w: 1188, h: 71, at: 0.4 },
        { x: 46, y: 244, w: 882, h: 184, at: 0.62 },
      ])}
    />
  </Feature>
)

const Board = () => (
  <Feature
    side="right"
    caption={<Caption eyebrow="Boards" title={<>Plan together, <Accent>keep your focus.</Accent></>} body="Shared boards with drag and drop, and your own agenda docked beside them." />}
  >
    <Shot
      src="shots/board.png"
      width={SHOT_W}
      duration={frames('board')}
      from={{ x: 0.5, y: 0.4, s: 1 }}
      to={{ x: 0.35, y: 0.35, s: 1.12 }}
      boxes={at('board', [
        { x: 574, y: 296, w: 194, h: 152, at: 0.25 },
        { x: 10, y: 105, w: 282, h: 160, at: 0.55 },
      ])}
    />
  </Feature>
)

const Task = () => (
  <Feature
    side="left"
    caption={<Caption eyebrow="Tasks" title={<>Everything about a task, <Accent>in one place.</Accent></>} body="Owner, checklist, files, comments, and a full history of who changed what." />}
  >
    <Shot
      src="shots/task.png"
      width={SHOT_W}
      duration={frames('task')}
      to={{ x: 0.62, y: 0.55, s: 1.1 }}
      boxes={at('task', [
        { x: 881, y: 365, w: 256, h: 160, at: 0.22 },
        { x: 150, y: 430, w: 690, h: 280, at: 0.55 },
      ])}
    />
  </Feature>
)

const Notes = () => {
  const d = frames('notes')
  const swap = Math.round(d * 0.48)
  return (
    <Feature
      side="right"
      caption={<Caption eyebrow="Notes" title={<>Notes that sit <Accent>next to the work.</Accent></>} body="Link tasks with #, and every save keeps a version you can compare and restore." />}
    >
      <Shot
        src="shots/notes.png"
        width={SHOT_W}
        duration={swap + 10}
        to={{ x: 0.85, y: 0.3, s: 1.08 }}
        boxes={[
          { x: 912, y: 240, w: 56, h: 26, at: Math.round(swap * 0.35) },
          { x: 1034, y: 333, w: 219, h: 28, at: Math.round(swap * 0.65) },
        ]}
      />
      <Sequence from={swap} layout="none">
        <div style={{ position: 'absolute', inset: 0 }}>
          <Shot
            src="shots/note-history.png"
            width={SHOT_W}
            duration={d - swap}
            from={{ x: 0.5, y: 0.4, s: 1 }}
            to={{ x: 0.55, y: 0.38, s: 1.12 }}
            boxes={[
              { x: 582, y: 357, w: 200, h: 20, at: 18 },
              { x: 1026, y: 201, w: 234, h: 120, at: 40 },
            ]}
          />
        </div>
      </Sequence>
    </Feature>
  )
}

const Mobile = () => (
  <AbsoluteFill>
    <Backdrop glow="center" />
    <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110, fontFamily }}>
      <Caption eyebrow="Mobile" title={<>Works on <Accent>your phone.</Accent></>} body="The board stacks, tasks become one scrolling page, and your agenda is a tap away." />
      <div style={{ display: 'flex', gap: 48 }}>
        <Phone src="shots/mobile-my-work.png" delay={6} tilt={-3} />
        <Phone src="shots/mobile-task.png" delay={14} tilt={3} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
)

const Outro = () => (
  <AbsoluteFill>
    <Backdrop glow="center" />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily, textAlign: 'center' }}>
      <Rise delay={0}>
        <Brand size={1.5} />
      </Rise>
      <Rise delay={14} style={{ marginTop: 56 }}>
        <div style={{ color: C.ink, fontSize: 62, fontWeight: 700, letterSpacing: '-0.035em' }}>Plan the work together.</div>
        <div style={{ color: C.blueSoft, fontSize: 62, fontWeight: 700, letterSpacing: '-0.035em', marginTop: 6 }}>Know what's yours today.</div>
      </Rise>
      <Rise delay={34} style={{ marginTop: 64 }}>
        <div style={{ color: C.muted, fontSize: 26, letterSpacing: '0.02em' }}>
          React · NestJS · MongoDB&nbsp;&nbsp;—&nbsp;&nbsp;github.com/renn244/Focus-Flow
        </div>
      </Rise>
    </AbsoluteFill>
  </AbsoluteFill>
)

const VIEWS: Record<SceneId, () => ReactNode> = {
  intro: Intro,
  mywork: MyWork,
  board: Board,
  task: Task,
  notes: Notes,
  mobile: Mobile,
  outro: Outro,
}

export const Promo = () => (
  <AbsoluteFill style={{ background: C.bgDeep }}>
    <TransitionSeries>
      {scenes.flatMap((s, i) => {
        const View = VIEWS[s.id]
        const items = [
          <TransitionSeries.Sequence key={s.id} durationInFrames={s.frames}>
            <View />
            {hasVoice && (
              <Sequence from={i === 0 ? 10 : TRANSITION}>
                <Audio src={staticFile(`voice/${s.id}.mp3`)} />
              </Sequence>
            )}
          </TransitionSeries.Sequence>,
        ]
        if (i < scenes.length - 1) {
          const presentation = i === 0 || i === scenes.length - 2 ? fade() : slide({ direction: i % 2 ? 'from-right' : 'from-left' })
          items.push(
            <TransitionSeries.Transition key={`${s.id}-t`} presentation={presentation} timing={linearTiming({ durationInFrames: TRANSITION })} />,
          )
        }
        return items
      })}
    </TransitionSeries>
  </AbsoluteFill>
)
