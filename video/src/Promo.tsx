import type { ReactNode } from 'react'
import { AbsoluteFill, Sequence, interpolate, staticFile } from 'remotion'
import { Audio } from '@remotion/media'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { CUTS, TRANSITION, hasVoice, scenes, totalFrames, voiceWindows, type SceneId } from './narration'
import { C } from './theme'
import { LightLeak, zoomThrough } from './transitions'
import { Intro } from './scenes/Intro'
import { MyWork } from './scenes/MyWork'
import { Board } from './scenes/Board'
import { Task } from './scenes/Task'
import { Notes } from './scenes/Notes'
import { Mobile } from './scenes/Mobile'
import { Outro } from './scenes/Outro'

const VIEWS: Record<SceneId, () => ReactNode> = { intro: Intro, mywork: MyWork, board: Board, task: Task, notes: Notes, mobile: Mobile, outro: Outro }

const MUSIC_FULL = 0.34 // music level between lines
const MUSIC_UNDER = 0.11 // music level under the narration
const DUCK = 8 // frames to dip / recover

/** Music level at a frame: fades in and out, and dips while someone is talking. */
const musicVolume = (f: number) => {
  const duck = Math.max(
    0,
    ...voiceWindows.map(([a, b]) => interpolate(f, [a - DUCK, a, b, b + DUCK * 2], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })),
  )
  const fade = interpolate(f, [0, 20, totalFrames - 45, totalFrames - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (MUSIC_FULL - (MUSIC_FULL - MUSIC_UNDER) * duck) * fade
}

export const HAS_MUSIC = true

export const Promo = () => (
  <AbsoluteFill style={{ background: C.bgDeep }}>
    {HAS_MUSIC && <Audio src={staticFile('music/bed.mp3')} volume={musicVolume} />}
    <TransitionSeries>
      {scenes.flatMap((s, i) => {
        const View = VIEWS[s.id]
        const items: ReactNode[] = [
          <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
            <View />
            {i > 0 && <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />}
            {hasVoice && (
              <Sequence from={i === 0 ? 8 : TRANSITION}>
                <Audio src={staticFile(`voice/${s.id}.mp3`)} />
              </Sequence>
            )}
          </TransitionSeries.Sequence>,
        ]
        const cut = CUTS[i]
        if (cut === 'zoom') {
          items.push(<TransitionSeries.Transition key={`${s.id}-cut`} presentation={zoomThrough()} timing={linearTiming({ durationInFrames: TRANSITION })} />)
        } else if (cut === 'leak') {
          items.push(
            <TransitionSeries.Overlay key={`${s.id}-cut`} durationInFrames={36}>
              <LightLeak seed={i * 2 + 1} />
            </TransitionSeries.Overlay>,
          )
        }
        return items
      })}
    </TransitionSeries>
  </AbsoluteFill>
)
