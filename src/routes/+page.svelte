<script>
    import Skill from "$lib/components/Skill.svelte";
    import CircularLink from "$lib/components/CircularLink.svelte";
    import SVGWave from "$lib/components/SVGWave.svelte";
    import favicon from "$lib/images/favicon.webp";
    import {resolve} from "$app/paths";
    import {scrollAnimation} from "$lib/actions/scrollAnimation.js";
</script>

<div class="home-page">
    <section class="home-hero row justify-content-center align-items-center pb-5 pb-md-0 bg-black bg-opacity-25" aria-labelledby="home-title">
        <div class="col-12 col-lg-6 text-center pe-lg-0">
            <img src={favicon} class="img-fluid p-5 rounded-circle custom-shadow" style="max-height: 75vh;"
                 width="460" height="460" alt="AnonymousGCA logo" fetchpriority="high" decoding="async"
                 use:scrollAnimation={{ animation: 'fade-down', duration: 1500 }}/>
        </div>
        <div class="col-12 col-lg-6 text-center text-lg-start ps-lg-0">
            <h1 class="home-hero__title" id="home-title" use:scrollAnimation={{ animation: 'slide-left', duration: 800 }}>
                Hi! I'm <span class="animate-text">AnonymousGCA!</span>
            </h1>
            <p class="home-hero__lead">Web developer, designer, university student, and SvelteKit enthusiast.</p>
            <div class="home-hero__actions" aria-label="Homepage actions">
                <a class="home-hero__action home-hero__action--primary" href={resolve('/projects')}>Explore my projects</a>
                <a class="home-hero__action" href={resolve('/contacts')}>Get in touch</a>
            </div>
        </div>
    </section>

    <SVGWave rotation="180"
             data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z"/>

    <section class="home-section" aria-labelledby="skills-title">
    <div class="row mb-3 mb-md-5 pt-2 pb-2">
        <div class="col">
            <h2 class="h1 text-center animate-text fw-normal" id="skills-title">I am:</h2>
        </div>
    </div>

    <!-- Skills -->
    <div class="container">
        <div class="row justify-content-around gy-4 px-2 px-md-0">
            <Skill title="A Web Developer" icon="fas fa-code"/>
            <Skill title="A Web Designer" icon="fas fa-layer-group"/>
            <Skill title="A SvelteKit Enthusiast" icon="fas fa-server"/>
            <Skill title="A University Student" icon="fas fa-graduation-cap"/>
        </div>
    </div>
    </section>


    <!-- Contacts section -->
    <SVGWave
            data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z"/>

    <section class="home-section row bg-black bg-opacity-25 pb-5 pt-5" aria-labelledby="contact-title">
        <div class="col-12 mb-4">
            <h2 class="h1 text-center animate-text fw-normal" id="contact-title">Contact me:</h2>
        </div>
        <div class="col-12 mb-2">
            <div class="row justify-content-center text-center mt-4"
                 use:scrollAnimation={{ animation: 'zoom-in', duration: 350 }}>
                <CircularLink link="https://discord.gg/RSp2CSuMny" icon="fab fa-discord" title="Open Discord"/>
                <CircularLink link="https://www.linkedin.com/in/gabriele-caretti-046408270/" icon="fab fa-linkedin"
                              title="Open Linkedin"/>
                <CircularLink link="mailto:anonymousgca@anonymousgca.eu" icon="fas fa-envelope"
                              title="Send Email"/>
            </div>
        </div>
    </section>

    <SVGWave rotation="180"
             data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z"/>

    <!-- Socials section -->

    <section class="home-section row mt-3 mt-md-0" aria-labelledby="social-title">
        <div class="col-12 mb-4">
            <h2 class="h1 text-center animate-text fw-normal" id="social-title">Socials and Development:</h2>
        </div>
        <div class="col-12">
            <div class="row justify-content-center text-center mt-4"
                 use:scrollAnimation={{ animation: 'zoom-in', duration: 350 }}>
                <CircularLink link="https://github.com/GABRYCA" icon="fab fa-github" title="Open Github"/>
                <CircularLink link="https://www.youtube.com/channel/UCJgmoEFd6b9oOj2OvafuezQ" icon="fab fa-youtube"
                              title="Open Youtube"/>
                <CircularLink link="https://ud.me/anonymousgca.crypto" icon="fas fa-globe"
                              title="Open UD - Crypto - Web3"/>
                <CircularLink link="https://www.reddit.com/u/AnonymousGCA" icon="fab fa-reddit"
                              title="Open Reddit"/>
            </div>
        </div>
    </section>
</div>
