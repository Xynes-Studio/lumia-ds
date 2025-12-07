import { LucideIcon, Table2 } from 'lucide-react';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../../plugins/InsertVideoPlugin';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';
import { INSERT_STATUS_COMMAND } from '../../plugins/InsertStatusPlugin';
import { INSERT_FILE_BLOCK_COMMAND } from '../../plugins/InsertFilePlugin';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { LexicalEditor } from 'lexical';
import {
  getSlashCommandBlocks,
  getBlockDefinition,
  BlockType,
} from '../../blocks';

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
 * Registry of execute functions for each block type.
 * Maps block types to their slash command execute handlers.
 */
const slashCommandExecutors: Record<string, (editor: LexicalEditor) => void> = {
  video: (editor: LexicalEditor) => {
    const url = window.prompt('Enter video URL:');
    if (url) {
      editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
        src: url,
      });
    }
  },
  image: (editor: LexicalEditor) => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
        src: url,
        alt: '',
      });
    }
  },
  panel: (editor: LexicalEditor) => {
    editor.dispatchCommand(INSERT_PANEL_COMMAND, {
      variant: 'info',
      title: 'Info Panel',
    });
  },
  table: (editor: LexicalEditor) => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: '3',
      columns: '3',
      includeHeaders: false,
    });
  },
  status: (editor: LexicalEditor) => {
    editor.dispatchCommand(INSERT_STATUS_COMMAND, {
      text: 'Status',
      color: 'info',
    });
  },
  file: (editor: LexicalEditor) => {
    const url = window.prompt('Enter file URL:');
    if (url) {
      editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url,
        filename: url.split('/').pop() || 'file',
      });
    }
  },
};

/**
 * Icon overrides for specific block types in the slash menu.
 * Use this when the slash menu should show a different icon than the registry default.
 */
const iconOverrides: Partial<Record<string, LucideIcon>> = {
  table: Table2,
};

/**
 * Get the execute function for a block type.
 * @param blockType - The block type to get the executor for
 * @returns The execute function or undefined if not found
 */
export function getSlashCommandExecutor(
  blockType: string,
): ((editor: LexicalEditor) => void) | undefined {
  return slashCommandExecutors[blockType];
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

/**
 * Dynamically generate slash commands from the BlockRegistry.
 * Only includes blocks with slashEnabled: true that have an executor defined.
 */
function generateSlashCommands(): SlashCommand[] {
  const slashBlocks = getSlashCommandBlocks();
  const commands: SlashCommand[] = [];

  for (const block of slashBlocks) {
    const executor = slashCommandExecutors[block.type];
    if (!executor) continue;

    const iconOverride = iconOverrides[block.type];
    const command = createSlashCommandFromRegistry(
      block.type,
      executor,
      iconOverride ? { icon: iconOverride } : undefined,
    );

    if (command) {
      commands.push(command);
    }
  }

  return commands;
}

/**
 * Default slash commands available in the editor.
 * Metadata is derived from BlockRegistry to ensure single source of truth.
 */
export const defaultSlashCommands: SlashCommand[] = generateSlashCommands();

/**
 * Filter commands based on query string.
 * Matches against command name, label, and keywords.
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
