import '@testing-library/jest-dom';

// @ts-expect-error - matchMedia is not defined in JSDOM
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
