import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLICK_COMMAND, $getNearestNodeFromDOMNode } from 'lexical';
import { $isLinkNode } from '@lexical/link';

export function ClickableLinkPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Meta' || event.key === 'Control') {
                editor.getRootElement()?.classList.add('cmd-pressed');
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'Meta' || event.key === 'Control') {
                editor.getRootElement()?.classList.remove('cmd-pressed');
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            CLICK_COMMAND,
            (payload) => {
                const event = payload;
                const target = event.target as Node;
                const nearestNode = $getNearestNodeFromDOMNode(target);

                let node = nearestNode;
                while (node !== null) {
                    if ($isLinkNode(node)) {
                        if (event.metaKey || event.ctrlKey) {
                            window.open(node.getURL(), '_blank');
                            return true;
                        }
                        break;
                    }
                    node = node.getParent();
                }
                return false;
            },
            1,
        );
    }, [editor]);

    return null;
}
