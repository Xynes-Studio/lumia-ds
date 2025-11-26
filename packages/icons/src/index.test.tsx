import type { SVGProps } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearIconRegistry,
  getIcon,
  registerIcon,
  type IconComponent,
  type IconId,
} from './index';

const CircleIcon: IconComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe('@lumia/icons', () => {
  beforeEach(() => {
    clearIconRegistry();
  });

  it('registers an icon and retrieves it by id', () => {
    const iconId: IconId = 'circle';

    registerIcon(iconId, CircleIcon);

    expect(getIcon(iconId)).toBe(CircleIcon);
  });

  it('overwrites existing entries when registering the same id', () => {
    const FirstIcon: IconComponent = (props: SVGProps<SVGSVGElement>) => (
      <svg {...props} data-name="first" />
    );
    const SecondIcon: IconComponent = (props: SVGProps<SVGSVGElement>) => (
      <svg {...props} data-name="second" />
    );

    registerIcon('chevron', FirstIcon);
    registerIcon('chevron', SecondIcon);

    expect(getIcon('chevron')).toBe(SecondIcon);
  });

  it('returns undefined when the id is not registered', () => {
    expect(getIcon('missing-icon')).toBeUndefined();
  });
});
