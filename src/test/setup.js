import '@testing-library/jest-dom'

// jsdom does not implement window.matchMedia. Several hooks (useMediaQuery,
// used by usePrefersReducedMotion / useIsMobile) call it at mount time, so
// tests that render those components need a minimal stub.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom does not implement Element.scrollIntoView either — MessageList
// calls it on every message-list update.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
