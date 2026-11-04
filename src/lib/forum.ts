import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
	BBS_URL,
	PROJECT_CODENAME,
	SITE_DESCRIPTION,
	SITE_TITLE,
	WORKING_TITLE_NOTE,
} from '../consts';

export type ForumCategory = {
	id: number;
	name: string;
	subtitle?: string;
	sort_order?: number;
	created_at?: string;
};

export type SiteMeta = {
	site_brand: string;
	project_codename: string;
	working_title_note: string;
	site_description: string;
	forum_link_label: string;
	footer_rights: string;
};

export type ForumFeaturedComment = {
	id: number;
	content: string;
	created_at: string;
	author_name?: string;
	author_avatar?: string | null;
};

export type ForumPostIndex = {
	id: number;
	title: string;
	summary: string;
	category_id: number | null;
	category_name: string | null;
	author_name?: string;
	is_pinned?: boolean;
	created_at: string;
	cover_url?: string | null;
};

export type ForumPost = ForumPostIndex & {
	content: string;
	featured_comments?: ForumFeaturedComment[];
};

const dataDir = path.join(process.cwd(), 'src', 'data', 'forum');

const DEFAULT_SITE_META: SiteMeta = {
	site_brand: SITE_TITLE,
	project_codename: PROJECT_CODENAME,
	working_title_note: WORKING_TITLE_NOTE,
	site_description: SITE_DESCRIPTION,
	forum_link_label: 'bbs.aridjaya.eu.org',
	footer_rights: '保留所有权利。',
};

function readJson<T>(filePath: string, fallback: T): T {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
	} catch {
		return fallback;
	}
}

export function getSiteMeta(): SiteMeta {
	const raw = readJson<Partial<SiteMeta>>(path.join(dataDir, 'site-meta.json'), {});
	return {
		site_brand: String(raw.site_brand || DEFAULT_SITE_META.site_brand),
		project_codename: String(raw.project_codename || DEFAULT_SITE_META.project_codename),
		working_title_note: String(raw.working_title_note || DEFAULT_SITE_META.working_title_note),
		site_description: String(raw.site_description || DEFAULT_SITE_META.site_description),
		forum_link_label: String(raw.forum_link_label || DEFAULT_SITE_META.forum_link_label),
		footer_rights: String(raw.footer_rights || DEFAULT_SITE_META.footer_rights),
	};
}

export function getForumCategories(): ForumCategory[] {
	const list = readJson<ForumCategory[]>(path.join(dataDir, 'categories.json'), []);
	return [...list].sort(
		(a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || Number(a.id) - Number(b.id)
	);
}

export function findForumCategoryByNames(...names: string[]): ForumCategory | undefined {
	const wanted = new Set(names.map((n) => n.trim()).filter(Boolean));
	return getForumCategories().find((c) => wanted.has(c.name));
}

export function getForumPostIndex(): ForumPostIndex[] {
	const list = readJson<ForumPostIndex[]>(path.join(dataDir, 'posts-index.json'), []);
	return list.sort((a, b) => {
		if (!!b.is_pinned !== !!a.is_pinned) return b.is_pinned ? 1 : -1;
		return new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf();
	});
}

export function getForumPostsByCategory(categoryId: number | string): ForumPostIndex[] {
	const id = Number(categoryId);
	return getForumPostIndex().filter((p) => Number(p.category_id) === id);
}

export function getForumPost(id: number | string): ForumPost | null {
	const file = path.join(dataDir, 'posts', `${id}.json`);
	return readJson<ForumPost | null>(file, null);
}

/** Rewrite relative forum asset paths to absolute bbs URLs for static pages. */
export function absolutizeForumMedia(markdown: string): string {
	return markdown
		.replace(/\]\(\/r2\//g, `](${BBS_URL}/r2/`)
		.replace(/src=["']\/r2\//g, `src="${BBS_URL}/r2/`);
}

export function absolutizeForumUrl(url: string): string {
	if (!url) return '';
	if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
	if (url.startsWith('/r2/')) return `${BBS_URL}${url}`;
	if (url.startsWith('/')) return `${BBS_URL}${url}`;
	return `${BBS_URL}/r2/${url.replace(/^\/+/, '')}`;
}

/** First markdown/HTML image in post body (same idea as forum list cover). */
export function extractForumCoverUrl(markdown: string): string | null {
	const mdMatch = String(markdown || '').match(/!\[[^\]]*\]\(([^)\s]+)\)/i);
	const htmlMatch = String(markdown || '').match(/<img[^>]+src=["']([^"']+)["']/i);
	const raw = mdMatch?.[1] || htmlMatch?.[1] || '';
	if (!raw) return null;
	return absolutizeForumUrl(raw);
}

export function parseForumDate(dateString: string | undefined | null): Date {
	if (!dateString) return new Date();
	const ms = Date.parse(dateString.endsWith('Z') ? dateString : `${dateString}Z`);
	return Number.isNaN(ms) ? new Date() : new Date(ms);
}

export function decodeForumHtml(text: string): string {
	return String(text || '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'");
}

export function maskUsername(name: string | undefined | null): string {
	const s = String(name || '').trim();
	if (!s) return '玩家';
	if (s.length <= 2) return `${s[0] || '*'}*`;
	return `${s[0]}${'*'.repeat(Math.min(4, s.length - 2))}${s[s.length - 1]}`;
}

/** Deterministic identicon (same idea as CForum generateIdenticonSvg). */
export function identiconDataUri(seed: string): string {
	const hash = createHash('sha256').update(String(seed || 'guest')).digest();
	const color = `rgb(${hash[0] % 200},${hash[1] % 200},${hash[2] % 200})`;
	const cells: string[] = [];
	for (let y = 0; y < 5; y++) {
		for (let x = 0; x < 5; x++) {
			const bit = hash[(y * 5 + x) % hash.length] & 1;
			if (bit) {
				cells.push(
					`<rect x="${x * 10}" y="${y * 10}" width="10" height="10" fill="${color}" />`
				);
			}
		}
	}
	const svg = `<svg width="100" height="100" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"> <rect width="50" height="50" fill="#f0f0f0" /> ${cells.join('')} </svg>`;
	return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
