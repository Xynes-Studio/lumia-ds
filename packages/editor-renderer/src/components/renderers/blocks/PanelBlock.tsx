import React from 'react';
import { Info, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PanelBlockProps {
  node: {
    variant: 'info' | 'warning' | 'success' | 'note';
    title?: string;
    icon?: string;
    children?: unknown; // Lexical children node array
  };
  children?: React.ReactNode;
}

export const PanelBlock: React.FC<PanelBlockProps> = ({ node, children }) => {
  const { variant, title } = node;

  const styles = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    warning: 'bg-amber-50 border-amber-500 text-amber-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    note: 'bg-gray-50 border-gray-500 text-gray-900',
  };

  const style = styles[variant] || styles.info;

  const Icon =
    variant === 'info'
      ? Info
      : variant === 'warning'
        ? AlertTriangle
        : variant === 'success'
          ? CheckCircle
          : FileText;

  return (
    <div className={cn('my-4 p-4 border-l-4 rounded-r', style)}>
      {(title || node.icon) && (
        <div className="flex items-center gap-2 mb-2 font-medium">
          <Icon className="w-5 h-5 flex-shrink-0" />
          {title && <span>{title}</span>}
        </div>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
};
