import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@lumia-ui/components';
import { Icon } from '@lumia-ui/icons';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';
import {
  DEFAULT_PANEL_TITLE,
  DEFAULT_PANEL_VARIANT,
} from '../../utils/panelActionUtils';

/**
 * Toolbar entry point for inserting a panel block.
 *
 * BUG-LDS-6: Per the unified insert + inline variant picker UX, this button
 * inserts a default `info` panel directly (no popover, no modal). The author
 * flips the variant in place via the per-panel popover anchored to the
 * variant icon at the panel header (rendered by `PanelActionMenuPlugin`).
 *
 * Icons are sourced from `@lumia-ui/icons` exclusively — see
 * `scripts/audit-icon-sources.ts`.
 */
export function PanelToolbarButton() {
  const [editor] = useLexicalComposerContext();

  const handleInsertPanel = () => {
    editor.dispatchCommand(INSERT_PANEL_COMMAND, {
      variant: DEFAULT_PANEL_VARIANT,
      title: DEFAULT_PANEL_TITLE,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Insert Panel"
      title="Insert Panel"
      onClick={handleInsertPanel}
    >
      <Icon name="layout-grid" size="sm" />
    </Button>
  );
}
