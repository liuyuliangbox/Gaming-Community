import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 开发日志已改为论坛静态同步（src/data/forum）。
 * 保留空 collection，避免删除目录后 Astro 报错；勿再往这里加 MD 日志。
 */
const logs = defineCollection({
	loader: glob({ base: './src/content/logs', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

export const collections = { logs };
