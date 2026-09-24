import { URL } from 'url';

export function normalizeUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl, baseUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    parsed.hash = '';
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isSameDomain(targetUrl: string, candidateUrl: string): boolean {
  try {
    const target = new URL(targetUrl);
    const candidate = new URL(candidateUrl);
    return target.hostname === candidate.hostname && target.protocol === candidate.protocol;
  } catch {
    return false;
  }
}

export function categorizeResource(urlStr: string, contentType: string = ''): { type: 'Pages' | 'API' | 'Authentication' | 'Assets' | 'Other' } {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname.toLowerCase();

    if (path.includes('/login') || path.includes('/signin') || path.includes('/auth')) return { type: 'Authentication' };
    if (path.startsWith('/api/') || path.includes('/v1/') || contentType.includes('application/json')) return { type: 'API' };
    if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/) || contentType.includes('javascript') || contentType.includes('css')) return { type: 'Assets' };
    if (path === '/' || path.match(/^\/[a-zA-Z0-9_\-\.]+\/?$/)) return { type: 'Pages' };
    return { type: 'Other' };
  } catch {
    return { type: 'Other' };
  }
}

export function getStatusCategory(status: number): 'Accessible' | 'Redirect' | 'Forbidden' | 'Not Found' | 'Server Error' | 'Referenced' {
  if (status === 200) return 'Accessible';
  if (status >= 301 && status <= 308) return 'Redirect';
  if (status === 403) return 'Forbidden';
  if (status === 404) return 'Not Found';
  if (status >= 500) return 'Server Error';
  return 'Accessible';
}
