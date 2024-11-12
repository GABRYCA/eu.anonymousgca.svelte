export const load = async ({ url }) => {
    return {
        title: 'AnonymousGCA - Official',
        description: 'AnonymousGCA - Web Developer, Full-Stack Developer, University Student, SvelteKit enthusiast, Soccer-Robocup programmer',
        siteName: 'AnonymousGCA - Official',
        imageURL: `${url.origin}/favicon-512.webp`,
        logo: `${url.origin}/favicon-512.webp`,
        author: 'AnonymousGCA',
        name: 'AnonymousGCA',
        twitter: false,
        openGraph: false,
        canonical: url.href,
        keywords: 'AnonymousGCA, Developer, Designer, Web Development, Svelte, SvelteKit, University Student'
    }
}