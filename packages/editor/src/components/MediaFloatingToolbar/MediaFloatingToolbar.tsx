import * as React from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Trash2,
  Expand,
  Minimize,
  LayoutTemplate,
} from 'lucide-react';

export type MediaAlignment = 'left' | 'center' | 'right' | undefined;
export type MediaLayout = 'inline' | 'breakout' | 'fullWidth' | undefined;

interface MediaFloatingToolbarProps {
  layout?: MediaLayout;
  alignment?: MediaAlignment;
  onLayoutChange?: (layout: 'inline' | 'breakout' | 'fullWidth') => void;
  onAlignmentChange: (alignment: 'left' | 'center' | 'right') => void;
  onDelete: () => void;
  showLayoutControls?: boolean;
}

export function MediaFloatingToolbar({
  layout,
  alignment,
  onLayoutChange,
  onAlignmentChange,
  onDelete,
  showLayoutControls = true,
}: MediaFloatingToolbarProps): React.JSX.Element {
  const buttonClass = (isActive: boolean) =>
    `p-2 rounded hover:bg-muted text-muted-foreground transition-colors ${
      isActive ? 'bg-muted text-foreground' : ''
    }`;

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1.5 rounded-lg shadow-md border border-border z-30">
      {/* Alignment Group */}
      <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
        <button
          onClick={() => onAlignmentChange('left')}
          className={buttonClass(alignment === 'left' || !alignment)}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => onAlignmentChange('center')}
          className={buttonClass(alignment === 'center')}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => onAlignmentChange('right')}
          className={buttonClass(alignment === 'right')}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Layout Group - conditionally rendered */}
      {showLayoutControls && onLayoutChange && (
        <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
          <button
            onClick={() => onLayoutChange('inline')}
            className={buttonClass(layout === 'inline' || !layout)}
            title="Inline"
          >
            <Minimize size={16} />
          </button>
          <button
            onClick={() => onLayoutChange('breakout')}
            className={buttonClass(layout === 'breakout')}
            title="Breakout"
          >
            <LayoutTemplate size={16} />
          </button>
          <button
            onClick={() => onLayoutChange('fullWidth')}
            className={buttonClass(layout === 'fullWidth')}
            title="Full Width"
          >
            <Expand size={16} />
          </button>
        </div>
      )}

      <button
        onClick={onDelete}
        className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
