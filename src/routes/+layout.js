export const prerender = true;

export const load = async ({url}) => {

    return {
        title: 'AnonymousGCA - Official',
        twitter: true,
        openGraph: true,
        schemaOrg: true,
        locale: 'en_US',
        description: 'AnonymousGCA - Web Developer, Full-Stack Developer, University Student, SvelteKit enthusiast, Soccer-Robocup programmer',
        siteName: 'AnonymousGCA - Official',
        socials: [
            'https://github.com/GABRYCA',
            'https://www.linkedin.com/in/gabriele-caretti-046408270/',
            'https://www.youtube.com/@anonymousgca5331',
            'https://www.reddit.com/u/AnonymousGCA',
            'https://discord.gg/RSp2CSuMny',
            'https://ud.me/anonymousgca.crypto'
        ],
        //imageURL: `${url.origin}/favicon.webp`,
        //logo: `${url.origin}/favicon.webp`,
        imageURL: `https://avatars.githubusercontent.com/u/39743848?v=4`,
        logo: `https://avatars.githubusercontent.com/u/39743848?v=4`,
        author: 'AnonymousGCA',
        name: 'AnonymousGCA',
        canonical: 'https://anonymousgca.eu' + url.pathname,
        keywords: 'AnonymousGCA, Developer, Designer, Web Development, Svelte, SvelteKit, University Student'
    }
}