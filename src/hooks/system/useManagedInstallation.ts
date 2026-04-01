import { useEffect, useState } from 'react';
import { getInstallType, type InstallType } from '$utils/platform';

// Cache the installation type at module level to avoid re-fetching.
let cachedInstallType: InstallType | null = null;
let fetchPromise: Promise<InstallType> | null = null;

/**
 * Hook to detect if the app is running under a managed installation
 * where updates are handled externally.
 */
export const useManagedInstallation = () => {
  const [installType, setInstallType] = useState<InstallType | null>(cachedInstallType);

  useEffect(() => {
    let mounted = true;

    if (cachedInstallType !== null) {
      return;
    }

    if (!fetchPromise) {
      fetchPromise = getInstallType().finally(() => {
        fetchPromise = null;
      });
    }

    fetchPromise.then((type) => {
      cachedInstallType = type;
      if (mounted) {
        setInstallType(type);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const isManagedInstall = installType !== null && installType !== 'standard';

  return {
    isManagedInstall,
    installType,
    isLoading: installType === null,
  };
};
