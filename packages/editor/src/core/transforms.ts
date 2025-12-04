import { EditorState } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { DocNode } from '../schema/docSchema';
import { pmSchema } from '../schema/pmSchema';

/**
 * Recursively maps node types in the JSON tree.
 * @param node The node to traverse.
 * @param mapFn Function to map the node type.
 * @returns The transformed node.
 */
function traverseAndMap(
  node: unknown,
  mapFn: (type: string) => string,
): unknown {
  if (typeof node !== 'object' || node === null) {
    return node;
  }

  const newNode = { ...(node as Record<string, unknown>) };

  if (typeof newNode.type === 'string') {
    newNode.type = mapFn(newNode.type);
  }

  if (Array.isArray(newNode.content)) {
    newNode.content = newNode.content.map((child: unknown) =>
      traverseAndMap(child, mapFn),
    );
  }

  return newNode;
}

/**
 * Converts a ProseMirror EditorState to a DocNode JSON tree.
 * @param editorState The EditorState to convert.
 * @returns The DocNode JSON tree.
 */
export function editorStateToJson(editorState: EditorState): DocNode {
  const json = editorState.doc.toJSON();
  return traverseAndMap(json, (type) =>
    type === 'link_node' ? 'link' : type,
  ) as DocNode;
}

/**
 * Converts a DocNode JSON tree to a ProseMirror EditorState.
 * @param json The DocNode JSON tree to convert.
 * @returns The EditorState.
 */
export function jsonToEditorState(json: DocNode): EditorState {
  const mappedJson = traverseAndMap(json, (type) =>
    type === 'link' ? 'link_node' : type,
  );
  const node = Node.fromJSON(pmSchema, mappedJson);
  return EditorState.create({
    doc: node,
    schema: pmSchema,
  });
}
