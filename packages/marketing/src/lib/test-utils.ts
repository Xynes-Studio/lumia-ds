import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { ReactElement } from 'react';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

export type TestRoot = {
  root: Root;
  host: HTMLDivElement;
};

export const createTestRoot = (): TestRoot => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  return { root, host };
};

export const render = async (
  root: Root,
  element: ReactElement,
): Promise<void> => {
  await act(async () => {
    root.render(element);
  });
};

export const teardown = async (ctx: TestRoot): Promise<void> => {
  await act(async () => ctx.root.unmount());
  document.body.removeChild(ctx.host);
};
