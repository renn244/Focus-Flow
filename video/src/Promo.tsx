import type { ReactNode } from 'react'
import { AbsoluteFill, Sequence, staticFile } from 'remotion'
import { Audio } from '@remotion/media'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { CUTS, TRANSITION, hasVoice, scenes, type SceneId } from './narration'
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

export const Promo = () => (
  <AbsoluteFill style={{ background: C.bgDeep }}>
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
