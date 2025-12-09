import { describe, test, expect } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  ParagraphNode,
  TextNode,
} from 'lexical';
import {
  PanelBlockNode,
  $createPanelBlockNode,
} from '../../nodes/PanelBlockNode/PanelBlockNode';
import {
  PANEL_VARIANTS,
  getVariantConfig,
  getVariantTypes,
  getVariantLabel,
  getVariantColor,
  isValidVariant,
  $getPanelNodeFromLexicalNode,
  calculateMenuPosition,
  sanitizePanelTitle,
  hasTitleChanged,
} from '../panelActionUtils';

describe('panelActionUtils', () => {
  describe('PANEL_VARIANTS', () => {
    test('contains all 4 variants', () => {
      expect(PANEL_VARIANTS.length).toBe(4);
    });

    test('includes info variant', () => {
      const info = PANEL_VARIANTS.find((v) => v.variant === 'info');
      expect(info).toBeDefined();
      expect(info?.label).toBe('Info');
      expect(info?.color).toBe('text-blue-500');
    });

    test('includes warning variant', () => {
      const warning = PANEL_VARIANTS.find((v) => v.variant === 'warning');
      expect(warning).toBeDefined();
      expect(warning?.label).toBe('Warning');
      expect(warning?.color).toBe('text-yellow-500');
    });

    test('includes success variant', () => {
      const success = PANEL_VARIANTS.find((v) => v.variant === 'success');
      expect(success).toBeDefined();
      expect(success?.label).toBe('Success');
      expect(success?.color).toBe('text-green-500');
    });

    test('includes note variant', () => {
      const note = PANEL_VARIANTS.find((v) => v.variant === 'note');
      expect(note).toBeDefined();
      expect(note?.label).toBe('Note');
      expect(note?.color).toBe('text-gray-500');
    });
  });

  describe('getVariantConfig', () => {
    test('returns config for valid variant', () => {
      const config = getVariantConfig('info');
      expect(config).toBeDefined();
      expect(config?.variant).toBe('info');
    });

    test('returns undefined for invalid variant', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config = getVariantConfig('invalid' as any);
      expect(config).toBeUndefined();
    });
  });

  describe('getVariantTypes', () => {
    test('returns array of all variant types', () => {
      const types = getVariantTypes();
      expect(types).toContain('info');
      expect(types).toContain('warning');
      expect(types).toContain('success');
      expect(types).toContain('note');
    });
  });

  describe('getVariantLabel', () => {
    test('returns label for known variant', () => {
      expect(getVariantLabel('info')).toBe('Info');
      expect(getVariantLabel('warning')).toBe('Warning');
      expect(getVariantLabel('success')).toBe('Success');
      expect(getVariantLabel('note')).toBe('Note');
    });

    test('returns variant as fallback for unknown', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getVariantLabel('custom' as any)).toBe('custom');
    });
  });

  describe('getVariantColor', () => {
    test('returns color for known variant', () => {
      expect(getVariantColor('info')).toBe('text-blue-500');
      expect(getVariantColor('warning')).toBe('text-yellow-500');
    });

    test('returns empty string for unknown', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getVariantColor('unknown' as any)).toBe('');
    });
  });

  describe('isValidVariant', () => {
    test('returns true for valid variants', () => {
      expect(isValidVariant('info')).toBe(true);
      expect(isValidVariant('warning')).toBe(true);
      expect(isValidVariant('success')).toBe(true);
      expect(isValidVariant('note')).toBe(true);
    });

    test('returns false for invalid variants', () => {
      expect(isValidVariant('invalid')).toBe(false);
      expect(isValidVariant('')).toBe(false);
    });
  });

  describe('$getPanelNodeFromLexicalNode', () => {
    const editorConfig = {
      namespace: 'test',
      nodes: [ParagraphNode, TextNode, PanelBlockNode],
      onError: (error: Error) => {
        throw error;
      },
    };

    test('returns panel for node inside panel', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const panel = $createPanelBlockNode({ variant: 'info', title: 'Test' });
        const paragraph = $createParagraphNode();
        const text = $createTextNode('Inside');

        paragraph.append(text);
        panel.append(paragraph);
        root.append(panel);

        const found = $getPanelNodeFromLexicalNode(text);
        expect(found).toBe(panel);
      });
    });

    test('returns null for node outside panel', () => {
      const editor = createHeadlessEditor(editorConfig);

      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        const text = $createTextNode('Outside');

        paragraph.append(text);
        root.append(paragraph);

        expect($getPanelNodeFromLexicalNode(text)).toBeNull();
      });
    });
  });

  describe('calculateMenuPosition', () => {
    test('returns null for null element', () => {
      expect(calculateMenuPosition(null)).toBeNull();
    });

    test('calculates position from element', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          right: 200,
          bottom: 150,
          left: 50,
          width: 150,
          height: 50,
        }),
      } as HTMLElement;

      const position = calculateMenuPosition(mockElement);
      expect(position?.top).toBe(100);
      expect(position?.left).toBe(200);
    });

    test('applies offset', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          right: 200,
          bottom: 150,
          left: 50,
          width: 150,
          height: 50,
        }),
      } as HTMLElement;

      const position = calculateMenuPosition(mockElement, {
        top: 10,
        right: 20,
      });
      expect(position?.top).toBe(110);
      expect(position?.left).toBe(180);
    });
  });

  describe('sanitizePanelTitle', () => {
    test('trims whitespace', () => {
      expect(sanitizePanelTitle('  Hello  ')).toBe('Hello');
      expect(sanitizePanelTitle('\tTitle\n')).toBe('Title');
    });

    test('handles empty string', () => {
      expect(sanitizePanelTitle('')).toBe('');
      expect(sanitizePanelTitle('   ')).toBe('');
    });
  });

  describe('hasTitleChanged', () => {
    test('returns true for different titles', () => {
      expect(hasTitleChanged('Old', 'New')).toBe(true);
    });

    test('returns false for same titles', () => {
      expect(hasTitleChanged('Same', 'Same')).toBe(false);
    });

    test('ignores whitespace differences', () => {
      expect(hasTitleChanged('  Title  ', 'Title')).toBe(false);
    });
  });
});
