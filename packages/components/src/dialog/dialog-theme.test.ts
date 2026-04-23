import { describe, expect, it } from 'vitest';
import {
  DIALOG_OVERLAY_BACKDROP,
  getDialogOverlayBackdrop,
  resolveDialogTheme,
} from './dialog-theme';

describe('dialog-theme', () => {
  it('defaults to light theme when no root is provided', () => {
    expect(resolveDialogTheme()).toBe('light');
  });

  it('prefers data-theme over class-based inference', () => {
    const root = document.createElement('div');
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');

    expect(resolveDialogTheme(root)).toBe('dark');
  });

  it('falls back to the dark class when data-theme is absent', () => {
    const root = document.createElement('div');
    root.classList.add('dark');

    expect(resolveDialogTheme(root)).toBe('dark');
  });

  it('returns light when neither data-theme nor dark class is present', () => {
    const root = document.createElement('div');

    expect(resolveDialogTheme(root)).toBe('light');
  });

  it('maps theme tokens to overlay backdrops', () => {
    expect(getDialogOverlayBackdrop('light')).toBe(
      DIALOG_OVERLAY_BACKDROP.light,
    );
    expect(getDialogOverlayBackdrop('dark')).toBe(DIALOG_OVERLAY_BACKDROP.dark);
  });
});
