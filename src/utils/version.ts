import packageJson from '../../package.json';

export interface AppInfo {
  version: string;
  name: string;
  description: string;
  author: string;
}

/**
 * Get application information from package.json
 */
export function getAppInfo() {
  const pkg = packageJson satisfies AppInfo;

  return {
    version: pkg.version,
    name: pkg.name,
    description: pkg.description,
    author: pkg.author,
  } as const;
}
