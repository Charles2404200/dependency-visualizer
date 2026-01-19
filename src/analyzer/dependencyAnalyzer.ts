import axios from 'axios';
import semver from 'semver';
import type { RawDeps, DependencyInfo, AnalysisResult, DepType, SecurityFlag } from '../shared/types';

// Parse text package.json
export function parsePackageJsonText(text: string): RawDeps {
  const json = JSON.parse(text);

  return {
    dependencies: json.dependencies || {},
    devDependencies: json.devDependencies || {},
  };
}

// Gọi npm registry lấy info
async function fetchPkgMeta(name: string) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  const res = await axios.get(url, { timeout: 8000 });
  return res.data as any;
}

// Xác định security flag đơn giản:
// - nếu latest bị deprecated -> deprecated
// - nếu có "beta" / "alpha" trong tag -> warning
function getSecurityFlag(meta: any, latestVersion: string | undefined): { flag: SecurityFlag; note?: string } {
  if (!latestVersion) return { flag: 'none' };

  const latestInfo = meta.versions?.[latestVersion];
  if (latestInfo?.deprecated) {
    return {
      flag: 'deprecated',
      note: typeof latestInfo.deprecated === 'string' ? latestInfo.deprecated : 'This version is deprecated.',
    };
  }

  if (latestVersion.includes('beta') || latestVersion.includes('alpha') || latestVersion.includes('rc')) {
    return {
      flag: 'warning',
      note: 'Latest version is pre-release (beta/alpha/rc).',
    };
  }

  return { flag: 'none' };
}

export async function analyzeDependencies(
  raw: RawDeps,
  onProgress?: (done: number, total: number) => void
): Promise<AnalysisResult> {

  const deps: DependencyInfo[] = [];

  const allEntries: Array<{ type: DepType; name: string; requested: string }> = [];

  for (const [name, requested] of Object.entries(raw.dependencies)) {
    allEntries.push({ type: 'dependencies', name, requested });
  }
  for (const [name, requested] of Object.entries(raw.devDependencies)) {
    allEntries.push({ type: 'devDependencies', name, requested });
  }

  const total = allEntries.length;
  let done = 0;

  for (const item of allEntries) {
    try {
      const meta = await fetchPkgMeta(item.name);
      const latest = meta['dist-tags']?.latest as string | undefined;

      let isOutdated: boolean | undefined = undefined;
      if (latest && semver.valid(latest) && semver.validRange(item.requested)) {
        isOutdated = !semver.satisfies(latest, item.requested);
      }

      const { flag, note } = getSecurityFlag(meta, latest);

      // Lấy github repo URL nếu có
      let githubUrl: string | undefined;
      const repo = meta.repository;
      if (repo && typeof repo.url === 'string') {
        // repo.url thường có dạng: "git+https://github.com/vuejs/core.git"
        githubUrl = repo.url
          .replace(/^git\+/, '')
          .replace(/\.git$/, '');
      }

      deps.push({
        name: item.name,
        type: item.type,
        requested: item.requested,
        latest,
        isOutdated,
        securityFlag: flag,
        note,
        githubUrl
      });
    } catch (err) {
      deps.push({
        name: item.name,
        type: item.type,
        requested: item.requested,
        latest: undefined,
        isOutdated: undefined,
        securityFlag: 'none',
        note: 'Failed to fetch metadata',
        githubUrl: undefined
      });
    }

    done++;
    if (onProgress) onProgress(done, total);
  }

  return {
    deps,
    generatedAt: new Date().toISOString(),
  };
}

