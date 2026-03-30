let isCefRuntime: boolean | null = null;

/**
 * Detect if running under CEF (Chromium Embedded Framework) runtime
 */
export const isCEF = () => {
  if (isCefRuntime !== null) {
    return isCefRuntime;
  }

  const ua = navigator.userAgent;

  // Wry on macOS: "Mozilla/5.0 ... AppleWebKit/... Version/... Safari/..."
  // CEF: "Mozilla/5.0 ... Chrome/... Safari/..." (has Chrome but not "Version" from Safari)
  const hasChrome = ua.includes('Chrome/');
  const hasSafariVersion = ua.includes('Version/') && ua.includes('Safari/');

  isCefRuntime = hasChrome && !hasSafariVersion;

  return isCefRuntime;
};

/**
 * Detect if running on macOS platform
 */
export const isMacPlatform = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Mac/.test(navigator.userAgent);
};
