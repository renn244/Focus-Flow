import { Composition } from 'remotion'
import { Promo } from './Promo'
import { FPS, totalFrames } from './narration'

export const Root = () => (
  <Composition id="Promo" component={Promo} durationInFrames={totalFrames} fps={FPS} width={1920} height={1080} />
)
