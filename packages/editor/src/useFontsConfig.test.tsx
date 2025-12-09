import React from 'react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFontsConfig } from './useFontsConfig';
import { FontsContext } from './EditorProvider';

describe('useFontsConfig', () => {
  const mockFontConfig = {
    defaultFontId: 'inter',
    availableFonts: [
      { id: 'inter', label: 'Inter', cssStack: "'Inter', sans-serif" },
      { id: 'roboto', label: 'Roboto', cssStack: "'Roboto', sans-serif" },
    ],
    allFonts: [
      { id: 'inter', label: 'Inter', cssStack: "'Inter', sans-serif" },
      { id: 'roboto', label: 'Roboto', cssStack: "'Roboto', sans-serif" },
    ],
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FontsContext.Provider value={mockFontConfig}>
      {children}
    </FontsContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns font config when inside provider', () => {
    const { result } = renderHook(() => useFontsConfig(), { wrapper });

    expect(result.current).toEqual(mockFontConfig);
  });

  it('returns defaultFontId from config', () => {
    const { result } = renderHook(() => useFontsConfig(), { wrapper });

    expect(result.current.defaultFontId).toBe('inter');
  });

  it('returns allFonts from config', () => {
    const { result } = renderHook(() => useFontsConfig(), { wrapper });

    expect(result.current.allFonts).toHaveLength(2);
    expect(result.current.allFonts[0].id).toBe('inter');
  });

  it('throws error when used outside provider', () => {
    // renderHook without wrapper should throw
    expect(() => {
      const { result } = renderHook(() => useFontsConfig());
      // Trigger the hook to run by accessing a property
      return result.current.defaultFontId;
    }).toThrow('useFontsConfig must be used within an EditorProvider');
  });
});
