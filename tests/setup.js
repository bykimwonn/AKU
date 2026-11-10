import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// The staged animations hand over in under a second; give the async queries
// room so a test never fails simply because it checked a beat too early.
configure({ asyncUtilTimeout: 3000 });

/**
 * jsdom has no canvas, no observers and no media queries — all three are used
 * by the decorative layer. These stubs keep the real component logic under
 * test while making the browser-only parts harmless.
 */
const noop = () => {};

function mockContext() {
  const gradient = { addColorStop: noop };
  return {
    canvas: { width: 0, height: 0 },
    clearRect: noop,
    setTransform: noop,
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    bezierCurveTo: noop,
    quadraticCurveTo: noop,
    arc: noop,
    fill: noop,
    stroke: noop,
    fillRect: noop,
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => null,
    measureText: () => ({ width: 10 }),
  };
}

class StubIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    StubIntersectionObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
StubIntersectionObserver.instances = [];

class StubResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = mockContext;
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 400 });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 300 });
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });

  window.ResizeObserver = StubResizeObserver;
  window.IntersectionObserver = StubIntersectionObserver;
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  }));
  window.scrollTo = vi.fn();
  // No Web Audio in jsdom: the site must fall back gracefully, not crash.
  delete window.AudioContext;
  delete window.webkitAudioContext;
});

afterEach(() => {
  delete window.__AKU_TEST__;
});
