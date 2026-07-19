export const prerender = true;

export const load = async ({}) => {

    const websites = [
        {
            title: 'MZEYFILMS',
            url: 'https://mzeyfilms.com',
            description: 'Cinematic portfolio site for a film brand: bold visuals, modern layout, and a production-focused presence.',
            tags: ['SvelteKit', 'Bootstrap', 'Responsive'],
            accent: 'crimson'
        },
        {
            title: 'Ristorante Aquazzurra Resort',
            url: 'https://ristoranteaquazzurrasveltekit.netlify.app/',
            description: 'Restaurant and resort experience site with atmosphere-first design and clear booking-oriented structure.',
            tags: ['SvelteKit', 'UI design', 'Static'],
            accent: 'violet'
        }
    ];

    const stacks = [
        {
            title: 'SvelteKit',
            description: 'A framework for building web applications of all sizes with a powerful development experience.',
            url: 'https://kit.svelte.dev',
            icon: 'fas fa-bolt',
            aos_delay: 150,
        },
        {
            title: 'Bootstrap',
            description: 'A powerful, extensible, and feature-packed frontend toolkit for responsive web development.',
            url: 'https://getbootstrap.com/',
            icon: 'fab fa-bootstrap',
            aos_delay: 300,
        },
        {
            title: 'PocketBase',
            description: 'An open source backend consisting of embedded database with realtime subscriptions and built-in auth.',
            url: 'https://pocketbase.io/',
            icon: 'fas fa-database',
            aos_delay: 450,
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
