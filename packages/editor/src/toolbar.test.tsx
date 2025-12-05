import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LumiaEditor } from './lumia-editor';

describe('Toolbar', () => {
  it('toggles bold formatting when clicking the bold button', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<LumiaEditor value={null} onChange={onChange} />);

    const editorInput = screen.getByRole('textbox');
    await user.click(editorInput);
    await user.keyboard('Hello');

    const boldButton = screen.getByRole('button', { name: /Format Bold/i });
    await user.click(boldButton);
    await user.keyboard(' Bold');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      expect(boldButton).toHaveClass('bg-secondary');
    });
  });

  it('toggles italic formatting with keyboard shortcut', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <div className="test-wrapper">
        <LumiaEditor value={null} onChange={onChange} />
        {/* We can't easily inject TestRunner inside LumiaEditor without modifying it or using a custom provider.
            But LumiaEditor wraps EditorProvider.
            So we can't put TestRunner here because it needs to be inside LexicalComposer.
            
            However, LumiaEditor is:
            <EditorProvider ...>
              <LumiaEditorPrimitive ... />
            </EditorProvider>

            We can't inject children into LumiaEditor.
            We might need to test LumiaEditorPrimitive wrapped in EditorProvider directly, 
            or modify LumiaEditor to accept children (which it doesn't).
            
            Actually, we can use the fact that we are testing the Toolbar which is inside LumiaEditor.
            But we want to test the whole integration.
            
            Let's try to use the keyboard shortcut with both Meta and Control to be safe.
        */}
      </div>,
    );

    const editorInput = screen.getByRole('textbox');
    await user.click(editorInput);
    await user.keyboard('Hello');

    // Select text "Hello" using keyboard
    await user.keyboard(
      '{Shift>}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{/Shift}',
    );

    // Try Meta+I
    await user.keyboard('{Meta>}i{/Meta}');

    // Check if it worked
    const italicButton = screen.getByRole('button', {
      name: /Format Italics/i,
    });
    try {
      await waitFor(
        () => {
          expect(italicButton).toHaveClass('bg-secondary');
        },
        { timeout: 1000 },
      );
    } catch {
      // If Meta+I failed, try Control+I
      await user.keyboard('{Control>}i{/Control}');
      await waitFor(() => {
        expect(italicButton).toHaveClass('bg-secondary');
      });
    }
  });

  it('toggles code block formatting when clicking the code block button', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<LumiaEditor value={null} onChange={onChange} />);

    const editorInput = screen.getByRole('textbox');
    await user.click(editorInput);
    await user.keyboard('Hello Code');

    const codeBlockButton = screen.getByRole('button', { name: /Code Block/i });
    await user.click(codeBlockButton);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      expect(codeBlockButton).toHaveClass('bg-secondary');
    });

    // Toggle back
    await user.click(codeBlockButton);
    await waitFor(() => {
      expect(codeBlockButton).not.toHaveClass('bg-secondary');
    });
  });
});
