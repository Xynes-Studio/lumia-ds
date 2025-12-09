export function componentTemplate(name: string): string {
  return `import * as React from 'react';
import { cn } from '@lumia/ui'; // Assuming usage of proper utilities

export interface ${name}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Add custom props here
}

export const ${name} = React.forwardRef<HTMLDivElement, ${name}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('${name}-root', className)}
        {...props}
      />
    );
  }
);

${name}.displayName = '${name}';
`;
}

export function testTemplate(name: string): string {
  return `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} data-testid="${name}" />);
    expect(screen.getByTestId('${name}')).toBeInTheDocument();
  });
});
`;
}

export function storyTemplate(name: string): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {},
};
`;
}

export function styleTemplate(name: string): string {
  return `.${name}-root {
  /* Add styles here */
}
`;
}
