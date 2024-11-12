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
            url: 'https://kit.svelte.dev',
        },
        {
            title: 'Bootstrap',
            url: 'https://getbootstrap.com/',
        },
        {
            title: 'Pocketbase',
            url: 'https://pocketbase.io/'
        }
        ];

    return {
        websites,
        stacks,
        title: 'Projects - AnonymousGCA',
        /*description: 'Projects page of AnonymousGCA, including websites, apps, and other projects.',
        keywords: 'projects, anonymousgca, anonymous, gca, websites, apps, other, projects, svelte, sveltekit'*/
    }
}