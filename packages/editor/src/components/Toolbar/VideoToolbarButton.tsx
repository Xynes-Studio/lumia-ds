import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  Select,
} from '@lumia/components';
import { Video as VideoIcon } from 'lucide-react';
import {
  INSERT_VIDEO_BLOCK_COMMAND,
  detectVideoProvider,
} from '../../plugins/InsertVideoPlugin';
import { VideoProvider } from '../../nodes/VideoBlockNode';

const PROVIDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'loom', label: 'Loom' },
  { value: 'html5', label: 'HTML5 Video' },
];

export function VideoToolbarButton() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState('auto');

  const handleInsertVideo = () => {
    if (!url) return;

    const resolvedProvider: VideoProvider | undefined =
      provider === 'auto'
        ? detectVideoProvider(url)
        : (provider as VideoProvider);

    editor.dispatchCommand(INSERT_VIDEO_BLOCK_COMMAND, {
      src: url,
      provider: resolvedProvider,
    });

    setIsOpen(false);
    setUrl('');
    setProvider('auto');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Insert Video"
          title="Insert Video"
        >
          <VideoIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start" side="bottom">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <label htmlFor="video-url" className="text-sm font-medium">
              Video URL
            </label>
            <Input
              id="video-url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsertVideo();
                }
              }}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="video-provider" className="text-sm font-medium">
              Provider (optional)
            </label>
            <Select
              id="video-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              aria-label="Video Provider"
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleInsertVideo} disabled={!url}>
              Insert
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
