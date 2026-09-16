<script>
    import {page} from "$app/state";
    import {resolve} from "$app/paths";
    import {onNavigate} from "$app/navigation";
    import {tick} from "svelte";
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
    let scrollProgress = $state(0);
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
        if (event.key === 'Escape') {
            if (utilityOpen) {
                utilityOpen = false;
            } else {
                closeMenu();
            }
        }
    }

    function handleWindowClick(event) {
        if (!utilityOpen) return;
        const target = event.target;
        if (target instanceof HTMLElement && target.closest('#utilityDropdown, #utilityMenu')) return;
        utilityOpen = false;
    }

    function handleScroll() {
        if (scrollFrame) return;

        scrollFrame = window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            scrollProgress = docHeight > 0 ? Math.min(1, Math.max(0, currentScrollY / docHeight)) : 0;

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

<svelte:window onkeydown={handleKeydown} onscroll={handleScroll} onmousemove={handlePointerMove} onclick={handleWindowClick} />

<a class="skip-link" href="#main-content">Skip to content</a>

<div class="scroll-ruler" aria-hidden="true">
    <span class="scroll-ruler__bar" style="transform: scaleX({scrollProgress});"></span>
    <span class="scroll-ruler__tick" style="left: {scrollProgress * 100}%;"></span>
</div>

<div>
    <header class="container-fluid px-0">
        <nav class="navbar fixed-top navbar-expand-lg navbar-dark" class:navbar-hidden={navHidden} aria-label="Primary navigation">
            <div class="container-xxl">
                <a class="navbar-brand" href={resolve('/')}>
                    <span class="brand-mark" aria-hidden="true"></span>
                    <span class="brand-word">AnonymousGCA</span>
                </a>
                <button class="navbar-toggler" type="button" aria-controls="navbarNav"
                        aria-expanded={menuOpen} aria-label="Toggle navigation" onclick={toggleMenu}>
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" class:show={menuOpen} id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" class:active={isActive('/')} href={resolve('/')} aria-current={isActive('/') ? 'page' : undefined}>Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" class:active={isActive('/contacts')} href={resolve('/contacts')} aria-current={isActive('/contacts') ? 'page' : undefined}>Contacts</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" class:active={isActive('/projects')} href={resolve('/projects')} aria-current={isActive('/projects') ? 'page' : undefined}>Projects</a>
                        </li>
                        <li class="nav-item dropdown">
                            <button class="nav-link dropdown-toggle" class:active={isActive('/utility')} type="button"
                                    aria-expanded={utilityOpen} aria-haspopup="true" aria-controls="utilityMenu" id="utilityDropdown" onclick={toggleUtility}>
                                Utility
                            </button>
                            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end utility-dropdown" class:show={utilityOpen}
                                id="utilityMenu"
                                aria-labelledby="utilityDropdown">
                                <li>
                                    <a class="dropdown-item" href={resolve('/utility/universita')}>
                                        <i class="fas fa-graduation-cap me-2" aria-hidden="true"></i>Università
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href={resolve('/utility/ade')}>
                                        <i class="fas fa-microchip me-2" aria-hidden="true"></i>ADE
                                    </a>
                                </li>
                                <li>
                                    <hr class="dropdown-divider"/>
                                </li>
                                <li>
                                    <a class="dropdown-item" href={resolve('/utility/game')}>
                                        <i class="fas fa-gamepad me-2" aria-hidden="true"></i>Game
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link nav-link--external" href="https://discord.gg/RSp2CSuMny" target="_blank" rel="noopener noreferrer"
                               use:tooltip={{ content: "External Link", placement: 'bottom', theme: primaryTooltipTheme }}>
                                Discord<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
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
        <div class="marquee" aria-hidden="true">
            <div class="marquee__track">
                {#each [false, true] as duplicate}
                    <div class="marquee__half" class:marquee__half--duplicate={duplicate} aria-hidden={duplicate}>
                        {#each [0, 1] as copy}
                            <span class="marquee__seq">
                                Open to work <i></i> SvelteKit enthusiast <i></i> University of Insubria <i></i> EU-based
                                developer <i></i> RoboCup programmer <i></i>
                            </span>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
        <footer class="pt-4">
            <div class="container pt-2">
                <div class="row justify-content-evenly text-center text-md-start">
                    <div class="col-lg-6 col-md-12 mb-md-0">
                        <h2 class="h5 footer-heading">AnonymousGCA</h2>
                        <p class="footer-copy">
                            Hi! I'm AnonymousGCA, a full-stack developer, web, mobile, and university student.
                        </p>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-md-0">
                        <h2 class="h5 footer-heading">Links</h2>
                        <ul class="list-unstyled mb-0 footer-links">
                            <li>
                                <a href="https://github.com/GABRYCA" target="_blank" rel="noopener noreferrer"
                                   use:tooltip={{ content: "Open Github", placement: 'right', theme: primaryTooltipTheme }}>Github</a>
                            </li>
                            <li>
                                <a href="https://discord.gg/RSp2CSuMny" target="_blank" rel="noopener noreferrer"
                                   use:tooltip={{ content: "Join Discord Server", placement: 'right', theme: primaryTooltipTheme }}>Discord</a>
                            </li>
                            <li>
                                <a href="mailto:anonymousgca@anonymousgca.eu"
                                   use:tooltip={{ content: "Send Email", placement: 'right', theme: primaryTooltipTheme }}>Email</a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/gabriele-caretti-046408270/" target="_blank" rel="noopener noreferrer"
                                   use:tooltip={{ content: "View LinkedIn Profile", placement: 'right', theme: primaryTooltipTheme }}>Linkedin</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
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

    /* ── Scroll ruler ───────────────────────────────────────── */
    .scroll-ruler {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        z-index: 1200;
        pointer-events: none;
    }

    .scroll-ruler__bar {
        display: block;
        height: 100%;
        background: var(--azure);
        transform-origin: 0 50%;
        will-change: transform;
    }

    .scroll-ruler__tick {
        position: absolute;
        top: 0;
        width: 0.5rem;
        height: 2px;
        margin-left: -0.25rem;
        background: var(--gold);
    }

    /* ── Navbar ─────────────────────────────────────────────── */
    .navbar {
        background-color: rgba(0, 0, 0, 0.94);
        border-bottom: 1px solid var(--line);
        padding-block: 0.35rem;
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

    .navbar-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        font-family: var(--font-display);
        font-variation-settings: 'wdth' 115;
        font-weight: 800;
        font-size: 1.05rem;
        letter-spacing: -0.01em;
        color: var(--ink);
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .navbar-brand:hover {
        color: var(--azure);
    }

    .brand-mark {
        display: inline-block;
        width: 0.65rem;
        height: 0.65rem;
        background: var(--azure);
        transition: background-color 0.2s ease, transform 0.25s var(--ease-out-expo);
    }

    .navbar-brand:hover .brand-mark {
        background: var(--gold);
        transform: rotate(45deg);
    }

    .nav-link {
        position: relative;
        padding: 0.55rem 0.85rem;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-soft);
        background: transparent;
        border: 0;
        transition: color 0.2s ease;
    }

    .nav-link::after {
        content: '';
        position: absolute;
        left: 0.85rem;
        right: 0.85rem;
        bottom: 0.25rem;
        height: 2px;
        background: var(--azure);
        transform: scaleX(0);
        transform-origin: 50% 50%;
        transition: transform 0.3s var(--ease-out-expo);
    }

    /* Neutralize Bootstrap's caret triangle on the Utility toggle:
       the design language uses the underline instead. */
    .nav-link.dropdown-toggle::after {
        border: 0;
        margin: 0;
        padding: 0;
        vertical-align: baseline;
    }

    .nav-link:hover,
    .nav-link:focus-visible {
        color: var(--ink);
    }

    .nav-link:hover::after,
    .nav-link:focus-visible::after {
        transform: scaleX(1);
    }

    .navbar .nav-link.active,
    .navbar .nav-link.dropdown-toggle[aria-expanded="true"] {
        color: var(--ink);
    }

    .navbar .nav-link.active::after,
    .navbar .nav-link.dropdown-toggle[aria-expanded="true"]::after {
        transform: scaleX(1);
    }

    .nav-link--external {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
    }

    .nav-link--external i {
        font-size: 0.62rem;
        color: var(--gold);
    }

    .navbar-spacer {
        height: 3.6rem;
    }

    .utility-dropdown {
        --bs-dropdown-bg: rgba(4, 6, 10, 0.98);
        --bs-dropdown-border-color: var(--line);
        --bs-dropdown-border-radius: var(--radius-card);
        --bs-dropdown-link-color: var(--ink-soft);
        --bs-dropdown-link-hover-color: var(--ink);
        --bs-dropdown-link-hover-bg: var(--azure-soft);
        --bs-dropdown-link-active-color: #000;
        --bs-dropdown-link-active-bg: var(--azure);
        --bs-dropdown-divider-bg: var(--line);
        margin-top: 0.55rem;
        border-radius: var(--radius-card);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.7);
        padding: 0.35rem;
        min-width: 12.5rem;
    }

    .utility-dropdown .dropdown-item {
        border-radius: 0.15rem;
        padding: 0.6rem 0.85rem;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.15s ease, background-color 0.15s ease;
    }

    .utility-dropdown .dropdown-item i {
        width: 1.1rem;
        text-align: center;
        color: var(--azure);
    }

    .utility-dropdown .dropdown-item:hover i,
    .utility-dropdown .dropdown-item:focus i {
        color: inherit;
    }

    /* ── Marquee ────────────────────────────────────────────── */
    .marquee {
        overflow: hidden;
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        background: var(--bg);
        padding-block: 0.7rem;
    }

    .marquee__track {
        display: flex;
        width: max-content;
        animation: marquee 32s linear infinite;
    }

    .marquee:hover .marquee__track {
        animation-play-state: paused;
    }

    /* Each half is at least one viewport wide, so the -50% loop point
       is always seamless — on ultrawide and narrow screens alike. */
    .marquee__half {
        display: inline-flex;
        align-items: center;
        justify-content: space-evenly;
        gap: 0.9rem;
        width: max-content;
        min-width: 100vw;
        flex-shrink: 0;
    }

    .marquee__seq {
        display: inline-flex;
        align-items: center;
        gap: 0.9rem;
        padding-right: 0.9rem;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--ink-soft);
        white-space: nowrap;
    }

    .marquee__seq i {
        display: inline-block;
        width: 0.42rem;
        height: 0.42rem;
        background: var(--gold);
        flex-shrink: 0;
    }

    @keyframes marquee {
        to {
            transform: translateX(-50%);
        }
    }

    /* ── Footer ─────────────────────────────────────────────── */
    .footer-heading {
        font-family: var(--font-family-sans-serif);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--ink-faint);
    }

    .footer-copy {
        color: var(--ink-soft);
        max-width: 42rem;
    }

    .footer-links li + li {
        margin-top: 0.35rem;
    }

    .footer-links a {
        color: var(--ink);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: color 0.2s ease, border-color 0.2s ease;
    }

    .footer-links a:hover,
    .footer-links a:focus-visible {
        color: var(--azure);
        border-color: var(--azure);
    }

    .footer-copyright {
        margin-top: 1.5rem;
        border-top: 1px solid var(--line);
        padding-top: 0.75rem;
        color: var(--ink-faint);
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

        .navbar-nav .nav-link::after {
            left: 50%;
            right: auto;
            width: 2.5rem;
            margin-left: -1.25rem;
            transform-origin: 50% 50%;
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

        .nav-link--external {
            display: flex;
            justify-content: center;
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
        .navbar-collapse > .navbar-nav,
        .nav-link::after,
        .marquee__track {
            transition: none !important;
            animation: none !important;
        }

        /* Keep the band readable as a single static centered line. */
        .marquee__track {
            width: auto;
            justify-content: center;
        }

        .marquee__half {
            min-width: 0;
            justify-content: center;
            flex-wrap: wrap;
        }

        .marquee__half--duplicate {
            display: none;
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
