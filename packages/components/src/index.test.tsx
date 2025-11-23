import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Hello } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    return { root, host };
};

describe('Hello component', () => {
    it('renders with default props', async () => {
        const { root, host } = createTestRoot();

        await act(async () => {
            root.render(<Hello />);
        });

        expect(host.textContent).toContain('Hello, Lumia!');

        await act(async () => root.unmount());
        document.body.removeChild(host);
    });

    it('renders provided name and children', async () => {
        const { root, host } = createTestRoot();

        await act(async () => {
            root.render(
                <Hello name="Design System">
                    <span>child node</span>
                </Hello>,
            );
        });

        expect(host.textContent).toContain('Hello, Design System!');
        expect(host.textContent).toContain('child node');

        await act(async () => root.unmount());
        document.body.removeChild(host);
    });
});
