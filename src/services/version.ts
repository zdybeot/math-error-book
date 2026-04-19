import { APP_VERSION, VERSION_CHECK_URL } from '@/src/config/version';

export interface VersionInfo {
  version: string;
  releaseNotes: string;
  downloadUrl: string;
}

/**
 * 获取当前版本号
 */
export function getCurrentVersion(): string {
  return APP_VERSION;
}

/**
 * 解析版本号字符串为数字数组用于比较
 */
function parseVersion(v: string): number[] {
  return v.split('.').map(n => parseInt(n, 10) || 0);
}

/**
 * 比较两个版本号
 * @returns 1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersion(a: string, b: string): number {
  const partsA = parseVersion(a);
  const partsB = parseVersion(b);
  const maxLen = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < maxLen; i++) {
    const aVal = partsA[i] || 0;
    const bVal = partsB[i] || 0;
    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }
  return 0;
}

/**
 * 检查是否有新版本
 *
 * 优先使用 VERSION_CHECK_URL，如果为空则使用 GitHub Releases API
 */
export async function checkForUpdate(): Promise<VersionInfo | null> {
  try {
    // 如果配置了自定义 URL，优先使用
    if (VERSION_CHECK_URL) {
      const res = await fetch(VERSION_CHECK_URL, { cache: 'no-store' });
      const data: VersionInfo = await res.json();
      if (compareVersion(data.version, APP_VERSION) > 0) {
        return data;
      }
      return null;
    }

    // 默认使用 GitHub Releases API 检查更新
    const res = await fetch(
      'https://api.github.com/repos/zdybeot/math-error-book/releases/latest',
      { cache: 'no-store' }
    );

    if (!res.ok) return null;

    const release = await res.json();
    const latestVersion = release.tag_name?.replace(/^v/, '') || '';
    const releaseNotes = release.body || '';
    const downloadUrl = release.assets?.[0]?.browser_download_url || '';

    if (compareVersion(latestVersion, APP_VERSION) > 0) {
      return {
        version: latestVersion,
        releaseNotes: releaseNotes || '发现新版本，请及时更新以获得更好的体验',
        downloadUrl,
      };
    }
  } catch (e) {
    console.error('检查更新失败:', e);
  }

  return null;
}
