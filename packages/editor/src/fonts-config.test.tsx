import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EditorProvider } from './EditorProvider';
import { useFontsConfig } from './useFontsConfig';
import type { FontConfig } from './font-config';

// Test component to consume the hook
const FontsConfigConsumer = ({
  onConfig,
}: {
  onConfig: (config: FontConfig) => void;
}) => {
  const config = useFontsConfig();
  onConfig(config);
  return <div>Consumer</div>;
};

describe('useFontsConfig', () => {
  it('returns default config when no fonts prop provided', () => {
    let capturedConfig: FontConfig | null = null;

    render(
      <EditorProvider>
        <FontsConfigConsumer
          onConfig={(config) => {
            capturedConfig = config;
          }}
        />
      </EditorProvider>,
    );

    expect(capturedConfig).not.toBeNull();
    expect(capturedConfig?.allFonts).toBeDefined();
    expect(capturedConfig?.defaultFontId).toBe('inter');
  });

  it('returns custom config when fonts prop provided', () => {
    const customConfig: FontConfig = {
      allFonts: [
        {
          id: 'custom-font',
          label: 'Custom Font',
          cssStack: 'Custom Font, sans-serif',
        },
        {
          id: 'another-font',
          label: 'Another Font',
          cssStack: 'Another Font, serif',
        },
      ],
      defaultFontId: 'custom-font',
    };

    let capturedConfig: FontConfig | null = null;

    render(
      <EditorProvider fonts={customConfig}>
        <FontsConfigConsumer
          onConfig={(config) => {
            capturedConfig = config;
          }}
        />
      </EditorProvider>,
    );

    expect(capturedConfig).toEqual(customConfig);
    expect(capturedConfig?.allFonts.length).toBe(2);
    expect(capturedConfig?.defaultFontId).toBe('custom-font');
  });

  it('custom fonts config is accessible throughout editor tree', () => {
    const customConfig: FontConfig = {
      allFonts: [
        {
          id: 'test-font',
          label: 'Test Font',
          cssStack: 'Test Font, sans-serif',
        },
      ],
      allowedFonts: ['test-font'],
      defaultFontId: 'test-font',
    };

    let capturedConfig: FontConfig | null = null;

    render(
      <EditorProvider fonts={customConfig}>
        <div>
          <div>
            <FontsConfigConsumer
              onConfig={(config) => {
                capturedConfig = config;
              }}
            />
          </div>
        </div>
      </EditorProvider>,
    );

    expect(capturedConfig).toEqual(customConfig);
    expect(capturedConfig?.allowedFonts).toEqual(['test-font']);
  });

  it('throws error when used outside EditorProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      const TestComponent = () => {
        useFontsConfig(); // This should throw
        return <div>Test</div>;
      };

      render(<TestComponent />);
    }).toThrow('useFontsConfig must be used within an EditorProvider');

    console.error = originalError;
  });
});
