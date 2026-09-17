<script>
    import Skill from "$lib/components/Skill.svelte";
    import CircularLink from "$lib/components/CircularLink.svelte";
    import RuleBand from "$lib/components/RuleBand.svelte";
    import favicon from "$lib/images/favicon.webp";
    import {resolve} from "$app/paths";
    import {scrollAnimation} from "$lib/actions/scrollAnimation.js";
</script>

<div class="home-page">
    <section class="home-hero row justify-content-center align-items-center pb-5 pb-md-0" aria-labelledby="home-title">
        <div class="col-12 col-lg-5 portrait-col" use:scrollAnimation={{ animation: 'ink-up', duration: 900 }}>
            <figure class="portrait-plate">
                <img src={favicon} alt="Illustrated portrait of AnonymousGCA" width="460" height="460"
                     fetchpriority="high" decoding="async"/>
                <span class="portrait-plate__wash" aria-hidden="true"></span>
            </figure>
        </div>
        <div class="col-12 col-lg-7 text-center text-lg-start ps-lg-5">
            <h1 class="home-hero__title" id="home-title">
                <span class="kinetic-line"><span class="kinetic-word" style="--i: 0;">Hi! I'm</span></span>
                <span class="kinetic-line"><span class="kinetic-word animate-text" style="--i: 1;">AnonymousGCA</span></span>
            </h1>
            <p class="home-hero__lead" use:scrollAnimation={{ animation: 'fade-up', duration: 700, delay: 250 }}>
                Full-Stack developer, university student, and SvelteKit enthusiast.
            </p>
            <div class="home-hero__actions" aria-label="Homepage actions"
                 use:scrollAnimation={{ animation: 'fade-up', duration: 700, delay: 380 }}>
                <a class="home-hero__action home-hero__action--primary" href={resolve('/projects')}>Explore my projects</a>
                <a class="home-hero__action" href={resolve('/contacts')}>Get in touch</a>
            </div>
        </div>
    </section>

    <RuleBand/>

    <section class="home-section home-band" aria-labelledby="skills-title"
             use:scrollAnimation={{ animation: 'fade-up', duration: 400 }}>
        <div class="section-head container">
            <h2 class="section-head__title" id="skills-title">I am:</h2>
            <span class="section-head__rule" aria-hidden="true"></span>
        </div>

        <div class="container">
            <div class="row justify-content-around gy-4 px-2 px-md-0">
                <Skill title="A Mobile Developer" icon="fas fa-code"/>
                <Skill title="A Full-Stack Developer" icon="fas fa-layer-group"/>
                <Skill title="A SvelteKit Enthusiast" icon="fas fa-bolt"/>
                <Skill title="A University Student" icon="fas fa-graduation-cap"/>
            </div>
        </div>
    </section>

    <section class="home-section home-band" aria-labelledby="contact-title">
        <div class="section-head container">
            <h2 class="section-head__title" id="contact-title">Contact me:</h2>
            <span class="section-head__rule" aria-hidden="true"></span>
        </div>
        <div class="container">
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

    <section class="home-section home-band" aria-labelledby="social-title">
        <div class="section-head container">
            <h2 class="section-head__title" id="social-title">Socials and Development:</h2>
            <span class="section-head__rule" aria-hidden="true"></span>
        </div>
        <div class="container">
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

<style>
    .portrait-col {
        display: flex;
        justify-content: center;
    }

    .portrait-plate {
        position: relative;
        width: min(21rem, 72vw);
        margin: 0;
        isolation: isolate;
    }

    .portrait-plate img {
        display: block;
        width: 100%;
        height: auto;
        border: 1px solid var(--line);
        filter: grayscale(1) contrast(1.08);
        transition: filter 0.5s ease;
    }

    .portrait-plate__wash {
        position: absolute;
        inset: 1px;
        background: var(--azure);
        mix-blend-mode: color;
        opacity: 0.88;
        pointer-events: none;
        transition: opacity 0.5s ease;
    }

    .portrait-plate::before {
        content: '';
        position: absolute;
        inset: 0.85rem -0.85rem -0.85rem 0.85rem;
        border: 1px solid var(--azure-line);
        z-index: -1;
        transition: transform 0.45s var(--ease-out-expo), border-color 0.45s ease;
    }

    .portrait-plate::after {
        content: '';
        position: absolute;
        left: -0.4rem;
        top: -0.4rem;
        width: 0.85rem;
        height: 0.85rem;
        background: var(--gold);
    }

    .portrait-plate:hover img {
        filter: grayscale(0) contrast(1);
    }

    .portrait-plate:hover .portrait-plate__wash {
        opacity: 0;
    }

    .portrait-plate:hover::before {
        transform: translate(0.35rem, 0.35rem);
        border-color: var(--gold-line);
    }

    .kinetic-line {
        display: block;
        overflow: hidden;
    }

    .kinetic-word {
        display: inline-block;
        transform: translateY(110%);
        animation: kinetic-in 0.85s var(--ease-out-expo) both;
        animation-delay: calc(var(--i) * 110ms + 80ms);
    }

    @keyframes kinetic-in {
        to {
            transform: translateY(0);
        }
    }

    .section-head {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-bottom: 2rem;
        min-width: 0;
    }

    .section-head__title {
        margin: 0;
        min-width: 0;
        max-width: 100%;
        font-size: clamp(1.6rem, 3.4vw, 2.5rem);
        font-weight: 800;
        font-variation-settings: 'wdth' 115;
        text-transform: uppercase;
        letter-spacing: -0.025em;
        color: var(--ink);
        white-space: nowrap;
    }

    .section-head__rule {
        flex: 1;
        height: 1px;
        background: var(--line);
    }

    .home-page {
        overflow-x: hidden;
        overflow-x: clip;
    }

    .home-band {
        padding-block: clamp(2rem, 5vw, 4rem);
        background: var(--surface);
        border-block: 1px solid var(--line);
        overflow-x: hidden;
        overflow-x: clip;
    }

    .home-band + .home-band {
        border-top: 0;
    }

    @media (max-width: 991.98px) {
        .home-hero {
            /* Breathing room between the fixed navbar and the portrait
               on stacked (mobile/tablet) layouts. Desktop is unaffected:
               there the hero is vertically centered by align-items. */
            padding-top: clamp(1.5rem, 6vw, 2.5rem);
        }

        .portrait-plate {
            width: min(17rem, 62vw);
            margin-bottom: 2.5rem;
        }

        .section-head {
            justify-content: center;
        }

        .section-head__title {
            white-space: normal;
            text-align: center;
            text-wrap: balance;
            overflow-wrap: break-word;
        }

        .section-head__rule {
            display: none;
        }
    }

    @media (max-width: 575.98px) {
        .section-head__title {
            font-size: clamp(1.35rem, 7vw, 1.6rem);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .kinetic-word {
            transform: none;
            animation: none;
        }

        .portrait-plate img,
        .portrait-plate__wash,
        .portrait-plate::before {
            transition: none;
        }
    }
</style>
