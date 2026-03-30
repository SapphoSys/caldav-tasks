import type { KeyboardShortcut } from '$types';
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

const KEY_DISPLAY_NAMES: Record<string, string> = {
  ' ': 'Space',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Escape: 'Esc',
};

export const formatShortcut = (shortcut: KeyboardShortcut | Partial<KeyboardShortcut>) => {
  const parts: string[] = [];
  if (shortcut.meta) parts.push(getMetaKeyLabel());
  if (shortcut.ctrl && !shortcut.meta) parts.push('Ctrl');
  if (shortcut.shift) parts.push(getShiftKeyLabel());
  if (shortcut.alt) parts.push(getAltKeyLabel());
  if (shortcut.key) {
    const keyDisplay =
      KEY_DISPLAY_NAMES[shortcut.key] ??
      (shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
    parts.push(keyDisplay);
  }
  return parts.join(' + ') ?? 'Press keys...';
};
