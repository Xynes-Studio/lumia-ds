import type { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type IconId = string & {};

export type RegisterIconFn = (id: IconId, component: IconComponent) => void;
