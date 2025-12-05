import { describe, it, expect } from 'vitest';
import {
  getImageLayoutClass,
  getImageContainerStyle,
} from './image-layout-utils';

describe('getImageLayoutClass', () => {
  it('returns empty string for undefined layout', () => {
    expect(getImageLayoutClass(undefined)).toBe('');
  });

  it('returns correct class for inline', () => {
    expect(getImageLayoutClass('inline')).toBe('layout-inline');
  });

  it('returns correct class for breakout', () => {
    expect(getImageLayoutClass('breakout')).toBe('layout-breakout');
  });

  it('returns correct class for fullWidth', () => {
    expect(getImageLayoutClass('fullWidth')).toBe('layout-fullWidth');
  });
});

describe('getImageContainerStyle', () => {
  it('returns width 100% for fullWidth layout', () => {
    expect(getImageContainerStyle('fullWidth', 50)).toEqual({ width: '100%' });
  });

  it('returns percentage width if defined and not fullWidth', () => {
    expect(getImageContainerStyle('inline', 50)).toEqual({ width: '50%' });
    expect(getImageContainerStyle(undefined, 75)).toEqual({ width: '75%' });
  });

  it('returns empty object if no width and not fullWidth', () => {
    expect(getImageContainerStyle('inline', undefined)).toEqual({});
    expect(getImageContainerStyle(undefined, undefined)).toEqual({});
  });
});
