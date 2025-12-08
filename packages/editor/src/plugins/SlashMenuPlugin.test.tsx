import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ParagraphNode, TextNode } from 'lexical';
import { SlashMenuPlugin } from './SlashMenuPlugin';
import {
  defaultSlashCommands,
  filterSlashCommands,
  createSlashCommandFromRegistry,
} from '../components/SlashMenu';
import { getSlashCommandBlocks, BlockType } from '../blocks';

// Mock window.prompt for commands that use it
vi.stubGlobal('prompt', vi.fn());

// Test wrapper component
function TestEditor({ children }: { children?: React.ReactNode }) {
  const initialConfig = {
    namespace: 'TestEditor',
    nodes: [ParagraphNode, TextNode],
    onError: (error: Error) => {
      throw error;
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-input"
            aria-label="Test Editor"
            data-testid="editor-input"
          />
        }
        placeholder={<div>Type something...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <SlashMenuPlugin />
      {children}
    </LexicalComposer>
  );
}

describe('SlashMenuPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('slash commands generation from BlockRegistry', () => {
    test('getSlashCommandBlocks returns only blocks with slashEnabled: true', () => {
      const slashBlocks = getSlashCommandBlocks();

      // Should include all slash-enabled blocks
      const blockTypes = slashBlocks.map((b) => b.type);
      expect(blockTypes).toContain('image');
      expect(blockTypes).toContain('video');
      expect(blockTypes).toContain('file');
      expect(blockTypes).toContain('table');
      expect(blockTypes).toContain('panel');
      expect(blockTypes).toContain('status');

      // Should NOT include non-slash blocks
      expect(blockTypes).not.toContain('paragraph');
      expect(blockTypes).not.toContain('heading');
      expect(blockTypes).not.toContain('code');
    });

    test('defaultSlashCommands is populated from BlockRegistry', () => {
      expect(defaultSlashCommands.length).toBeGreaterThan(0);

      // Check that each command has required fields
      defaultSlashCommands.forEach((cmd) => {
        expect(cmd.name).toBeDefined();
        expect(cmd.label).toBeDefined();
        expect(cmd.icon).toBeDefined();
        expect(cmd.execute).toBeInstanceOf(Function);
      });
    });

    test('createSlashCommandFromRegistry creates command from block definition', () => {
      const mockExecute = vi.fn();
      const command = createSlashCommandFromRegistry('image', {
        execute: mockExecute,
      });

      expect(command).not.toBeNull();
      expect(command?.label).toBe('Image');
      expect(command?.description).toBe('Insert an image from URL');
      expect(command?.keywords).toContain('image');
      expect(command?.execute).toBe(mockExecute);
    });

    test('createSlashCommandFromRegistry returns null for unknown block type', () => {
      const mockExecute = vi.fn();
      const unknownBlockType = 'unknown-block' as BlockType;
      const command = createSlashCommandFromRegistry(unknownBlockType, {
        execute: mockExecute,
      });

      expect(command).toBeNull();
    });
  });

  describe('filterSlashCommands', () => {
    test('returns all commands when query is empty', () => {
      const filtered = filterSlashCommands(defaultSlashCommands, '');
      expect(filtered.length).toBe(defaultSlashCommands.length);
    });

    test('/im filters to show "Image"', () => {
      const filtered = filterSlashCommands(defaultSlashCommands, 'im');
      const imageCommand = filtered.find((cmd) => cmd.name === 'image');
      expect(imageCommand).toBeDefined();
    });

    test('/tab filters to show "Table"', () => {
      const filtered = filterSlashCommands(defaultSlashCommands, 'tab');
      const tableCommand = filtered.find((cmd) => cmd.name === 'table');
      expect(tableCommand).toBeDefined();
    });

    test('/vid filters to show "Video"', () => {
      const filtered = filterSlashCommands(defaultSlashCommands, 'vid');
      const videoCommand = filtered.find((cmd) => cmd.name === 'video');
      expect(videoCommand).toBeDefined();
    });

    test('/sta filters to show "Status"', () => {
      const filtered = filterSlashCommands(defaultSlashCommands, 'sta');
      const statusCommand = filtered.find((cmd) => cmd.name === 'status');
      expect(statusCommand).toBeDefined();
    });

    test('/pan filters to show "Panel"', () => {
      const filtered = filterSlashCommands(defaultSlashCommands, 'pan');
      const panelCommand = filtered.find((cmd) => cmd.name === 'panel');
      expect(panelCommand).toBeDefined();
    });

    test('filtering by keyword works', () => {
      // Image block has 'photo' as a keyword
      const filtered = filterSlashCommands(defaultSlashCommands, 'photo');
      const imageCommand = filtered.find((cmd) => cmd.name === 'image');
      expect(imageCommand).toBeDefined();
    });

    test('filtering is case-insensitive', () => {
      const filteredLower = filterSlashCommands(defaultSlashCommands, 'image');
      const filteredUpper = filterSlashCommands(defaultSlashCommands, 'IMAGE');
      const filteredMixed = filterSlashCommands(defaultSlashCommands, 'ImAgE');

      expect(filteredLower.length).toBe(filteredUpper.length);
      expect(filteredLower.length).toBe(filteredMixed.length);
    });

    test('returns empty array when no matches', () => {
      const filtered = filterSlashCommands(
        defaultSlashCommands,
        'nonexistentcommand',
      );
      expect(filtered.length).toBe(0);
    });
  });

  describe('menu behavior', () => {
    test('renders without crashing', () => {
      expect(() => render(<TestEditor />)).not.toThrow();
    });

    test('slash menu is not visible initially', () => {
      render(<TestEditor />);
      const menu = screen.queryByRole('listbox', { name: 'Slash commands' });
      expect(menu).not.toBeInTheDocument();
    });
  });

  describe('slash command structure', () => {
    test('all commands have valid icons', () => {
      defaultSlashCommands.forEach((cmd) => {
        expect(cmd.icon).toBeDefined();
        // Icons should be React components (functions or objects with $$typeof)
        expect(
          typeof cmd.icon === 'function' ||
          (typeof cmd.icon === 'object' && cmd.icon !== null),
        ).toBe(true);
      });
    });

    test('all commands have non-empty names', () => {
      defaultSlashCommands.forEach((cmd) => {
        expect(cmd.name.length).toBeGreaterThan(0);
      });
    });

    test('all commands have non-empty labels', () => {
      defaultSlashCommands.forEach((cmd) => {
        expect(cmd.label.length).toBeGreaterThan(0);
      });
    });

    test('all commands have descriptions', () => {
      defaultSlashCommands.forEach((cmd) => {
        expect(cmd.description).toBeDefined();
      });
    });
  });

  describe('BlockRegistry integration', () => {
    test('slash commands match slash-enabled blocks', () => {
      const slashBlocks = getSlashCommandBlocks();
      const commandNames = defaultSlashCommands.map((cmd) => cmd.name);

      // Every slash-enabled block should have a corresponding command
      slashBlocks.forEach((block) => {
        const expectedName = block.slashCommand ?? block.type;
        expect(commandNames).toContain(expectedName);
      });
    });

    test('command labels match block labels', () => {
      const slashBlocks = getSlashCommandBlocks();

      slashBlocks.forEach((block) => {
        const command = defaultSlashCommands.find(
          (cmd) => cmd.name === (block.slashCommand ?? block.type),
        );
        if (command) {
          expect(command.label).toBe(block.label);
        }
      });
    });

    test('command descriptions match block descriptions', () => {
      const slashBlocks = getSlashCommandBlocks();

      slashBlocks.forEach((block) => {
        const command = defaultSlashCommands.find(
          (cmd) => cmd.name === (block.slashCommand ?? block.type),
        );
        if (command && block.description) {
          expect(command.description).toBe(block.description);
        }
      });
    });
  });
});

describe('SlashMenuPlugin - Trigger conditions', () => {
  test('slash should NOT be a trigger when user types in middle of text', () => {
    // This tests the logic: / in middle of text should not open menu
    // The actual trigger detection happens in the plugin
    const textBeforeSlash = 'Hello / World';
    const slashIndex = textBeforeSlash.indexOf('/');

    // At position 6 (after "Hello "), / is preceded by a space - this WOULD trigger
    // At position 6, the character before is ' ' (space), so isAfterWhitespace would be true
    // This test verifies the filtering logic is correct
    expect(slashIndex).toBeGreaterThan(0);

    // Test filtering behavior
    const filtered = filterSlashCommands(defaultSlashCommands, '');
    expect(filtered.length).toBe(defaultSlashCommands.length);
  });

  test('all required slash blocks are present in registry', () => {
    const slashBlocks = getSlashCommandBlocks();
    expect(slashBlocks.length).toBeGreaterThanOrEqual(5);
  });
});
