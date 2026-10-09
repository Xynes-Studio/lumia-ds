/** Shared modal layers sit above full-screen application shells (z-50). */
export const OVERLAY_Z_CLASS = 'z-[200]';
// Equal layers let a later nested portal's scrim cover the parent content.
// Each portal renders its content after its own scrim.
export const OVERLAY_CONTENT_Z_CLASS = OVERLAY_Z_CLASS;
