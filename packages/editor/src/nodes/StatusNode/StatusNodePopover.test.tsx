import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react';
import { StatusNodePopover } from './StatusNodePopover';

// Mock the LexicalComposerContext
vi.mock('@lexical/react/LexicalComposerContext', async () => {
  const actual = await vi.importActual('@lexical/react/LexicalComposerContext');
  return {
    ...actual,
    useLexicalComposerContext: () => [
      {
        update: vi.fn((callback: () => void) => callback()),
        registerCommand: vi.fn(),
      },
    ],
  };
});

// Mock useLexicalNodeSelection
vi.mock('@lexical/react/useLexicalNodeSelection', () => ({
  useLexicalNodeSelection: () => [false, vi.fn(), vi.fn()],
}));

// Mock lexical's $getNodeByKey
vi.mock('lexical', async () => {
  const actual = await vi.importActual('lexical');
  return {
    ...actual,
    $getNodeByKey: vi.fn(() => ({
      setText: vi.fn(),
      setColor: vi.fn(),
    })),
  };
});

describe('StatusNodePopover', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  test('renders StatusPill with correct text and color', async () => {
    await act(async () => {
      root.render(
        <StatusNodePopover
          nodeKey="test-key"
          text="In Progress"
          color="info"
        />,
      );
    });

    const statusTrigger = container.querySelector('[data-status-node-trigger]');
    expect(statusTrigger).toBeDefined();
    expect(statusTrigger?.textContent).toContain('In Progress');
  });

  test('renders with different colors', async () => {
    const colors = ['success', 'warning', 'error', 'info'] as const;

    for (const color of colors) {
      await act(async () => {
        root.render(
          <StatusNodePopover
            nodeKey={`key-${color}`}
            text={`Status ${color}`}
            color={color}
          />,
        );
      });

      const statusTrigger = container.querySelector(
        '[data-status-node-trigger]',
      );
      expect(statusTrigger).toBeDefined();
      expect(statusTrigger?.textContent).toContain(`Status ${color}`);
    }
  });

  test('trigger has correct accessibility attributes', async () => {
    await act(async () => {
      root.render(
        <StatusNodePopover nodeKey="test-key" text="Test" color="info" />,
      );
    });

    const trigger = container.querySelector('[data-status-node-trigger]');
    expect(trigger?.getAttribute('role')).toBe('button');
    expect(trigger?.getAttribute('tabindex')).toBe('0');
  });
});
