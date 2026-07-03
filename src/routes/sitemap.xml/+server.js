import * as sitemap from 'super-sitemap/sveltekit'

export const prerender = true;

export const GET = async () => {
    return await sitemap.response({
        origin: 'https://anonymousgca.eu',
        excludeRoutePatterns: [
            /^\/old.*/,
        ],
    });
};