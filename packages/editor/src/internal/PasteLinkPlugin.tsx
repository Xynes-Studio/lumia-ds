import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    PASTE_COMMAND,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
} from 'lexical';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

const URL_REGEX =
    /((https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|ftp:\/\/[a-zA-Z0-9]+\.[^\s]{2,}))/gi;

export function PasteLinkPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            PASTE_COMMAND,
            (event) => {
                const clipboardData =
                    event instanceof ClipboardEvent ? event.clipboardData : null;
                const pastedText = clipboardData?.getData('text/plain');

                if (pastedText && URL_REGEX.test(pastedText)) {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                        editor.dispatchCommand(TOGGLE_LINK_COMMAND, pastedText);
                        event.preventDefault();
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor]);

    return null;
}
