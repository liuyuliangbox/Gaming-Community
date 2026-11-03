export const STUDIO_NAME = 'liuyuliangbox';
export const PROJECT_CODENAME = 'Project Turn';
export const SITE_TITLE = 'liuyuliangbox';
export const SITE_DESCRIPTION =
	'单人优先的回合制 RPG。开发日志、社区反馈与内测资讯。正式名称待定。';
export const SITE_TAGLINE = '单人优先的回合制 RPG，开发日志与社区反馈进行中';
export const WORKING_TITLE_NOTE = '正式名称待定 / Working Title';

/** GitHub Discussions 论坛（开启后即可使用） */
export const DISCUSSIONS_URL =
	'https://github.com/liuyuliangbox/Gaming-Community/discussions';

/** 论坛短链（Cloudflare 301 到 Discussions） */
export const BBS_URL = 'https://bbs.aridjaya.eu.org';

/**
 * Giscus 配置：在 https://giscus.app/zh-CN 按仓库生成后填入。
 * 需先在仓库 Settings → Features 启用 Discussions，并创建「评论」分类。
 */
export const GISCUS = {
	repo: 'liuyuliangbox/Gaming-Community',
	repoId: 'R_kgDOVg4cNg',
	category: 'General',
	categoryId: 'DIC_kwDOVg4cNs4DKRAY',
	mapping: 'pathname',
	strict: '0',
	reactionsEnabled: '1',
	emitMetadata: '0',
	inputPosition: 'top',
	theme: 'light',
	lang: 'zh-CN',
} as const;
