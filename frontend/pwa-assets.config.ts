import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the app icons from public/logo.svg: `npx pwa-assets-generator`
const brand = { resizeOptions: { background: '#2563eb' } }

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0.25, ...brand },
    apple: { ...minimal2023Preset.apple, padding: 0.25, ...brand },
  },
  images: ['public/logo.svg'],
})
