import { COLOR_PRESETS } from './constants';

/**
 * calculate the relative luminance of a color to determine appropriate contrast text color
 * uses the standard relative luminance formula from WCAG guidelines
 */
export const getContrastTextColor = (hexColor: string): string => {
  // handle cases where color might be invalid
  if (!hexColor || !hexColor.startsWith('#')) {
    return '#ffffff';
  }

  try {
    // convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);

    // calculate relative luminance using standard formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // return black text for bright colors, white for dark
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch {
    // fallback to white text if parsing fails
    return '#ffffff';
  }
};

/**
 * generate a consistent color for a tag based on its name
 */
export const generateTagColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = hash & hash;
  }

  return COLOR_PRESETS[Math.abs(hash) % COLOR_PRESETS.length];
};

/**
 * normalize a hex color by removing alpha channel if present (e.g., #ef4444FF -> #ef4444)
 * @param color - hex color string (with or without alpha)
 * @returns normalized hex color without alpha channel
 */
export const normalizeHexColor = (color: string | undefined | null): string | undefined => {
  if (!color) return undefined;

  // if color is 9 characters (#RRGGBBAA) and ends with FF, strip the alpha
  if (color.length === 9 && color.toUpperCase().endsWith('FF')) {
    return color.substring(0, 7);
  }

  return color;
};
