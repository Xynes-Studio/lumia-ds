import { describe, it, expect } from 'vitest';
import { editorStateToJson, jsonToEditorState } from './transforms';
import { DocNode } from '../schema/docSchema';

describe('transforms', () => {
  const sampleDoc: DocNode = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [
          {
            type: 'text',
            text: 'Hello World',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This is a ',
          },
          {
            type: 'text',
            text: 'bold',
            marks: [{ type: 'bold' }],
          },
          {
            type: 'text',
            text: ' paragraph.',
          },
        ],
      },
      {
        type: 'bullet_list',
        content: [
          {
            type: 'list_item',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Item 1',
                  },
                ],
              },
            ],
          },
          {
            type: 'list_item',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Item 2',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  it('should convert JSON to EditorState and back to deeply equal JSON', () => {
    const editorState = jsonToEditorState(sampleDoc);
    const jsonOutput = editorStateToJson(editorState);

    expect(jsonOutput).toEqual(sampleDoc);
  });

  it('should handle basic marks correctly', () => {
    const docWithMarks: DocNode = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Bold',
              marks: [{ type: 'bold' }],
            },
            {
              type: 'text',
              text: ' and ',
            },
            {
              type: 'text',
              text: 'Italic',
              marks: [{ type: 'italic' }],
            },
          ],
        },
      ],
    };

    const editorState = jsonToEditorState(docWithMarks);
    const jsonOutput = editorStateToJson(editorState);

    expect(jsonOutput).toEqual(docWithMarks);
  });

  it('should handle link nodes correctly (mapping to link_node internally)', () => {
    const docWithLinkNode: DocNode = {
      type: 'doc',
      content: [
        {
          type: 'link',
          attrs: {
            href: 'https://example.com',
            target: '_blank',
            title: null,
          },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Link Content',
                },
              ],
            },
          ],
        },
      ],
    } as unknown as DocNode; // Cast to DocNode because definition might be strict about 'link' type but we want to test the transform

    const editorState = jsonToEditorState(docWithLinkNode);
    const jsonOutput = editorStateToJson(editorState);

    expect(jsonOutput).toEqual(docWithLinkNode);
  });
});
