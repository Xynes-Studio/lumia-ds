import type { FormEvent, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '../button/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from '../dialog/dialog';

export type ConfirmDialogProps = Omit<DialogProps, 'children'> & {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  /**
   * Optional trigger element rendered via DialogTrigger.
   */
  trigger?: ReactNode;
  /**
   * Style the confirm action as destructive.
   */
  destructive?: boolean;
};

type UseConfirmDialogOptions = {
  defaultOpen?: boolean;
};

export type UseConfirmDialogResult = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
  dialogProps: Pick<ConfirmDialogProps, 'open' | 'onOpenChange'>;
};

export const useConfirmDialog = (
  options: UseConfirmDialogOptions = {},
): UseConfirmDialogResult => {
  const { defaultOpen = false } = options;
  const [open, setOpenState] = useState(defaultOpen);

  const setOpen = useCallback((nextOpen: boolean) => {
    setOpenState(nextOpen);
  }, []);

  const openDialog = useCallback(() => setOpen(true), [setOpen]);
  const closeDialog = useCallback(() => setOpen(false), [setOpen]);

  const dialogProps = useMemo(
    () => ({
      open,
      onOpenChange: setOpen,
    }),
    [open, setOpen],
  );

  return { open, openDialog, closeDialog, setOpen, dialogProps };
};

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  trigger,
  destructive = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...dialogProps
}: ConfirmDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const handleConfirm = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    await Promise.resolve(onConfirm());
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} {...dialogProps}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        role="alertdialog"
        onOpenAutoFocus={(event) => {
          if (confirmButtonRef.current) {
            confirmButtonRef.current.focus();
            event.preventDefault();
          }
        }}
      >
        <form onSubmit={handleConfirm} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button
              ref={confirmButtonRef}
              type="submit"
              variant={destructive ? 'destructive' : 'primary'}
              autoFocus
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
