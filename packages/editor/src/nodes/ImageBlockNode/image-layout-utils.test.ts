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
    expect(getImageContainerStyle('fullWidth')).toEqual({ width: '100%' });
  });

  it('returns empty object if defined and not fullWidth', () => {
    expect(getImageContainerStyle('inline')).toEqual({});
    expect(getImageContainerStyle(undefined)).toEqual({});
  });

  it('returns empty object if no width and not fullWidth', () => {
    expect(getImageContainerStyle('inline')).toEqual({});
    expect(getImageContainerStyle(undefined)).toEqual({});
  });
});
