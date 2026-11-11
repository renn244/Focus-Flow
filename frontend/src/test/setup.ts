import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom lacks these browser APIs that UI libraries touch on render.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  })
}
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
}
