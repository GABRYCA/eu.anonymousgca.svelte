<script>
    import {onMount} from "svelte";
    import Skill from "$lib/components/Skill.svelte";
    import CircularLink from "$lib/components/CircularLink.svelte";
    import SVGWave from "$lib/components/SVGWave.svelte";
    import favicon from "$lib/images/favicon.webp";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<!-- Image logo from img/logo.png -->
<div class="row justify-content-center align-items-center pb-5 pb-md-0 bg-black bg-opacity-25">
    <div class="col-12 col-lg-6 text-center pe-lg-0">
        <img src={favicon} class="img-fluid p-5 custom-shadow" style="max-height: 75vh;" alt="AnonymousGCA Logo" data-aos="fade-down" data-aos-duration="1500"/>
    </div>
    <div class="col-12 col-lg-6 text-center ps-lg-0">
        <p class="h1" id="text-glitched-effect" data-aos="slide-left" data-aos-duration="1500">Hi! I'm
            <b class="animate-text text-uppercase">AnonymousGCA!</b></p>
    </div>
</div>

<SVGWave rotation="180" data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z" />

<!-- Skills section -->
<!-- I am title -->
<div class="row mb-3 mb-md-5 pt-2 pb-2">
    <div class="col">
        <p class="h1 text-center animate-text fw-normal">I am:</p>
    </div>
</div>

<!-- Skills -->
<div class="row justify-content-around gy-4 px-2 px-md-0">
    <Skill title="A Web-Developer ✨" icon="fas fa-code"/>
    <Skill title="A Web-Designer 📏" icon="fas fa-layer-group"/>
    <Skill title="A SvelteKit Enthusiast 🚀" icon="fas fa-server"/>
    <Skill title="A University Student 🎓" icon="fas fa-graduation-cap"/>
</div>


<!-- Contacts section -->
<SVGWave data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z" />

<div class="row bg-black bg-opacity-25 pb-5 pt-5">
    <div class="col-12 mb-4">
        <p class="h1 text-center animate-text fw-normal">Contact me:</p>
    </div>
    <div class="col-12 mb-2">
        <div class="row justify-content-center text-center mt-4" data-aos="zoom-in" data-aos-duration="600">
            <CircularLink link="https://discord.gg/RSp2CSuMny" icon="fab fa-discord" title="Open Discord"/>
            <CircularLink link="https://www.linkedin.com/in/gabriele-caretti-046408270/" icon="fab fa-linkedin"
                          title="Open Linkedin"/>
            <CircularLink link="mailto:anonymousgca@anonymousgca.eu" icon="fas fa-envelope"
                          title="Send Email"/>
        </div>
    </div>
</div>

<SVGWave rotation="180" data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z" />

<!-- Socials section -->

<div class="row mt-3 mt-md-0">
    <div class="col-12 mb-4">
        <p class="h1 text-center animate-text fw-normal">Socials and Development:</p>
    </div>
    <div class="col-12">
        <div class="row justify-content-center text-center mt-4" data-aos="zoom-in" data-aos-duration="600">
            <CircularLink link="https://github.com/GABRYCA" icon="fab fa-github" title="Open Github"/>
            <CircularLink link="https://www.youtube.com/channel/UCJgmoEFd6b9oOj2OvafuezQ" icon="fab fa-youtube"
                          title="Open Youtube"/>
            <CircularLink link="https://ud.me/anonymousgca.crypto" icon="fas fa-globe" title="Open UD - Crypto - Web3"/>
            <CircularLink link="https://www.reddit.com/u/AnonymousGCA" icon="fab fa-reddit"
                          title="Open Reddit"/>
        </div>
    </div>
</div>

<style>
    .animate-text {
        background-image: linear-gradient(
                -225deg,
                #d34cff 0%,
                #ff3c38 29%,
                #ff8c42 67%,
                #d34cff 100%
        );
        background-size: 200% auto;
        color: #fff;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: textclip 5s linear infinite;
        transform: translateZ(0);
        will-change: transform, background-position;
    }

    .custom-shadow {
        filter: drop-shadow(0 0 0.5rem #d34cff);
        animation: shadow 3s infinite;
    }

    @keyframes shadow {
        0% {
            filter: drop-shadow(0 0 0.5rem #d34cff);
        }

        50% {
            filter: drop-shadow(0 0 0.5rem #ff2b2b);
        }

        100% {
            filter: drop-shadow(0 0 0.5rem #d34cff);
        }
    }

    @keyframes textclip {
        to {
            background-position: 200% center;
        }
    }

    @keyframes aitf {
        0% {
            background-position: 0% 50%;
        }
        100% {
            background-position: 100% 50%;
        }
    }

    @keyframes lights {
        0% {
            color: hsl(230, 40%, 80%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.2),
            0 0 0.125em hsla(320, 100%, 60%, 0.3),
            -1em -0.125em 0.5em hsla(40, 100%, 60%, 0),
            1em 0.125em 0.5em hsla(200, 100%, 60%, 0);
        }
        30% {
            color: hsl(230, 80%, 90%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 60%, 0.5),
            -0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2),
            0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4);
        }
        40% {
            color: hsl(230, 100%, 95%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 90%, 0.5),
            -0.25em -0.125em 0.125em hsla(40, 100%, 60%, 0.2),
            0.25em 0.125em 0.125em hsla(200, 100%, 60%, 0.4);
        }
        70% {
            color: hsl(230, 80%, 90%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 60%, 0.5),
            0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2),
            -0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4);
        }
        100% {
            color: hsl(230, 40%, 80%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.2),
            0 0 0.125em hsla(320, 100%, 60%, 0.3),
            1em -0.125em 0.5em hsla(40, 100%, 60%, 0),
            -1em 0.125em 0.5em hsla(200, 100%, 60%, 0);
        }
    }
</style>