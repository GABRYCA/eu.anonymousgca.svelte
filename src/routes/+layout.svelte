<script>
    import {page} from "$app/state";
    import {resolve} from "$app/paths";
    import {onNavigate} from "$app/navigation";
    import {tick} from "svelte";
    import SVGWave from "$lib/components/SVGWave.svelte";
    import AnimatedWave from "$lib/components/AnimatedWave.svelte";
    import 'bootstrap/dist/css/bootstrap.min.css';
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import '$lib/style/style.css';
    import Seo from "$lib/components/Seo.svelte";
    import {tooltip} from 'svelte-tooltip-gca';
    import {primaryTooltipTheme} from '$lib/tooltipThemes.js';

    /** @type {{children?: import('svelte').Snippet}} */
    let {children} = $props();

    let menuOpen = $state(false);
    let utilityOpen = $state(false);
    let navHidden = $state(false);
    let lastScrollY = 0;
    let scrollFrame = 0;
    const pathname = $derived(page.url.pathname);

    function closeMenu() {
        menuOpen = false;
        utilityOpen = false;
    }

    function toggleMenu() {
        menuOpen = !menuOpen;
        if (!menuOpen) utilityOpen = false;
    }

    function toggleUtility() {
        utilityOpen = !utilityOpen;
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') closeMenu();
    }

    function handleScroll() {
        if (scrollFrame) return;

        scrollFrame = window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY;

            if (currentScrollY < 48 || scrollDelta < -4) {
                navHidden = false;
            } else if (scrollDelta > 4) {
                navHidden = true;
                if (menuOpen) closeMenu();
            }

            lastScrollY = currentScrollY;
            scrollFrame = 0;
        });
    }

    function handlePointerMove(event) {
        if (event.clientY <= 80) navHidden = false;
    }

    function isActive(href) {
        return href === '/' ? pathname === '/' : pathname.startsWith(href);
    }

    async function waitForMenuClose() {
        await tick();

        const collapse = document.querySelector('.navbar-collapse');
        if (!collapse) return;

        await new Promise((resolve) => {
            let settled = false;
            let timer;

            const finish = () => {
                if (settled) return;
                settled = true;
                collapse.removeEventListener('transitionend', onTransitionEnd);
                clearTimeout(timer);
                resolve();
            };

            const onTransitionEnd = (event) => {
                if (event.target === collapse && (event.propertyName === 'grid-template-rows' || event.propertyName === 'visibility')) {
                    finish();
                }
            };

            collapse.addEventListener('transitionend', onTransitionEnd);
            timer = setTimeout(finish, 400);
        });
    }

    onNavigate((navigation) => {
        const wasMenuOpen = menuOpen;

        navHidden = false;
        lastScrollY = window.scrollY;
        if (scrollFrame) {
            window.cancelAnimationFrame(scrollFrame);
            scrollFrame = 0;
        }
        closeMenu();

        if (typeof document === 'undefined' || !document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const startTransition = () => new Promise((resolveTransition) => {
            document.startViewTransition(async () => {
                resolveTransition();
                await navigation.complete;
            });
        });

        if (!wasMenuOpen) {
            return startTransition();
        }

        return (async () => {
            await waitForMenuClose();
            return startTransition();
        })();
    });

</script>

<svelte:head>
    <link rel="alternate" type="text/markdown" href="/llms.txt" title="AnonymousGCA - llms.txt">
    <link rel="alternate" type="text/markdown" href="/llms-full.txt" title="AnonymousGCA - Full text">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">
</svelte:head>

<Seo>
</Seo>

<svelte:window onkeydown={handleKeydown} onscroll={handleScroll} onmousemove={handlePointerMove} />

<a class="skip-link" href="#main-content">Skip to content</a>

<div>
    <header class="container-fluid px-0">
        <nav class="navbar fixed-top navbar-expand-lg navbar-dark px-2 px-md-0 mt-1 mx-1 bg-opacity-50 rounded-5" class:navbar-hidden={navHidden} aria-label="Primary navigation">
            <div class="container-xxl">
                <a class="navbar-brand" href={resolve('/')}>
                    <i class="fas fa-code" aria-hidden="true"></i>
                    <span class="ms-2 neon">AnonymousGCA</span>
                </a>
                <button class="navbar-toggler" type="button" aria-controls="navbarNav"
                        aria-expanded={menuOpen} aria-label="Toggle navigation" onclick={toggleMenu}>
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" class:show={menuOpen} id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" class:active={isActive('/')} href={resolve('/')} aria-current={isActive('/') ? 'page' : undefined}><i class="fas fa-home" aria-hidden="true"></i> Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" class:active={isActive('/contacts')} href={resolve('/contacts')} aria-current={isActive('/contacts') ? 'page' : undefined}><i class="fas fa-address-book" aria-hidden="true"></i> Contacts</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" class:active={isActive('/projects')} href={resolve('/projects')} aria-current={isActive('/projects') ? 'page' : undefined}><i class="fas fa-project-diagram" aria-hidden="true"></i> Projects</a>
                        </li>
                        <li class="nav-item dropdown">
                            <button class="nav-link dropdown-toggle" class:active={isActive('/utility')} type="button"
                                    aria-expanded={utilityOpen} aria-controls="utilityMenu" id="utilityDropdown" onclick={toggleUtility}>
                                <i class="fas fa-toolbox" aria-hidden="true"></i> Utility
                            </button>
                            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end utility-dropdown" class:show={utilityOpen}
                                id="utilityMenu"
                                aria-labelledby="utilityDropdown">
                                <li>
                                    <a class="dropdown-item" href={resolve('/utility/universita')}>
                                        <i class="fas fa-graduation-cap me-2"></i>Università
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href={resolve('/utility/ade')}>
                                        <i class="fas fa-microchip me-2"></i>ADE
                                    </a>
                                </li>
                                <li>
                                    <hr class="dropdown-divider"/>
                                </li>
                                <li>
                                    <a class="dropdown-item" href={resolve('/utility/game')}>
                                        <i class="fas fa-gamepad me-2"></i>Game
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="https://discord.gg/RSp2CSuMny" target="_blank" rel="noopener noreferrer"
                               use:tooltip={{ content: "External Link", placement: 'bottom', theme: primaryTooltipTheme }}>
                                <i class="fas fa-external-link-alt" aria-hidden="true"></i> Discord</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="navbar-spacer" aria-hidden="true"></div>
    </header>

    <main id="main-content" class="container-fluid">
        {@render children?.()}
    </main>

    <div class="container-fluid">
        <AnimatedWave/>
        <footer class="pt-4">
            <div class="container pt-2">
                <div class="row justify-content-evenly text-center text-md-start">
                    <div class="col-lg-6 col-md-12 mb-md-0">
                        <h2 class="h5 text-uppercase">AnonymousGCA</h2>
                        <p>
                            Hi! I'm AnonymousGCA, a web-developer, university student, soccer-robocup programmer and
                            free-time
                            designer/artist.
                        </p>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-md-0">
                        <h2 class="h5 text-uppercase">Links</h2>
                        <ul class="list-unstyled mb-0">
                            <li>
                                <a href="https://github.com/GABRYCA" target="_blank" rel="noopener noreferrer" class="text-light-hover"
                                   use:tooltip={{ content: "Open Github", placement: 'right', theme: primaryTooltipTheme }}>Github</a>
                            </li>
                            <li>
                                <a href="https://discord.gg/RSp2CSuMny" target="_blank" rel="noopener noreferrer" class="text-light-hover"
                                   use:tooltip={{ content: "Join Discord Server", placement: 'right', theme: primaryTooltipTheme }}>Discord</a>
                            </li>
                            <li>
                                <a href="mailto:anonymousgca@anonymousgca.eu" class="text-light-hover"
                                   use:tooltip={{ content: "Send Email", placement: 'right', theme: primaryTooltipTheme }}>Email</a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/gabriele-caretti-046408270/" target="_blank" rel="noopener noreferrer"
                                   class="text-light-hover"
                                   use:tooltip={{ content: "View LinkedIn Profile", placement: 'right', theme: primaryTooltipTheme }}>Linkedin</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <SVGWave
                    data="M0,174L48,174C96,174,192,174,288,183.7C384,193,480,213,576,188.5C672,164,768,97,864,96.7C960,97,1056,164,1152,198.2C1248,232,1344,232,1440,232C1536,232,1632,232,1728,227.2C1824,222,1920,213,2016,212.7C2112,213,2208,222,2304,222.3C2400,222,2496,213,2592,188.5C2688,164,2784,126,2880,125.7C2976,126,3072,164,3168,188.5C3264,213,3360,222,3456,198.2C3552,174,3648,116,3744,91.8C3840,68,3936,77,4032,101.5C4128,126,4224,164,4320,174C4416,184,4512,164,4608,154.7C4704,145,4800,145,4896,140.2C4992,135,5088,126,5184,140.2C5280,155,5376,193,5472,183.7C5568,174,5664,116,5760,120.8C5856,126,5952,193,6048,227.2C6144,261,6240,261,6336,251.3C6432,242,6528,222,6624,188.5C6720,155,6816,106,6864,82.2L6912,58L6912,290L6864,290C6816,290,6720,290,6624,290C6528,290,6432,290,6336,290C6240,290,6144,290,6048,290C5952,290,5856,290,5760,290C5664,290,5568,290,5472,290C5376,290,5280,290,5184,290C5088,290,4992,290,4896,290C4800,290,4704,290,4608,290C4512,290,4416,290,4320,290C4224,290,4128,290,4032,290C3936,290,3840,290,3744,290C3648,290,3552,290,3456,290C3360,290,3264,290,3168,290C3072,290,2976,290,2880,290C2784,290,2688,290,2592,290C2496,290,2400,290,2304,290C2208,290,2112,290,2016,290C1920,290,1824,290,1728,290C1632,290,1536,290,1440,290C1344,290,1248,290,1152,290C1056,290,960,290,864,290C768,290,672,290,576,290C480,290,384,290,288,290C192,290,96,290,48,290L0,290Z"/>
            <div class="row text-center footer-copyright pb-3">
                <div class="col">
                    <p class="h6">&copy; {new Date().getFullYear()} AnonymousGCA</p>
                </div>
            </div>
        </footer>
    </div>
</div>

<style>
    .skip-link {
        z-index: 1100;
    }

    .navbar {
        backdrop-filter: blur(8px);
        background-color: rgba(0, 0, 0, 0.5);
        transition: transform 0.35s var(--ease-out-expo), opacity 0.25s ease;
        will-change: transform, opacity;
        view-transition-name: app-navbar;
    }

    ::view-transition-old(app-navbar),
    ::view-transition-new(app-navbar) {
        animation: none;
        mix-blend-mode: normal;
    }

    .navbar.navbar-hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(calc(-100% - 0.75rem));
    }

    .footer-copyright {
        background-color: rgba(0, 0, 0, 0.25);
    }

    .text-light-hover {
        color: var(--text-color-light);
        text-decoration: none;
        transition: color 0.25s, filter 0.25s;
    }

    .text-light-hover:hover {
        color: var(--primary-color);
        filter: drop-shadow(0 0 0.5rem var(--primary-color));
    }

    .navbar-brand {
        text-shadow: var(--text-shadow);
        transition: color 0.25s, filter 0.25s;
    }

    .navbar-brand:hover {
        filter: drop-shadow(0 0 0.2rem var(--primary-color));
    }

    .nav-link {
        text-shadow: var(--text-shadow);
    }

    .navbar-spacer {
        height: 4.5rem;
    }

    .navbar .nav-link.dropdown-toggle {
        border: 0;
        background: transparent;
    }

    .navbar .nav-link.active,
    .navbar .nav-link.dropdown-toggle[aria-expanded="true"] {
        color: var(--primary-color);
    }

    .nav-link:hover {
        color: var(--primary-color);
        filter: drop-shadow(0 0 0.5rem var(--primary-color));
    }

    .utility-dropdown {
        --bs-dropdown-bg: hsla(281, 100%, 7%, 0.95);
        --bs-dropdown-border-color: var(--border-glow);
        --bs-dropdown-link-color: var(--text-color-light);
        --bs-dropdown-link-hover-color: var(--primary-color);
        --bs-dropdown-link-hover-bg: hsla(287, 100%, 65%, 0.12);
        --bs-dropdown-link-active-color: var(--primary-color);
        --bs-dropdown-link-active-bg: hsla(287, 100%, 65%, 0.18);
        --bs-dropdown-divider-bg: hsla(287, 100%, 65%, 0.25);
        margin-top: 0.4rem;
        border-radius: 0.85rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 12px 28px hsla(280, 100%, 4%, 0.45);
        padding: 0.4rem;
        min-width: 12rem;
    }

    .utility-dropdown .dropdown-item {
        border-radius: 0.55rem;
        padding: 0.55rem 0.85rem;
        font-weight: 500;
        transition: color 0.2s var(--ease-out-expo), background-color 0.2s var(--ease-out-expo), filter 0.2s;
    }

    .utility-dropdown .dropdown-item:hover,
    .utility-dropdown .dropdown-item:focus {
        filter: drop-shadow(0 0 0.35rem var(--primary-color-glow));
    }

    .utility-dropdown .dropdown-item i {
        width: 1.1rem;
        text-align: center;
        opacity: 0.9;
    }

    @keyframes neon {
        0% {
            text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px var(--primary-color), 0 0 35px var(--primary-color), 0 0 40px var(--primary-color), 0 0 50px var(--primary-color);
        }
        100% {
            text-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #fff, 0 0 8px var(--primary-color), 0 0 14px var(--primary-color), 0 0 16px var(--primary-color), 0 0 20px var(--primary-color);
        }
    }

    .neon {
        animation: neon 1.5s ease-in-out infinite alternate;
        transform: translateZ(0);
        will-change: transform, text-shadow;
    }

    @media (max-width: 991.98px) {
        .navbar-collapse.collapse {
            display: grid !important;
            grid-template-rows: 0fr;
            visibility: hidden;
            opacity: 0;
            transition: grid-template-rows 0.35s var(--ease-out-expo), opacity 0.2s ease, visibility 0s linear 0.35s;
        }

        .navbar-collapse.collapse.show {
            grid-template-rows: 1fr;
            visibility: visible;
            opacity: 1;
            transition: grid-template-rows 0.35s var(--ease-out-expo), opacity 0.2s ease;
        }

        .navbar-collapse > .navbar-nav {
            min-height: 0;
            overflow: hidden;
            transform: translateY(-0.75rem);
            transition: transform 0.35s var(--ease-out-expo);
        }

        .navbar-collapse.show > .navbar-nav {
            transform: translateY(0);
        }

        .navbar-nav {
            width: 100%;
            justify-content: center;
            text-align: center;
        }

        .navbar-nav .nav-item {
            width: 100%;
            text-align: center;
        }

        .navbar-nav .nav-link {
            display: block;
            width: 100%;
            text-align: center;
        }

        .navbar-nav .nav-item.dropdown {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .navbar-nav .nav-item.dropdown > .nav-link {
            width: 100%;
            text-align: center;
        }

        .navbar-nav .nav-item.dropdown > .dropdown-toggle::before {
            content: '';
            display: inline-block;
            width: 0.6em;
            margin-right: 0.255em;
            vertical-align: 0.255em;
            visibility: hidden;
        }

        .utility-dropdown {
            text-align: center;
            width: min(100%, 18rem);
            margin-inline: auto;
            position: static !important;
            transform: none !important;
            inset: auto !important;
        }

        .utility-dropdown .dropdown-item {
            text-align: center;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .navbar,
        .navbar-collapse.collapse,
        .navbar-collapse > .navbar-nav {
            transition: none !important;
        }

        .navbar.navbar-hidden {
            transform: translateY(calc(-100% - 0.75rem));
        }

        .navbar-collapse.collapse {
            display: none !important;
        }

        .navbar-collapse.collapse.show {
            display: block !important;
        }

        .navbar-collapse > .navbar-nav,
        .navbar-collapse.show > .navbar-nav {
            transform: none;
        }
    }
</style>
