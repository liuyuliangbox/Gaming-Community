import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getForumPostIndex, parseForumDate } from '../lib/forum';

export async function GET(context) {
	const posts = getForumPostIndex();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.summary || post.title,
			pubDate: parseForumDate(post.created_at),
			link: `/logs/${post.id}/`,
		})),
	});
}
