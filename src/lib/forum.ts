import fs from 'node:fs';
import path from 'node:path';
import { BBS_URL } from '../consts';

export type ForumCategory = {
	id: number;
	name: string;
	subtitle?: string;
	created_at?: string;
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
};

const dataDir = path.join(process.cwd(), 'src', 'data', 'forum');

function readJson<T>(filePath: string, fallback: T): T {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
	} catch {
		return fallback;
	}
}

export function getForumCategories(): ForumCategory[] {
	return readJson<ForumCategory[]>(path.join(dataDir, 'categories.json'), []);
}

export function getForumPostIndex(): ForumPostIndex[] {
	const list = readJson<ForumPostIndex[]>(path.join(dataDir, 'posts-index.json'), []);
	return list.sort((a, b) => {
		if (!!b.is_pinned !== !!a.is_pinned) return b.is_pinned ? 1 : -1;
		return new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf();
	});
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
export function extractCoverUrl(markdown: string): string | null {
	const mdMatch = markdown.match(/!\[[^\]]*\]\(([^)\s]+)\)/i);
	const htmlMatch = markdown.match(/<img[^>]+src=["']([^"']+)["']/i);
	const raw = mdMatch?.[1] || htmlMatch?.[1] || '';
	if (!raw) return null;
	return absolutizeForumUrl(raw);
}

export function parseForumDate(value: string): Date {
	const normalized = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
	const d = new Date(normalized);
	return Number.isNaN(d.valueOf()) ? new Date(value) : d;
}
