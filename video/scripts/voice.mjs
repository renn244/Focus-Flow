// Makes the narration with ElevenLabs: one mp3 per scene in public/voice/,
// then writes each clip's length to src/voice-durations.json so the scenes fit.
//
//   ELEVENLABS_API_KEY=... npm run voice            (or ELEVENLABS_API_KEY_FILE=path)
//   VOICE_ID=... to pick another voice (default: Sarah, calm and friendly)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { parseFile } from 'music-metadata'

const key = process.env.ELEVENLABS_API_KEY ?? (process.env.ELEVENLABS_API_KEY_FILE && readFileSync(process.env.ELEVENLABS_API_KEY_FILE, 'utf8').trim())
if (!key) throw new Error('Set ELEVENLABS_API_KEY (or ELEVENLABS_API_KEY_FILE)')
const voice = process.env.VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL'

// Read the script lines straight from narration.ts so there is one source of truth.
const src = readFileSync(new URL('../src/narration.ts', import.meta.url), 'utf8')
const lines = [...src.matchAll(/\{ id: '(\w+)', seconds: [\d.]+, text: (['"])(.*?)\2 \}/g)].map((m) => ({ id: m[1], text: m[3] }))
if (lines.length === 0) throw new Error('No script lines found in narration.ts')

mkdirSync(new URL('../public/voice/', import.meta.url), { recursive: true })
const durations = {}
for (const [i, { id, text }] of lines.entries()) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      previous_text: lines[i - 1]?.text,
      next_text: lines[i + 1]?.text,
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
    }),
  })
  if (!res.ok) throw new Error(`${id}: ${res.status} ${await res.text()}`)
  const file = new URL(`../public/voice/${id}.mp3`, import.meta.url)
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  const { format } = await parseFile(file.pathname.replace(/^\/(\w:)/, '$1'))
  durations[id] = Math.round(format.duration * 100) / 100
  console.log(`${id}: ${durations[id]}s`)
}
writeFileSync(new URL('../src/voice-durations.json', import.meta.url), JSON.stringify(durations, null, 2) + '\n')
console.log('Done. Total voice:', Object.values(durations).reduce((a, b) => a + b, 0).toFixed(1), 's')
