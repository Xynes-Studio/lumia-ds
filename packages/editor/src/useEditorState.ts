import { useEditorContext } from './EditorProvider';
import { LumiaEditorStateJSON } from './types';

export function useEditorState(): { json: LumiaEditorStateJSON | null } {
  const { editorState } = useEditorContext();
  return { json: editorState };
}
