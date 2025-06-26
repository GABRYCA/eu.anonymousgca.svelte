<script>
    import {onMount} from "svelte";
    import AOS from 'aos';
    import SVGWave from "$lib/components/SVGWave.svelte";
    import AnimatedWave from "$lib/components/AnimatedWave.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import 'bootstrap/dist/css/bootstrap.min.css';
    import scriptSrc from 'bootstrap/dist/js/bootstrap.bundle.min.js?url';
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import 'aos/dist/aos.css';
    import 'aos/dist/aos.js';
    import '$lib/style/style.css';


    /** @type {{children?: import('svelte').Snippet}} */
    let {children} = $props();

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
</script>

<Seo>
    <!-- JS -->
    <script src={scriptSrc}></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/4.0.0-beta.2/jquery.min.js"
            integrity="sha512-JobWAqYk5CSjWuVV3mxgS+MmccJqkrBaDhk8SKS1BW+71dJ9gzascwzW85UwGhxiSyR7Pxhu50k+Nl3+o5I49A=="
            crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</Seo>

<div style="overflow-x: hidden">
    <div class="container-fluid px-0">
        <nav class="navbar fixed-top navbar-expand-lg navbar-dark px-2 px-md-0 mt-1 mx-1 bg-opacity-50 rounded-5">
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
                            <a class="nav-link" href="/contacts"><i class="fas fa-address-book"></i> Contacts</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/projects"><i class="fas fa-project-diagram"></i> Projects</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/utility/universita"><i class="fas fa-graduation-cap"></i>
                                Università</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="https://discord.gg/RSp2CSuMny" target="_blank"
                               data-bs-toggle="tooltip" data-bs-placement="bottom" title="External Link"><i
                                    class="fas fa-external-link-alt"></i> Discord</a>
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
    </div>

    <div class="container-fluid">
        {@render children?.()}
    </div>

    <div class="container-fluid">
        <AnimatedWave/>
        <footer class="pt-4">
            <div class="container pt-2">
                <div class="row justify-content-evenly text-center text-md-start">
                    <div class="col-lg-6 col-md-12 mb-md-0">
                        <h5 class="text-uppercase">AnonymousGCA</h5>
                        <p>
                            Hi! I'm AnonymousGCA, a web-developer, university student, soccer-robocup programmer and
                            free-time
                            designer/artist.
                        </p>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-md-0">
                        <h5 class="text-uppercase">Links</h5>
                        <ul class="list-unstyled mb-0">
                            <li>
                                <a href="https://github.com/GABRYCA" target="_blank" class="text-light-hover"
                                   data-bs-toggle="tooltip" data-bs-placement="right" title="Open">Github</a>
                            </li>
                            <li>
                                <a href="https://discord.gg/RSp2CSuMny" target="_blank" class="text-light-hover"
                                   data-bs-toggle="tooltip" data-bs-placement="right" title="Open">Discord</a>
                            </li>
                            <li>
                                <a href="mailto:anonymousgca@anonymousgca.eu" class="text-light-hover"
                                   data-bs-toggle="tooltip"
                                   data-bs-placement="right" title="Open">Email</a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/gabriele-caretti-046408270/" target="_blank"
                                   class="text-light-hover" data-bs-toggle="tooltip" data-bs-placement="right"
                                   title="Open">Linkedin</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <SVGWave
                    data="M0,174L48,174C96,174,192,174,288,183.7C384,193,480,213,576,188.5C672,164,768,97,864,96.7C960,97,1056,164,1152,198.2C1248,232,1344,232,1440,232C1536,232,1632,232,1728,227.2C1824,222,1920,213,2016,212.7C2112,213,2208,222,2304,222.3C2400,222,2496,213,2592,188.5C2688,164,2784,126,2880,125.7C2976,126,3072,164,3168,188.5C3264,213,3360,222,3456,198.2C3552,174,3648,116,3744,91.8C3840,68,3936,77,4032,101.5C4128,126,4224,164,4320,174C4416,184,4512,164,4608,154.7C4704,145,4800,145,4896,140.2C4992,135,5088,126,5184,140.2C5280,155,5376,193,5472,183.7C5568,174,5664,116,5760,120.8C5856,126,5952,193,6048,227.2C6144,261,6240,261,6336,251.3C6432,242,6528,222,6624,188.5C6720,155,6816,106,6864,82.2L6912,58L6912,290L6864,290C6816,290,6720,290,6624,290C6528,290,6432,290,6336,290C6240,290,6144,290,6048,290C5952,290,5856,290,5760,290C5664,290,5568,290,5472,290C5376,290,5280,290,5184,290C5088,290,4992,290,4896,290C4800,290,4704,290,4608,290C4512,290,4416,290,4320,290C4224,290,4128,290,4032,290C3936,290,3840,290,3744,290C3648,290,3552,290,3456,290C3360,290,3264,290,3168,290C3072,290,2976,290,2880,290C2784,290,2688,290,2592,290C2496,290,2400,290,2304,290C2208,290,2112,290,2016,290C1920,290,1824,290,1728,290C1632,290,1536,290,1440,290C1344,290,1248,290,1152,290C1056,290,960,290,864,290C768,290,672,290,576,290C480,290,384,290,288,290C192,290,96,290,48,290L0,290Z"/>
            <div class="row text-center footer-copyright pb-3">
                <div class="col">
                    <p class="h6">© {new Date().getFullYear()} AnonymousGCA</p>
                </div>
            </div>
        </footer>
    </div>
</div>

<style>
    .navbar {
        backdrop-filter: blur(8px);
        background-color: rgba(0, 0, 0, 0.5);
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

    .nav-link:hover {
        color: var(--primary-color);
        filter: drop-shadow(0 0 0.5rem var(--primary-color));
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