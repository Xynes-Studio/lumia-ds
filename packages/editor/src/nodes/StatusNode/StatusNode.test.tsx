import { createHeadlessEditor } from '@lexical/headless';
import { $createStatusNode, $isStatusNode, StatusNode } from './StatusNode';
import {
  $getRoot,
  $createParagraphNode,
  $isParagraphNode,
  ParagraphNode,
} from 'lexical';
import { describe, it, expect } from 'vitest';

describe('StatusNode', () => {
  it('should be a valid node', () => {
    const editor = createHeadlessEditor({
      nodes: [StatusNode, ParagraphNode],
      onError: () => {},
    });

    editor.update(() => {
      const node = $createStatusNode({ text: 'Done', color: 'success' });
      expect($isStatusNode(node)).toBe(true);
      expect(node.getType()).toBe('status-node');
    });
  });

  it('should serialize and deserialize correctly', () => {
    const editor = createHeadlessEditor({
      nodes: [StatusNode, ParagraphNode],
      onError: (e) => console.error(e),
    });

    editor.update(
      () => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        const node = $createStatusNode({
          text: 'In Progress',
          color: 'warning',
        });
        paragraph.append(node);
        root.append(paragraph);
      },
      { discrete: true },
    );

    const editorState = editor.getEditorState();
    const json = editorState.toJSON();

    const editor2 = createHeadlessEditor({
      nodes: [StatusNode, ParagraphNode],
      onError: () => {},
    });

    editor2.setEditorState(editor2.parseEditorState(json));

    editor2.getEditorState().read(() => {
      const root = $getRoot();
      const paragraph = root.getFirstChild();
      if ($isParagraphNode(paragraph)) {
        const node = paragraph.getFirstChild();
        expect($isStatusNode(node)).toBe(true);
        if ($isStatusNode(node)) {
          expect(node.__text).toBe('In Progress');
          expect(node.__color).toBe('warning');
        }
      }
    });
  });
});
