export const prerender = true;

export const load = async ({}) => {

    // NOTE: `updatedAt` mirrors each repo's last push (GitHub `pushed_at`, a good
    // proxy for the last commit date) and drives the catalogue sort order below.
    // Refresh a date with: `gh repo view GABRYCA/<repo> --json pushedAt -q .pushedAt`
    // Projects without a public repo (e.g. Ristorante Aquazzurra) omit it and sort last.
    const projects = [
        {
            kind: 'web',
            title: 'MZEYFILMS',
            url: 'https://mzeyfilms.com',
            repo: 'GABRYCA/com.mzeyfilms.svelte',
            updatedAt: '2026-08-28T10:44:39Z',
            description: "MZEYFILMS's cinematic portfolio website — photography and video work, content managed with PocketBase.",
            tags: ['SvelteKit', 'Bootstrap', 'PocketBase'],
            live: true
        },
        {
            kind: 'web',
            title: 'Ristorante Aquazzurra Resort',
            url: 'https://ristoranteaquazzurasveltekit.netlify.app/',
            description: 'Restaurant website with menu, gallery and contact flow, designed and shipped end to end.',
            tags: ['SvelteKit', 'UI design', 'Static'],
            live: true
        },
        {
            kind: 'svelte',
            title: 'svelte-tooltip-gca',
            url: 'https://www.npmjs.com/package/svelte-tooltip-gca',
            repo: 'GABRYCA/svelte-tooltip-gca',
            updatedAt: '2026-08-17T20:46:26Z',
            description: 'Theme-aware tooltip action for Svelte 5 with automatic light/dark themes and mobile-friendly behavior. Published on npm and used by this site.',
            tags: ['Svelte 5', 'npm package', 'Action'],
            meta: 'npm'
        },
        {
            kind: 'svelte',
            title: 'svelte-image-compressor',
            url: 'https://github.com/GABRYCA/svelte-image-compressor',
            repo: 'GABRYCA/svelte-image-compressor',
            updatedAt: '2025-02-25T21:27:47Z',
            description: 'SvelteKit image compressor and converter to WebP built on Sharp, with a minimal API and token authentication.',
            tags: ['SvelteKit', 'Sharp', 'WebP']
        },
        {
            kind: 'svelte',
            title: 'svelte-image-proxy',
            url: 'https://github.com/GABRYCA/svelte-image-proxy',
            repo: 'GABRYCA/svelte-image-proxy',
            updatedAt: '2025-02-25T22:31:12Z',
            description: 'Image compression service with an API, built with Svelte 5 and SvelteKit.',
            tags: ['Svelte 5', 'API', 'Service']
        },
        {
            kind: 'svelte',
            title: 'eu.anonymousgca.svelte',
            url: 'https://github.com/GABRYCA/eu.anonymousgca.svelte',
            repo: 'GABRYCA/eu.anonymousgca.svelte',
            updatedAt: '2026-09-16T19:41:50Z',
            description: 'This website: SvelteKit 2 and Svelte 5 running on Bun, statically rendered for Cloudflare Pages.',
            tags: ['SvelteKit 2', 'Svelte 5', 'Bun'],
            meta: 'this site'
        },
        {
            kind: 'uni',
            title: 'MelanomaTNM',
            url: 'https://github.com/GABRYCA/MelanomaTNM',
            repo: 'GABRYCA/MelanomaTNM',
            updatedAt: '2026-08-10T10:52:34Z',
            description: 'Android application classifying melanoma stages with the TNM system. Mobile programming exam project, built with Kotlin and Jetpack Compose.',
            tags: ['Kotlin', 'Android', 'Jetpack Compose'],
            meta: '30/30'
        },
        {
            kind: 'uni',
            title: 'ml-stress-rest',
            url: 'https://github.com/GABRYCA/ml-stress-rest',
            repo: 'GABRYCA/ml-stress-rest',
            updatedAt: '2026-07-01T09:36:48Z',
            description: 'Machine learning study classifying stress and rest from wearable sensor data: EDA, logistic regression, SVM and random forests.',
            tags: ['Machine Learning', 'MATLAB', 'Data analysis'],
            meta: '30/30'
        },
        {
            kind: 'uni',
            title: 'ArtigianatoOnline',
            url: 'https://github.com/GABRYCA/ArtigianatoOnline',
            repo: 'GABRYCA/ArtigianatoOnline',
            updatedAt: '2025-06-08T21:02:34Z',
            description: 'Full-stack marketplace for Italian artisans, built for the web technologies course.',
            tags: ['Node.js', 'Express', 'Bootstrap'],
            meta: '30 e lode'
        },
        {
            kind: 'uni',
            title: 'BookRecommender',
            url: 'https://github.com/GABRYCA/BookRecommender',
            repo: 'GABRYCA/BookRecommender',
            updatedAt: '2025-06-13T13:37:01Z',
            description: 'Book recommendation web application from the LabA and LabB course labs.',
            tags: ['Web', 'Lab project']
        },
        {
            kind: 'uni',
            title: 'Algoritmi_Scuola',
            url: 'https://github.com/GABRYCA/Algoritmi_Scuola',
            repo: 'GABRYCA/Algoritmi_Scuola',
            updatedAt: '2026-07-01T09:30:25Z',
            description: 'Collected algorithms, exercises and notes from school and university — Java, C and JavaScript.',
            tags: ['Java', 'C', 'Algorithms']
        },
        {
            kind: 'uni',
            title: 'HCI lecture notes',
            url: 'https://github.com/GABRYCA/appunti-interazione-uomo-macchina',
            repo: 'GABRYCA/appunti-interazione-uomo-macchina',
            updatedAt: '2026-09-08T14:35:25Z',
            description: 'LaTeX lecture notes and compiled PDFs for Interazione Uomo-Macchina, University of Insubria 2025/26.',
            tags: ['LaTeX', 'PDF', 'HCI']
        },
        {
            kind: 'uni',
            title: 'Mobile development notes',
            url: 'https://github.com/GABRYCA/appunti-programmazione-dispositivi-mobili',
            repo: 'GABRYCA/appunti-programmazione-dispositivi-mobili',
            updatedAt: '2026-09-08T14:29:41Z',
            description: 'LaTeX lecture notes for Programmazione di Dispositivi Mobili, University of Insubria 2025/26.',
            tags: ['LaTeX', 'Android', 'Kotlin']
        },
        {
            kind: 'tool',
            title: 'baan-c-vscode',
            url: 'https://github.com/GABRYCA/baan-c-vscode',
            repo: 'GABRYCA/baan-c-vscode',
            updatedAt: '2026-08-07T09:47:11Z',
            description: 'Visual Studio Code extension adding complete language support for Baan C and Infor LN (3GL and 4GL).',
            tags: ['VS Code', 'Language support', 'esbuild'],
            meta: 'extension'
        }
    ].map((project) => ({
        ...project,
        kindLabel: {
            web: 'Live website',
            svelte: 'Svelte work',
            uni: 'University',
            tool: 'VS Code'
        }[project.kind]
    // Most recently active first; projects without `updatedAt` sort last.
    })).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));

    return {
        projects,
        title: 'Projects - AnonymousGCA',
        description: 'Projects of AnonymousGCA: live websites, Svelte packages and components, university projects and VS Code tooling.',
        keywords: 'projects, anonymousgca, svelte, sveltekit, university, projects, vs code, extension, npm, websites, open source'
    }
}
