import React from 'react';
import { render, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect, vi, describe, it } from 'vitest';
import { LumiaEditor } from './lumia-editor';
import { LumiaInlineEditor } from './LumiaInlineEditor';

expect.extend(toHaveNoViolations);

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Accessibility', () => {
  it('LumiaEditor should have no violations', async () => {
    const { container } = render(
      <LumiaEditor value={null} onChange={() => {}} />,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LumiaInlineEditor should have no violations', async () => {
    const { container } = render(
      <LumiaInlineEditor value={null} onChange={() => {}} />,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
