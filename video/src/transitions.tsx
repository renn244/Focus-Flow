import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions'
import { lightLeak } from '@remotion/effects/light-leak'
import { AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

/** Old scene pushes forward and blurs away; the new one settles in from behind. */
const ZoomThrough = ({ children, presentationDirection, presentationProgress: p }: TransitionPresentationComponentProps<Record<string, never>>) => {
  const exiting = presentationDirection === 'exiting'
  return (
    <AbsoluteFill
      style={
        exiting
          ? { opacity: 1 - p, scale: String(1 + p * 0.18), filter: `blur(${p * 14}px)` }
          : { opacity: p, scale: String(0.9 + p * 0.1), filter: `blur(${(1 - p) * 14}px)` }
      }
    >
      {children}
    </AbsoluteFill>
  )
}

export const zoomThrough = (): TransitionPresentation<Record<string, never>> => ({ component: ZoomThrough, props: {} })

/** A blue light leak washing over a cut. */
export const LightLeak = ({ seed = 3 }: { seed?: number }) => {
  const frame = useCurrentFrame()
  const { durationInFrames, width, height } = useVideoConfig()
  return (
    <Solid
      width={width}
      height={height}
      style={{ mixBlendMode: 'screen', opacity: 0.4 }}
      effects={[lightLeak({ seed, hueShift: 195, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) })]}
    />
  )
}
