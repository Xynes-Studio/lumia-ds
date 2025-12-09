import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetIconRegistry } from '../registry';
import {
  clearWarnedIcons,
  createDeprecatedIcon,
  IconHome,
  IconBold,
  IconInfo,
} from './legacy-icons';

describe('compatibility layer', () => {
  beforeEach(() => {
    resetIconRegistry();
    clearWarnedIcons();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createDeprecatedIcon', () => {
    it('creates a component that renders the Icon component', () => {
      const TestIcon = createDeprecatedIcon('home', 'TestIcon');
      const markup = renderToStaticMarkup(<TestIcon />);

      expect(markup).toContain('<svg');
      expect(markup).toContain('width="24"');
      expect(markup).toContain('height="24"');
    });

    it('logs deprecation warning in development', () => {
      const TestIcon = createDeprecatedIcon('home', 'TestIcon');
      renderToStaticMarkup(<TestIcon />);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('TestIcon is deprecated'),
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Use <Icon name="home" />'),
      );
    });

    it('only warns once per icon', () => {
      const TestIcon = createDeprecatedIcon('home', 'SingleWarnIcon');
      renderToStaticMarkup(<TestIcon />);
      renderToStaticMarkup(<TestIcon />);
      renderToStaticMarkup(<TestIcon />);

      // Filter calls for this specific icon
      const calls = (
        console.warn as ReturnType<typeof vi.fn>
      ).mock.calls.filter((call) => call[0].includes('SingleWarnIcon'));
      expect(calls).toHaveLength(1);
    });

    it('passes size prop to Icon', () => {
      const TestIcon = createDeprecatedIcon('home', 'SizeTestIcon');
      const markup = renderToStaticMarkup(<TestIcon size="lg" />);

      expect(markup).toContain('width="32"');
      expect(markup).toContain('height="32"');
    });

    it('passes color prop to Icon', () => {
      const TestIcon = createDeprecatedIcon('home', 'ColorTestIcon');
      const markup = renderToStaticMarkup(<TestIcon color="primary" />);

      expect(markup).toContain('text-primary');
    });

    it('passes className to Icon', () => {
      const TestIcon = createDeprecatedIcon('home', 'ClassTestIcon');
      const markup = renderToStaticMarkup(<TestIcon className="my-class" />);

      expect(markup).toContain('my-class');
    });
  });

  describe('legacy icon exports', () => {
    it('IconHome routes through new Icon component', () => {
      const markup = renderToStaticMarkup(<IconHome />);

      expect(markup).toContain('<svg');
      expect(markup).toContain('width="24"');
    });

    it('IconBold routes through new Icon component', () => {
      const markup = renderToStaticMarkup(<IconBold />);

      expect(markup).toContain('<svg');
      expect(markup).toContain('width="24"');
    });

    it('IconInfo routes through new Icon component', () => {
      const markup = renderToStaticMarkup(<IconInfo />);

      expect(markup).toContain('<svg');
    });

    it('legacy icons log deprecation warnings', () => {
      renderToStaticMarkup(<IconHome />);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('IconHome is deprecated'),
      );
    });

    it('legacy icons accept size prop', () => {
      const markup = renderToStaticMarkup(<IconHome size="sm" />);

      expect(markup).toContain('width="16"');
      expect(markup).toContain('height="16"');
    });

    it('legacy icons accept color prop', () => {
      const markup = renderToStaticMarkup(<IconBold color="danger" />);

      expect(markup).toContain('text-destructive');
    });
  });

  describe('backward compatibility', () => {
    it('old API path routes through new Icon component', () => {
      // This is the main acceptance criteria test
      const legacyMarkup = renderToStaticMarkup(<IconHome size="md" />);

      // Verify it renders the same as the new Icon component would
      expect(legacyMarkup).toContain('<svg');
      expect(legacyMarkup).toContain('width="24"');
      expect(legacyMarkup).toContain('height="24"');
      expect(legacyMarkup).toContain('aria-hidden="true"');
    });
  });
});
