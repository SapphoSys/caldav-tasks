export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Mac/.test(navigator.userAgent);
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
