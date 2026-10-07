import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './dialog';
afterEach(cleanup);
it('accepts a translated accessible close label and still closes the dialog', () => {
  render(
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent closeLabel="Fermer">
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  fireEvent.click(screen.getByText('Open'));
  fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
it('preserves the existing English close label by default', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  expect(screen.getByRole('button', { name: 'Close dialog' })).toBeTruthy();
});
