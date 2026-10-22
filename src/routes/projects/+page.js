export const prerender = true;

export const load = async ({}) => {
    const projects = [
        {
            kind: 'web',
            title: 'MZEYFILMS',
            url: 'https://mzeyfilms.com',
            repo: 'GABRYCA/com.mzeyfilms.svelte',
            updatedAt: '2026-08-28T10:44:39Z',
            description:
                "MZEYFILMS's cinematic portfolio website: photography and video work, content managed with PocketBase.",
            tags: ['SvelteKit', 'Bootstrap', 'PocketBase'],
            live: true
        },
        {
            kind: 'web',
            title: 'Ristorante Aquazzurra Resort',
            url: 'https://ristoranteaquazzurrasveltekit.netlify.app/',
            updatedAt: '2026-09-16T21:28:22Z',
            description:
                'Multilingual restaurant website in Italian, English and German with menu, gallery and contact flow, designed and shipped end to end.',
            tags: ['SvelteKit', 'Paraglide i18n', 'Static'],
            live: true
        },
        {
            kind: 'svelte',
            title: 'svelte-tooltip-gca',
            url: 'https://www.npmjs.com/package/svelte-tooltip-gca',
            repo: 'GABRYCA/svelte-tooltip-gca',
            updatedAt: '2026-10-18T13:07:13Z',
            description:
                'Theme-aware tooltip action for Svelte 5 with automatic light/dark themes, native Popover API top-layer rendering and mobile-friendly behavior. Published on npm and used by this site.',
            tags: ['Svelte 5', 'npm package', 'Action'],
            meta: 'npm'
        },
        {
            kind: 'svelte',
            title: 'svelte-image-compressor',
            url: 'https://github.com/GABRYCA/svelte-image-compressor',
            repo: 'GABRYCA/svelte-image-compressor',
            updatedAt: '2025-02-25T21:27:47Z',
            description:
                'SvelteKit image compressor and converter to WebP built on Sharp, with a minimal API and token authentication.',
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
            updatedAt: '2026-10-19T19:54:39Z',
            description: 'This website: SvelteKit 3 and Svelte 5 running on Bun, statically rendered for Cloudflare Pages.',
            tags: ['SvelteKit 3', 'Svelte 5', 'Bun'],
            meta: 'this site'
        },
        {
            kind: 'uni',
            title: 'MelanomaTNM',
            url: 'https://github.com/GABRYCA/MelanomaTNM',
            repo: 'GABRYCA/MelanomaTNM',
            updatedAt: '2026-08-10T10:52:34Z',
            description:
                'Melanoma staging app built with Kotlin Multiplatform and Compose Multiplatform, targeting Android and iOS, backed by Firebase Firestore. Mobile programming exam project.',
            tags: ['Kotlin Multiplatform', 'Compose Multiplatform', 'Firebase'],
            meta: '30/30'
        },
        {
            kind: 'uni',
            title: 'ml-stress-rest',
            url: 'https://github.com/GABRYCA/ml-stress-rest',
            repo: 'GABRYCA/ml-stress-rest',
            updatedAt: '2026-07-01T09:36:48Z',
            description:
                'Machine learning study classifying stress and rest from wearable sensor data: EDA, logistic regression, SVM and random forests.',
            tags: ['Machine Learning', 'MATLAB', 'Data analysis'],
            meta: '30/30'
        },
        {
            kind: 'uni',
            title: 'ArtigianatoOnline',
            url: 'https://github.com/GABRYCA/ArtigianatoOnline',
            repo: 'GABRYCA/ArtigianatoOnline',
            updatedAt: '2025-06-08T21:02:34Z',
            description:
                'Full-stack marketplace for Italian artisans: Node.js and Express API, PostgreSQL database, Bootstrap front end, shipped with Docker.',
            tags: ['Node.js', 'Express', 'PostgreSQL'],
            meta: '30 e lode'
        },
        {
            kind: 'uni',
            title: 'BookRecommender',
            url: 'https://github.com/GABRYCA/BookRecommender',
            repo: 'GABRYCA/BookRecommender',
            updatedAt: '2025-06-13T13:37:01Z',
            description:
                'Book recommendation system from the LabA and LabB labs: JavaFX client, multithreaded socket server and PostgreSQL storage.',
            tags: ['Java', 'JavaFX', 'PostgreSQL']
        },
        {
            kind: 'uni',
            title: 'Algoritmi_Scuola',
            url: 'https://github.com/GABRYCA/Algoritmi_Scuola',
            repo: 'GABRYCA/Algoritmi_Scuola',
            updatedAt: '2026-07-01T09:30:25Z',
            description: 'Collected algorithms, exercises and notes from school and university: Java, C and JavaScript.',
            tags: ['Java', 'C', 'Algorithms']
        },
        {
            kind: 'uni',
            title: 'HCI lecture notes',
            url: 'https://github.com/GABRYCA/appunti-interazione-uomo-macchina',
            repo: 'GABRYCA/appunti-interazione-uomo-macchina',
            updatedAt: '2026-09-08T14:35:25Z',
            description:
                'LaTeX lecture notes and compiled PDFs for Interazione Uomo-Macchina, University of Insubria 2025/26, plus an interactive web guide with labs, quizzes and a formula sheet.',
            tags: ['LaTeX', 'PDF', 'Web guide']
        },
        {
            kind: 'uni',
            title: 'Mobile development notes',
            url: 'https://github.com/GABRYCA/appunti-programmazione-dispositivi-mobili',
            repo: 'GABRYCA/appunti-programmazione-dispositivi-mobili',
            updatedAt: '2026-09-08T14:29:41Z',
            description:
                'LaTeX lecture notes and compiled PDFs for Programmazione di Dispositivi Mobili, University of Insubria 2025/26, with a web version on GitHub Pages.',
            tags: ['LaTeX', 'Android', 'Kotlin']
        },
        {
            kind: 'tool',
            title: 'baan-c-vscode',
            url: 'https://github.com/GABRYCA/baan-c-vscode',
            repo: 'GABRYCA/baan-c-vscode',
            updatedAt: '2026-10-21T12:57:52Z',
            description:
                'Visual Studio Code extension adding complete language support for Baan C and Infor LN (3GL and 4GL): syntax highlighting, formatting, diagnostics and over 1,100 API completions.',
            tags: ['VS Code', 'Language support', 'esbuild'],
            meta: 'extension'
        }
    ]
        .map((project) => ({
            ...project,
            kindLabel: {
                web: 'Live website',
                svelte: 'Svelte work',
                uni: 'University',
                tool: 'VS Code'
            }[project.kind]
        }))
        .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));

    return {
        projects,
        title: 'Projects - AnonymousGCA',
        description:
            'Projects of AnonymousGCA: live websites, Svelte packages and components, university projects and VS Code tooling.',
        keywords:
            'projects, anonymousgca, svelte, sveltekit, university, projects, vs code, extension, npm, websites, open source'
    };
};
