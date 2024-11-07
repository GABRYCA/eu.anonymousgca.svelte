<script>
    import {onMount} from "svelte";
    import AOS from 'aos';
    import SVGWave from "$lib/components/SVGWave.svelte";
    import favicon from "$lib/images/favicon.webp";
    import AnimatedWave from "$lib/components/AnimatedWave.svelte";
    import Seo from "sk-seo";
    import { page } from "$app/stores";
    /** @type {{children?: import('svelte').Snippet}} */
    let { children } = $props();

    onMount(() => {
        // Close navbar when open another page, with animation
        document.querySelectorAll('.nav-link').forEach((element) => {
            element.addEventListener('click', () => {
                document.querySelector('.navbar-collapse').classList.remove('show');
            });
        });

        window.$('[data-bs-toggle="tooltip"]').tooltip();

        // Init AOS
        AOS.init({
            once: true,
        });
        window.AOS = AOS;
    });

    export function handlePageChange() {
        if (window.AOS) {
            window.AOS.refresh();
        }
    }

    // Automatically update footer year
    const currentYear = new Date().getFullYear();
</script>

<Seo
        title={$page.data.title ?? "AnonymousGCA's Website"}
        description={$page.data.description ?? "AnonymousGCA - Web Developer, University Student, SvelteKit enthusiast, Soccer-Robocup programmer, Free-Time Designer-Artist"}
        siteName={$page.data.siteName ?? "AnonymousGCA"}
        imageURL={$page.data.imageURL ?? favicon}
        logo={$page.data.logo ?? favicon}
        author={$page.data.author ?? "AnonymousGCA"}
        name={$page.data.name ?? "AnonymousGCA"}
        schemaOrg={$page.data.schemaOrg ?? "true"}
        twitter={$page.data.twitter ?? "true"}
        index={$page.data.index ?? "true"}
        canonical={$page.data.canonical ?? "https://anonymousgca.eu/"}
        keywords={$page.data.keywords ?? "AnonymousGCA, Developer, Designer, Web Development, Svelte, SvelteKit, University Student"}
/>

<svelte:head>
    <link rel="icon" href={favicon} type="image/webp">
</svelte:head>

<nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-black px-2 px-md-0 mt-1 mx-1 bg-opacity-50 rounded-5" style="backdrop-filter: blur(8px);">
    <div class="container-xxl">
        <a class="navbar-brand" href="/">
            <i class="fas fa-code"></i>
            <span class="ms-2 neon">AnonymousGCA</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/"><i class="fas fa-home"></i> Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="contacts"><i class="fas fa-address-book"></i> Contacts</a>
                </li>
                <!--<li class="nav-item">
                    <a class="nav-link" href="passive_income"><i class="fas fa-money-bill-wave"></i> Passive Income</a>
                </li>-->
                <!--<li class="nav-item">
                    <a class="nav-link" href="collection"><i class="fa-brands fa-raspberry-pi"></i> Pi</a>
                </li>
                -->
                <li class="nav-item">
                    <a class="nav-link" href="projects"><i class="fas fa-project-diagram"></i> Projects</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://discord.gg/RSp2CSuMny" target="_blank" data-bs-toggle="tooltip" data-bs-placement="bottom" title="External Link"><i class="fas fa-external-link-alt"></i> Discord</a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<nav class="navbar bg-black bg-opacity-10" style="color: transparent !important;">
    <div class="container-xxl">
        <a class="navbar-brand" href="/" aria-label="Homepage">
            <span class="ms-2"></span>
        </a>
    </div>
</nav>

{@render children?.()}

<AnimatedWave />

