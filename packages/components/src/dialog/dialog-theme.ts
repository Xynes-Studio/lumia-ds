export type DialogTheme = 'light' | 'dark';

type DialogThemeRoot = Pick<HTMLElement, 'getAttribute' | 'classList'>;

export const DIALOG_OVERLAY_BACKDROP: Record<DialogTheme, string> = {
  light: 'rgba(9, 9, 11, 0.78)',
  dark: 'rgba(0, 0, 0, 0.82)',
};

export const resolveDialogTheme = (
  root?: DialogThemeRoot | null,
): DialogTheme => {
  if (!root) {
    return 'light';
  }

  const theme = root.getAttribute('data-theme');
  if (theme === 'dark') {
    return 'dark';
  }

  if (root.classList.contains('dark')) {
    return 'dark';
  }

  return 'light';
};

export const getDialogOverlayBackdrop = (theme: DialogTheme): string =>
  DIALOG_OVERLAY_BACKDROP[theme];
