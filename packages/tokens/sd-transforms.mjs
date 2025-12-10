const PRIMARY_SCALE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const PRIMARY_SCALE_WEIGHTS = {
  50: 0.85,
  100: 0.75,
  200: 0.6,
  300: 0.45,
  400: 0.3,
  500: 0,
  600: -0.18,
  700: -0.32,
  800: -0.45,
  900: -0.6,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeHex = (color) => {
  const stripped = color.trim().replace('#', '');

  if (/^[0-9a-fA-F]{3}$/.test(stripped)) {
    return `#${stripped
      .split('')
      .map((char) => char.repeat(2))
      .join('')}`.toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(stripped)) {
    return `#${stripped.toLowerCase()}`;
  }

  return null;
};

const hexToRgbTuple = (hex) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  const value = normalized.slice(1);
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);

  return [r, g, b];
};

const rgbToHex = ([r, g, b]) => {
  const toHex = (channel) =>
    clamp(channel, 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const blendChannel = (channel, target, ratio) =>
  clamp(Math.round(channel + (target - channel) * ratio), 0, 255);

export const generatePrimaryScale = (primary) => {
  const rgb = hexToRgbTuple(primary);
  if (!rgb) {
    return PRIMARY_SCALE_STOPS.reduce(
      (scale, stop) => ({ ...scale, [stop]: primary }),
      {},
    );
  }

  return PRIMARY_SCALE_STOPS.reduce((scale, stop) => {
    const weight = PRIMARY_SCALE_WEIGHTS[stop];
    if (weight === 0) {
      scale[stop] = rgbToHex(rgb);
      return scale;
    }

    const ratio = clamp(Math.abs(weight), 0, 1);
    const target = weight > 0 ? 255 : 0;
    const [r, g, b] = rgb;

    scale[stop] = rgbToHex([
      blendChannel(r, target, ratio),
      blendChannel(g, target, ratio),
      blendChannel(b, target, ratio),
    ]);

    return scale;
  }, {});
};

export const hexToRgba = (hex, alpha) => {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const contrast = (hex) => {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return '#000000';

  const [r, g, b] = rgb;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
};
