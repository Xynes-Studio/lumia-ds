import type { ReactNode } from 'react';

/**
 * Props for the BlockErrorWidget component.
 */
export type BlockErrorWidgetProps = {
  /** The ID of the block that failed to render */
  blockId: string;
  /** The kind/type of the block (e.g., 'table', 'form') */
  blockKind?: string;
  /** Custom error message */
  message?: string;
  /** Additional content to render below the error info */
  children?: ReactNode;
  /** Additional CSS class names */
  className?: string;
};

/**
 * Inline error widget displayed in place of a block that failed validation.
 * Other blocks on the page continue to render normally.
 *
 * Compact design that fits within grid layouts and maintains page structure.
 * Customizable via props for message and children slot.
 */
export function BlockErrorWidget({
  blockId,
  blockKind,
  message,
  children,
  className,
}: BlockErrorWidgetProps) {
  const defaultMessage = blockKind
    ? `Block "${blockId}" (${blockKind}) failed to render`
    : `Block "${blockId}" failed to render`;

  return (
    <div
      data-testid="block-error-widget"
      data-block-id={blockId}
      data-block-kind={blockKind}
      className={`
        flex flex-col items-center justify-center min-h-[120px] p-4
        border border-dashed border-red-300 rounded-lg
        bg-red-50/50 text-center
        ${className ?? ''}
      `.trim()}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="text-sm font-medium text-red-700">Block Error</span>
      </div>

      <p className="text-xs text-red-600 mb-2">{message ?? defaultMessage}</p>

      {children}
    </div>
  );
}
