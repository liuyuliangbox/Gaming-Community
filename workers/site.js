/** Minimal Worker that serves Astro static assets (matches ASSETS binding). */
export default {
	async fetch(request, env) {
		return env.ASSETS.fetch(request);
	},
};
