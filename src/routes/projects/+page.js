export const prerender = true;

export const load = async ({}) => {

    const websites = [
        {
            title: 'MZEYFILMS',
            url: 'https://mzeyfilms.com',
        },
        {
            title: 'Ristorante Aquazzurra Resort',
            url: 'https://ristoranteaquazzurrasveltekit.netlify.app/',
        }
    ];

    const stacks = [
        {
            title: 'SvelteKit',
            description: 'A framework for building web applications of all sized with a powerful development experience.',
            url: 'https://kit.svelte.dev',
        },
        {
            title: 'Bootstrap',
            description: 'A powerful, extensible, and feature-packed frontend toolkit for responsive web development.',
            url: 'https://getbootstrap.com/',
        },
        {
            title: 'PocketBase',
            description: 'An open source backend consisting of embedded database with realtime subscriptions and built-in auth.',
            url: 'https://pocketbase.io/'
        }
        ];

    return {
        websites,
        stacks,
        title: 'Projects - AnonymousGCA',
        description: 'Projects page of AnonymousGCA, including websites, apps, and other projects.',
        keywords: 'projects, anonymousgca, anonymous, gca, websites, apps, other, projects, svelte, sveltekit'
    }
}