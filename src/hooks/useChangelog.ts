import { useCallback, useState } from 'react';
import { fetchReleaseNotes } from '$utils/version';

export interface ChangelogData {
  version: string;
  body: string;
}

export const useChangelog = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [changelogData, setChangelogData] = useState<ChangelogData | null>(null);

  const openChangelog = useCallback(async (version: string, prefetchedBody?: string) => {
    if (prefetchedBody !== undefined) {
      setChangelogData({ version, body: prefetchedBody });
      return;
    }
    setIsLoading(true);
    const body = await fetchReleaseNotes(version);
    setIsLoading(false);
    setChangelogData({ version, body });
  }, []);

  const closeChangelog = useCallback(() => setChangelogData(null), []);

  return { openChangelog, closeChangelog, isLoading, changelogData };
};
