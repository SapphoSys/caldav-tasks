import type { KeyboardShortcut } from '$types/index';
import { isMacPlatform } from '$utils/platform';

export const getMetaKeyLabel = () => {
  return isMacPlatform() ? '⌘' : 'Ctrl';
};

export const getAltKeyLabel = () => {
  return isMacPlatform() ? '⌥' : 'Alt';
};

export const getShiftKeyLabel = () => {
  return 'Shift';
};

export const getModifierJoiner = () => {
  return isMacPlatform() ? '' : '+';
};

export const formatShortcut = (shortcut: KeyboardShortcut | Partial<KeyboardShortcut>) => {
  const parts: string[] = [];
  if (shortcut.meta) parts.push(getMetaKeyLabel());
  if (shortcut.ctrl && !shortcut.meta) parts.push('Ctrl');
  if (shortcut.shift) parts.push(getShiftKeyLabel());
  if (shortcut.alt) parts.push(getAltKeyLabel());
  if (shortcut.key) {
    const keyDisplay =
      shortcut.key === ' '
        ? 'Space'
        : shortcut.key.length === 1
          ? shortcut.key.toUpperCase()
          : shortcut.key;
    parts.push(keyDisplay);
  }
  return parts.join(' + ') ?? 'Press keys...';
};
