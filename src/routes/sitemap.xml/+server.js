import * as sitemap from 'super-sitemap';

export const prerender = false;

export const GET = async () => {
    return await sitemap.response({
        origin: 'https://anonymousgca.eu',
        excludeRoutePatterns: [
            '^/.well-known.*',
            '^/old.*',
            ],
    });
};