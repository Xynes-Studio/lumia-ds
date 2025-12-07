import * as React from 'react';
import { StatusPill, StatusPillVariant } from '@lumia/components';
import type { StatusColor } from './StatusNode';

export interface StatusNodeComponentProps {
    text: string;
    color: StatusColor;
}

const colorToVariant: Record<StatusColor, StatusPillVariant> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
};

export function StatusNodeComponent({
    text,
    color,
}: StatusNodeComponentProps): React.ReactElement {
    const variant = colorToVariant[color] || 'info';

    return <StatusPill variant={variant}>{text}</StatusPill>;
}
