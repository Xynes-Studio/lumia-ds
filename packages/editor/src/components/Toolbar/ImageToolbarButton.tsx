import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
} from '@lumia/components';
import { Image as ImageIcon } from 'lucide-react';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';

export function ImageToolbarButton() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');

  const handleInsertImage = () => {
    if (!url) return;

    editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, {
      src: url,
      alt: altText,
    });

    setIsOpen(false);
    setUrl('');
    setAltText('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Insert Image"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start" side="bottom">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <label htmlFor="image-url" className="text-sm font-medium">
              Image URL
            </label>
            <Input
              id="image-url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsertImage();
                }
              }}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="image-alt" className="text-sm font-medium">
              Alt Text
            </label>
            <Input
              id="image-alt"
              placeholder="Description of the image"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsertImage();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleInsertImage} disabled={!url}>
              Insert
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
