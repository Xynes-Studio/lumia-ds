import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { expect, vi } from 'vitest';

expect.extend(toHaveNoViolations);

// @ts-expect-error - matchMedia is not defined in JSDOM
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock URL methods
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

// Mock DragEvent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).DragEvent = class DragEvent extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(type: string, eventInitDict?: any) {
    super(type, eventInitDict);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
