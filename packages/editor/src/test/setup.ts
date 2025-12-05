import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

expect.extend(toHaveNoViolations);

// @ts-expect-error - matchMedia is not defined in JSDOM
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
