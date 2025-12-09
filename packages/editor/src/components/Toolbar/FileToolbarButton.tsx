import React, { useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@lumia/components';
import { FileUp } from 'lucide-react';
import { INSERT_FILE_BLOCK_COMMAND } from '../../plugins/InsertFilePlugin';

export function FileToolbarButton() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      editor.dispatchCommand(INSERT_FILE_BLOCK_COMMAND, {
        url: '', // Will be handled by plugin
        filename: file.name,
        size: file.size,
        mime: file.type,
        file: file,
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        style={{ display: 'none' }}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Insert File"
        title="Insert File"
      >
        <FileUp className="h-4 w-4" />
      </Button>
    </>
  );
}
