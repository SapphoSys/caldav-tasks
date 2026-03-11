import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { loggers } from '$lib/logger';

const log = loggers.http;

/**
 * Normalizes a RustiCal server URL
 * Ensures proper protocol and removes trailing slashes
 */
export const normalizeRusticalUrl = (url: string) => {
  let normalized = url.trim();

  // Add https:// if no protocol specified
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');

  return normalized;
};

/**
 * Validates a RustiCal server by checking the /ping endpoint
 * @param serverUrl The RustiCal server URL
 * @returns Promise that resolves to true if it's a valid RustiCal server
 */
export const validateRusticalServer = async (serverUrl: string): Promise<boolean> => {
  const normalizedUrl = normalizeRusticalUrl(serverUrl);

  try {
    log.debug('Validating RustiCal server', { url: normalizedUrl });

    const response = await tauriFetch(`${normalizedUrl}/ping`, {
      method: 'GET',
    });

    if (!response.ok) {
      log.debug('Ping endpoint returned non-200 status', { status: response.status });
      return false;
    }

    const text = await response.text();

    // Check if it responds with "Pong!"
    const isRustical = text.trim() === 'Pong!';

    if (isRustical) {
      log.info('RustiCal server validated successfully', { url: normalizedUrl });
    } else {
      log.debug('Server responded but not with expected Pong message', { response: text });
    }

    return isRustical;
  } catch (error) {
    log.debug('RustiCal server validation failed', { error, url: normalizedUrl });
    return false;
  }
};
