import { useContext } from 'react';
import { FontsContext } from './EditorProvider';
import type { FontConfig } from './font-config';

/**
 * Hook to access the current font configuration in the editor.
 * Must be used within an EditorProvider.
 *
 * @returns The current FontConfig
 * @throws Error if used outside of EditorProvider
 */
export function useFontsConfig(): FontConfig {
  const config = useContext(FontsContext);
  if (!config) {
    throw new Error('useFontsConfig must be used within an EditorProvider');
  }
  return config;
}
