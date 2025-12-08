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

/**
 * Type of modal UI to show when a slash command is selected.
 * - 'none': Execute immediately without UI
 * - 'media-image': Show MediaInsertTabs for image
 * - 'media-video': Show MediaInsertTabs for video
 */
export type SlashCommandModalType = 'none' | 'media-image' | 'media-video';

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
  /** Action to execute when command is selected (only used when modalType is 'none') */
  execute: (editor: LexicalEditor) => void;
  /** Type of modal UI to show, defaults to 'none' */
  modalType?: SlashCommandModalType;
}

/**
 * Slash command executor with optional modal type.
 */
interface SlashCommandExecutorConfig {
  execute: (editor: LexicalEditor) => void;
  modalType?: SlashCommandModalType;
}

/**
 * Registry of execute functions for each block type.
 * Maps block types to their slash command execute handlers.
 */
const slashCommandExecutors: Record<string, SlashCommandExecutorConfig> = {
  video: {
    // Execute is a no-op for modal commands; the modal handles insertion
    execute: () => {},
    modalType: 'media-video',
  },
  image: {
    // Execute is a no-op for modal commands; the modal handles insertion
    execute: () => {},
    modalType: 'media-image',
  },
  panel: {
    execute: (editor: LexicalEditor) => {
      editor.dispatchCommand(INSERT_PANEL_COMMAND, {
        variant: 'info',
        title: 'Info Panel',
      });
    },
  },
  table: {
    execute: (editor: LexicalEditor) => {
      // Insert table without headers first (includeHeaders: true creates BOTH row AND column headers)
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: '3',
        columns: '3',
        includeHeaders: false,
      });
      // After table insertion, toggle only the first row as header
      // Use setTimeout to ensure table is created before toggling
      setTimeout(() => {
        editor.update(() => {
          // Import dynamically to avoid circular dependencies
          const {
            $toggleTableHeaderRow,
          } = require('../../plugins/TableActionMenuPlugin/tableUtils');
          $toggleTableHeaderRow(true);
        });
      }, 0);
    },
  },
  status: {
    execute: (editor: LexicalEditor) => {
      editor.dispatchCommand(INSERT_STATUS_COMMAND, {
        text: 'Status',
        color: 'info',
      });
    },
  },
  file: {
    execute: (editor: LexicalEditor) => {
      const url = window.prompt('Enter file URL:');
      if (url) {
        editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
          url,
          filename: url.split('/').pop() || 'file',
        });
      }
    },
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
  return slashCommandExecutors[blockType]?.execute;
}

/**
 * Create a slash command from a block definition.
 * This ensures metadata is always derived from the BlockRegistry.
 *
 * @param blockType - The block type from the registry
 * @param executorConfig - The execute config for the command
 * @param overrides - Optional overrides for specific fields
 * @returns A SlashCommand or null if the block type is not found
 */
export function createSlashCommandFromRegistry(
  blockType: BlockType,
  executorConfig: SlashCommandExecutorConfig,
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
    execute: executorConfig.execute,
    modalType: executorConfig.modalType,
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
    const executorConfig = slashCommandExecutors[block.type];
    if (!executorConfig) continue;

    const iconOverride = iconOverrides[block.type];
    const command = createSlashCommandFromRegistry(
      block.type,
      executorConfig,
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
