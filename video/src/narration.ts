/**
 * The script. Each scene has its narration line and a length in seconds.
 * `npm run voice` makes public/voice/<id>.mp3 for every line with ElevenLabs
 * and rewrites `seconds` in voice-durations.json to fit the audio.
 */
import durations from './voice-durations.json'

export type SceneId = 'intro' | 'mywork' | 'board' | 'task' | 'notes' | 'mobile' | 'outro'

export const SCRIPT: { id: SceneId; text: string; seconds: number }[] = [
  { id: 'intro', seconds: 6, text: 'Most task apps show you the project. FocusFlow also tells you what to do next.' },
  { id: 'mywork', seconds: 7.5, text: "Open it and see your day: what's overdue, what's due today, and the week ahead, across every project you're in." },
  { id: 'board', seconds: 8, text: 'Your team plans on shared boards. Drag tasks around, and your own agenda stays right beside you.' },
  { id: 'task', seconds: 7.5, text: 'Every task keeps it all in one place: the owner, a checklist, files, comments, and its full history.' },
  { id: 'notes', seconds: 8.5, text: 'Write project notes next to the work, link tasks with a hashtag, and bring back any earlier version.' },
  { id: 'mobile', seconds: 4.5, text: 'And it works just as well on your phone.' },
  { id: 'outro', seconds: 5, text: "FocusFlow. Plan the work together. Know what's yours today." },
]

const voice = durations as Partial<Record<SceneId, number>>

/** Padding after each line so the narration breathes between scenes. */
const PAD = 0.6

export const FPS = 30
export const TRANSITION = 15 // frames of overlap between scenes

export const hasVoice = Object.keys(voice).length > 0

/** How each scene hands over to the next: a zoom-through (overlaps) or a light leak over a hard cut. */
export const CUTS: ('zoom' | 'leak')[] = ['zoom', 'leak', 'zoom', 'leak', 'zoom', 'leak']

export const scenes = SCRIPT.map((s, i) => ({
  ...s,
  // A zoom overlaps the next scene, so give the scene those frames back.
  frames: Math.round((voice[s.id] ? Math.max(voice[s.id]! + PAD, s.seconds) : s.seconds) * FPS) + (CUTS[i] === 'zoom' ? TRANSITION : 0),
}))

export const totalFrames = scenes.reduce((sum, s) => sum + s.frames, 0) - TRANSITION * CUTS.filter((c) => c === 'zoom').length