<footer class="text-light pt-4">
    <div class="container pt-2">
        <div class="row justify-content-evenly text-center text-md-start">
            <div class="col-lg-6 col-md-12 mb-md-0">
                <h5 class="text-uppercase">AnonymousGCA</h5>
                <p>
                    Hi! I'm AnonymousGCA, a web-developer, university student, soccer-robocup programmer and free-time
                    designer/artist.
                </p>
            </div>
            <div class="col-lg-3 col-md-6 mb-md-0">
                <h5 class="text-uppercase">Links</h5>
                <ul class="list-unstyled mb-0">
                    <li>
                        <a href="https://github.com/GABRYCA" target="_blank" class="text-light" data-bs-toggle="tooltip" data-bs-placement="right" title="Open">Github</a>
                    </li>
                    <li>
                        <a href="https://discord.gg/RSp2CSuMny" target="_blank" class="text-light" data-bs-toggle="tooltip" data-bs-placement="right" title="Open">Discord</a>
                    </li>
                    <li>
                        <a href="mailto:anonymousgca@anonymousgca.eu" class="text-light" data-bs-toggle="tooltip" data-bs-placement="right" title="Open">Email</a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/in/gabriele-caretti-046408270/" target="_blank" class="text-light" data-bs-toggle="tooltip" data-bs-placement="right" title="Open">Linkedin</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <SVGWave data="M0,174L48,174C96,174,192,174,288,183.7C384,193,480,213,576,188.5C672,164,768,97,864,96.7C960,97,1056,164,1152,198.2C1248,232,1344,232,1440,232C1536,232,1632,232,1728,227.2C1824,222,1920,213,2016,212.7C2112,213,2208,222,2304,222.3C2400,222,2496,213,2592,188.5C2688,164,2784,126,2880,125.7C2976,126,3072,164,3168,188.5C3264,213,3360,222,3456,198.2C3552,174,3648,116,3744,91.8C3840,68,3936,77,4032,101.5C4128,126,4224,164,4320,174C4416,184,4512,164,4608,154.7C4704,145,4800,145,4896,140.2C4992,135,5088,126,5184,140.2C5280,155,5376,193,5472,183.7C5568,174,5664,116,5760,120.8C5856,126,5952,193,6048,227.2C6144,261,6240,261,6336,251.3C6432,242,6528,222,6624,188.5C6720,155,6816,106,6864,82.2L6912,58L6912,290L6864,290C6816,290,6720,290,6624,290C6528,290,6432,290,6336,290C6240,290,6144,290,6048,290C5952,290,5856,290,5760,290C5664,290,5568,290,5472,290C5376,290,5280,290,5184,290C5088,290,4992,290,4896,290C4800,290,4704,290,4608,290C4512,290,4416,290,4320,290C4224,290,4128,290,4032,290C3936,290,3840,290,3744,290C3648,290,3552,290,3456,290C3360,290,3264,290,3168,290C3072,290,2976,290,2880,290C2784,290,2688,290,2592,290C2496,290,2400,290,2304,290C2208,290,2112,290,2016,290C1920,290,1824,290,1728,290C1632,290,1536,290,1440,290C1344,290,1248,290,1152,290C1056,290,960,290,864,290C768,290,672,290,576,290C480,290,384,290,288,290C192,290,96,290,48,290L0,290Z" />
    <div class="row text-center bg-black bg-opacity-25 pb-3">
        <div class="col">
            <p class="h6">© {currentYear} AnonymousGCA</p>
        </div>
    </div>
</footer>

<style>

    /* Global font for all kind of texts on all pages (must be in row to work, just a workaround) */
    /*:global(.row, slot, nav, footer, .container, .container-fluid){
        font-family: 'Roboto', sans-serif !important;
    }*/

    .navbar-brand {
        text-shadow: 2px 2px #000;
        transition: color 0.25s, filter 0.25s;
    }

    .navbar-brand:hover {
        filter: drop-shadow(0 0 0.2rem #d34cff);
    }

    .nav-link {
        text-shadow: 2px 2px #000;
    }

    .nav-link:hover {
        color: #d34cff;
        filter: drop-shadow(0 0 0.5rem #d34cff);
    }

    @keyframes neon {
        0% {
            text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #d34cff, 0 0 35px #d34cff, 0 0 40px #d34cff, 0 0 50px #d34cff;
        }
        100% {
            text-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #fff, 0 0 8px #d34cff, 0 0 14px #d34cff, 0 0 16px #d34cff, 0 0 20px #d34cff;
        }
    }

    .neon {
        animation: neon 1.5s ease-in-out infinite alternate;
        transform: translateZ(0);
        will-change: transform, text-shadow;
    }

    @media (max-width: 990px) {
        .navbar-nav {
            width: 100%;
            justify-content: center;
        }

        .nav-link {
            text-align: center;
        }
    }
</style>