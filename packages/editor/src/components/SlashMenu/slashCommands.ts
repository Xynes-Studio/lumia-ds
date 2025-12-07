import { LucideIcon, Table2 } from 'lucide-react';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../../plugins/InsertVideoPlugin';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';
import { INSERT_STATUS_COMMAND } from '../../plugins/InsertStatusPlugin';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { LexicalEditor } from 'lexical';
import { getBlockDefinition, BlockType } from '../../blocks';

export interface SlashCommand {
  /** Name of the command (without leading slash) */
  name: string;
  /** Display label */
  label: string;
  /** Description shown in menu */
  description: string;
  /** Icon component */
  icon: LucideIcon;
  /** Keywords for filtering */
  keywords: string[];
  /** Action to execute when command is selected */
  execute: (editor: LexicalEditor) => void;
}

/**
 * Create a slash command from a block definition.
 * This ensures metadata is always derived from the BlockRegistry.
 *
 * @param blockType - The block type from the registry
 * @param execute - The execute function for the command
 * @param overrides - Optional overrides for specific fields
 * @returns A SlashCommand or null if the block type is not found
 */
export function createSlashCommandFromRegistry(
  blockType: BlockType,
  execute: (editor: LexicalEditor) => void,
  overrides?: Partial<
    Pick<SlashCommand, 'name' | 'description' | 'icon' | 'keywords'>
  >,
): SlashCommand | null {
  const definition = getBlockDefinition(blockType);
  if (!definition) return null;

  return {
    name: definition.slashCommand ?? definition.type,
    label: definition.label,
    description: definition.description ?? '',
    icon: (overrides?.icon ?? definition.icon) as LucideIcon,
    keywords: overrides?.keywords ?? definition.keywords ?? [],
    execute,
  };
}

// Execute functions for each block type
const executeVideo = (editor: LexicalEditor) => {
  const url = window.prompt('Enter video URL:');
  if (url) {
    editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
      src: url,
    });
  }
};

const executeImage = (editor: LexicalEditor) => {
  const url = window.prompt('Enter image URL:');
  if (url) {
    editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
      src: url,
      alt: '',
    });
  }
};

const executePanel = (editor: LexicalEditor) => {
  editor.dispatchCommand(INSERT_PANEL_COMMAND, {
    variant: 'info',
    title: 'Info Panel',
  });
};

const executeTable = (editor: LexicalEditor) => {
  editor.dispatchCommand(INSERT_TABLE_COMMAND, {
    rows: '3',
    columns: '3',
    includeHeaders: false,
  });
};

const executeStatus = (editor: LexicalEditor) => {
  editor.dispatchCommand(INSERT_STATUS_COMMAND, {
    text: 'Status',
    color: 'info',
  });
};

/**
 * Default slash commands available in the editor.
 * Metadata is derived from BlockRegistry to ensure single source of truth.
 */
export const defaultSlashCommands: SlashCommand[] = [
  createSlashCommandFromRegistry('video', executeVideo),
  createSlashCommandFromRegistry('image', executeImage),
  createSlashCommandFromRegistry('panel', executePanel),
  // Table uses a different icon (Table2) in slash menu
  createSlashCommandFromRegistry('table', executeTable, { icon: Table2 }),
  createSlashCommandFromRegistry('status', executeStatus),
].filter((cmd): cmd is SlashCommand => cmd !== null);

/**
 * Filter commands based on query string.
 */
export function filterSlashCommands(
  commands: SlashCommand[],
  query: string,
): SlashCommand[] {
  const lowerQuery = query.toLowerCase();

  if (!lowerQuery) {
    return commands;
  }

  return commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.keywords.some((keyword) =>
        keyword.toLowerCase().includes(lowerQuery),
      ),
  );
}
