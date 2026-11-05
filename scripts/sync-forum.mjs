import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'src', 'data', 'forum');
const postsDir = path.join(outDir, 'posts');

const FORUM_API_BASE = (process.env.FORUM_API_BASE || 'https://bbs.aridjaya.eu.org').replace(/\/+$/, '');

const DEFAULT_SITE_META = {
	site_brand: 'liuyuliangbox',
	project_codename: 'Project Turn',
	working_title_note: '正式名称待定 / Working Title',
	product_tagline: '单人修道，一回合定势。江湖未定，先把战斗打通。',
	site_description: '单人优先的回合制 RPG。开发日志、社区反馈与内测资讯。正式名称待定。',
	forum_link_label: 'bbs.aridjaya.eu.org',
	footer_rights: '保留所有权利。',
	friend_links: JSON.stringify([
		{ label: '社区 bbs.aridjaya.eu.org', url: 'https://bbs.aridjaya.eu.org' }
	])
};

async function fetchJson(url) {
	const res = await fetch(url, {
		headers: { Accept: 'application/json' },
		signal: AbortSignal.timeout(30000)
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`GET ${url} failed: ${res.status} ${text.slice(0, 200)}`);
	}
	return res.json();
}

function absolutizeForumUrl(url) {
	if (!url) return '';
	if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
	if (url.startsWith('/r2/')) return `${FORUM_API_BASE}${url}`;
	if (url.startsWith('/')) return `${FORUM_API_BASE}${url}`;
	return `${FORUM_API_BASE}/r2/${url.replace(/^\/+/, '')}`;
}

function extractCoverUrl(markdown) {
	const mdMatch = String(markdown || '').match(/!\[[^\]]*\]\(([^)\s]+)\)/i);
	const htmlMatch = String(markdown || '').match(/<img[^>]+src=["']([^"']+)["']/i);
	const raw = mdMatch?.[1] || htmlMatch?.[1] || '';
	if (!raw) return null;
	return absolutizeForumUrl(raw);
}

async function ensurePlaceholders() {
	await fs.mkdir(postsDir, { recursive: true });
	const catsPath = path.join(outDir, 'categories.json');
	const indexPath = path.join(outDir, 'posts-index.json');
	const metaPath = path.join(outDir, 'site-meta.json');
	try {
		await fs.access(catsPath);
		await fs.access(indexPath);
	} catch {
		await fs.writeFile(catsPath, '[]\n', 'utf8');
		await fs.writeFile(indexPath, '[]\n', 'utf8');
		console.warn('No cached forum data; wrote empty placeholders');
	}
	try {
		await fs.access(metaPath);
	} catch {
		await fs.writeFile(metaPath, JSON.stringify(DEFAULT_SITE_META, null, 2) + '\n', 'utf8');
	}
}

async function main() {
	if (process.env.SKIP_FORUM_SYNC === '1') {
		console.log('SKIP_FORUM_SYNC=1 — keeping existing forum data');
		await ensurePlaceholders();
		return;
	}

	console.log(`Syncing forum export from ${FORUM_API_BASE}`);
	await fs.mkdir(postsDir, { recursive: true });

	const [categories, postsPayload, siteMeta] = await Promise.all([
		fetchJson(`${FORUM_API_BASE}/api/export/site-categories`),
		fetchJson(`${FORUM_API_BASE}/api/export/site-posts?limit=200&offset=0`),
		fetchJson(`${FORUM_API_BASE}/api/export/site-meta`).catch(() => ({ ...DEFAULT_SITE_META }))
	]);
	const { posts = [] } = postsPayload || {};

	const sortedCategories = [...(categories || [])].sort(
		(a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || Number(a.id) - Number(b.id)
	);

	const index = [];
	for (const post of posts) {
		const detail = await fetchJson(`${FORUM_API_BASE}/api/export/site-posts/${post.id}`);
		const cover_url = extractCoverUrl(detail.content || '');
		const featured_comments = Array.isArray(detail.featured_comments)
			? detail.featured_comments.map((c) => ({
					id: c.id,
					content: c.content,
					created_at: c.created_at,
					author_name: c.author_name || '',
					author_avatar: c.author_avatar ? absolutizeForumUrl(c.author_avatar) : null
				}))
			: [];
		const site_featured = !!(detail.site_featured ?? post.site_featured);
		const record = {
			id: detail.id,
			title: detail.title,
			content: detail.content,
			summary: post.summary || '',
			category_id: detail.category_id,
			category_name: detail.category_name,
			author_name: detail.author_name,
			is_pinned: !!detail.is_pinned,
			site_featured,
			created_at: detail.created_at,
			cover_url,
			featured_comments
		};
		await fs.writeFile(path.join(postsDir, `${record.id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
		index.push({
			id: record.id,
			title: record.title,
			summary: record.summary,
			category_id: record.category_id,
			category_name: record.category_name,
			author_name: record.author_name,
			is_pinned: record.is_pinned,
			site_featured: record.site_featured,
			created_at: record.created_at,
			cover_url: record.cover_url
		});
	}

	const existing = await fs.readdir(postsDir);
	const keep = new Set(index.map((p) => `${p.id}.json`));
	for (const file of existing) {
		if (file.endsWith('.json') && !keep.has(file)) {
			await fs.unlink(path.join(postsDir, file));
		}
	}

	const meta = { ...DEFAULT_SITE_META, ...(siteMeta || {}) };
	await fs.writeFile(path.join(outDir, 'categories.json'), JSON.stringify(sortedCategories, null, 2) + '\n', 'utf8');
	await fs.writeFile(path.join(outDir, 'posts-index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
	await fs.writeFile(path.join(outDir, 'site-meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');
	console.log(`Synced ${sortedCategories.length} categories, ${index.length} posts, site-meta`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
