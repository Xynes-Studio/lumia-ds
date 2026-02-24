import type {
  ComponentType,
  ForwardRefExoticComponent,
  RefAttributes,
  SVGProps,
} from 'react';

type SvgIconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type ForwardRefSvgIconComponent = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, 'ref'> & RefAttributes<SVGSVGElement>
>;

export type IconComponent = SvgIconComponent | ForwardRefSvgIconComponent;

export type IconId = string & {};

export type RegisterIconFn = (id: IconId, component: IconComponent) => void;
