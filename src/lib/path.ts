/** Normalize Astro pathname for nav matching (BASE_URL `/` must not strip the path root). */
export function normalizePathname(pathname: string, baseUrl = import.meta.env.BASE_URL || '/'): string {
	let path = pathname || '/';
	const base = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
	if (base && path.startsWith(base)) {
		path = path.slice(base.length) || '/';
	}
	if (!path.startsWith('/')) path = `/${path}`;
	if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
	return path;
}
