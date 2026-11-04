/**
 * One-shot: migrate src/content/logs/*.md into forum category「开发进度」.
 * Usage:
 *   FORUM_API_BASE=https://bbs.aridjaya.eu.org \
 *   FORUM_ADMIN_EMAIL=admin@adysec.com \
 *   FORUM_ADMIN_PASSWORD='...' \
 *   node scripts/migrate-logs-to-forum.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../src/content/logs');
const FORUM_API_BASE = (process.env.FORUM_API_BASE || 'https://bbs.aridjaya.eu.org').replace(/\/+$/, '');
const email = process.env.FORUM_ADMIN_EMAIL || 'admin@adysec.com';
const password = process.env.FORUM_ADMIN_PASSWORD;

if (!password) {
	console.error('Set FORUM_ADMIN_PASSWORD');
	process.exit(1);
}

function parseFrontmatter(raw) {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!m) return { meta: {}, body: raw.trim() };
	const meta = {};
	for (const line of m[1].split(/\r?\n/)) {
		const idx = line.indexOf(':');
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim();
		let value = line.slice(idx + 1).trim();
		if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
			value = value.slice(1, -1);
		}
		meta[key] = value;
	}
	return { meta, body: m[2].trim() };
}

function securityHeaders() {
	return {
		'Content-Type': 'application/json',
		'X-Timestamp': String(Math.floor(Date.now() / 1000)),
		'X-Nonce': crypto.randomUUID()
	};
}

async function main() {
	const files = (await fs.readdir(logsDir)).filter((f) => f.endsWith('.md')).sort();
	const posts = [];
	for (const file of files) {
		const raw = await fs.readFile(path.join(logsDir, file), 'utf8');
		const { meta, body } = parseFrontmatter(raw);
		const title = String(meta.title || file).slice(0, 30);
		const description = meta.description ? `\n\n> ${meta.description}\n` : '';
		const content = `${description}${body}`.slice(0, 3000);
		const created_at = meta.pubDate ? `${meta.pubDate} 12:00:00` : undefined;
		posts.push({ title, content, category_name: '开发进度', created_at });
		console.log(`Prepared: ${title}`);
	}

	const loginRes = await fetch(`${FORUM_API_BASE}/api/login`, {
		method: 'POST',
		headers: securityHeaders(),
		body: JSON.stringify({ email, password })
	});
	const loginBody = await loginRes.json().catch(() => ({}));
	if (!loginRes.ok) {
		throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginBody)}`);
	}
	const token = loginBody.token;
	if (!token) throw new Error('No token in login response');

	const importRes = await fetch(`${FORUM_API_BASE}/api/admin/import-posts`, {
		method: 'POST',
		headers: {
			...securityHeaders(),
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ posts })
	});
	const importBody = await importRes.json().catch(() => ({}));
	if (!importRes.ok) {
		throw new Error(`Import failed: ${importRes.status} ${JSON.stringify(importBody)}`);
	}
	console.log('Imported post ids:', importBody.ids);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
