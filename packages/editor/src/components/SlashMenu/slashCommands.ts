import { LucideIcon, Video, Image } from 'lucide-react';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../../plugins/InsertVideoPlugin';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';
import { LexicalEditor } from 'lexical';

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
 * Default slash commands available in the editor.
 * Can be extended via BlockRegistry in future iterations.
 */
export const defaultSlashCommands: SlashCommand[] = [
  {
    name: 'video',
    label: 'Video',
    description: 'Embed a video from YouTube, Vimeo, or Loom',
    icon: Video,
    keywords: ['video', 'youtube', 'vimeo', 'loom', 'embed', 'media'],
    execute: (editor) => {
      // Dispatch the command with a placeholder that will open the dialog
      // For now, we'll prompt for the URL inline via the slash menu
      // In future iterations, this could open a modal
      const url = window.prompt('Enter video URL:');
      if (url) {
        editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
          src: url,
        });
      }
    },
  },
  {
    name: 'image',
    label: 'Image',
    description: 'Insert an image from URL',
    icon: Image,
    keywords: ['image', 'picture', 'photo', 'media'],
    execute: (editor) => {
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
          src: url,
          alt: '',
        });
      }
    },
  },
];

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
