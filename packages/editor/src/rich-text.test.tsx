import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorProvider } from './EditorProvider';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createHeadingNode } from '@lexical/rich-text';
import { $getRoot, $createTextNode, LexicalEditor } from 'lexical';
import { $createListNode, $createListItemNode } from '@lexical/list';

// Helper component to run commands or updates
function TestRunner({ action }: { action: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        action(editor);
      }, 0);
    }
  }, [editor, action]);

  return null;
}

describe('Rich Text Features', () => {
  it('supports creating headings via editor update', async () => {
    const onChange = vi.fn();

    const createHeading = (editor: LexicalEditor) => {
      editor.update(() => {
        const root = $getRoot();
        const heading = $createHeadingNode('h1');
        heading.append($createTextNode('Hello Heading'));
        root.clear();
        root.append(heading);
      });
    };

    render(
      <EditorProvider onChange={onChange}>
        <TestRunner action={createHeading} />
      </EditorProvider>,
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const lastState = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      const rootChildren = lastState.root.children;
      expect(rootChildren).toHaveLength(1);
      expect(rootChildren[0].type).toBe('heading');
      expect(rootChildren[0].tag).toBe('h1');
      expect(rootChildren[0].children[0].text).toBe('Hello Heading');
    });
  });

  it('supports creating lists via editor update', async () => {
    const onChange = vi.fn();

    const createList = (editor: LexicalEditor) => {
      editor.update(() => {
        const root = $getRoot();
        const list = $createListNode('bullet');
        const listItem = $createListItemNode();
        listItem.append($createTextNode('List Item 1'));
        list.append(listItem);
        root.clear();
        root.append(list);
      });
    };

    render(
      <EditorProvider onChange={onChange}>
        <TestRunner action={createList} />
      </EditorProvider>,
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const lastState = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      const rootChildren = lastState.root.children;
      expect(rootChildren).toHaveLength(1);
      expect(rootChildren[0].type).toBe('list');
      expect(rootChildren[0].listType).toBe('bullet');
      expect(rootChildren[0].children[0].children[0].text).toBe('List Item 1');
    });
  });
});
