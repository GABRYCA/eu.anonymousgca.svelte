<script>
    import ContactCard from "$lib/components/ContactCard.svelte";
    import {scrollAnimation} from "$lib/actions/scrollAnimation.js";

    const professional = [
        {
            title: "Email",
            description: "Best for opportunities, collaborations, and direct messages.",
            icon: "fas fa-envelope",
            link: "mailto:anonymousgca@anonymousgca.eu",
            aos_delay: 80,
            cta: "Write me"
        },
        {
            title: "LinkedIn",
            description: "Professional profile, experience, and network.",
            icon: "fab fa-linkedin",
            link: "https://www.linkedin.com/in/gabriele-caretti-046408270/",
            aos_delay: 140,
            cta: "Connect"
        },
        {
            title: "GitHub",
            description: "Repositories, experiments, and open-source work.",
            icon: "fab fa-github",
            link: "https://github.com/GABRYCA",
            aos_delay: 200,
            cta: "View code"
        }
    ];

    const social = [
        {
            title: "Discord",
            description: "Chat, community, and quicker questions.",
            icon: "fab fa-discord",
            link: "https://discord.gg/RSp2CSuMny",
            aos_delay: 100,
            cta: "Join"
        },
        {
            title: "YouTube",
            description: "Videos and channel updates.",
            icon: "fab fa-youtube",
            link: "https://www.youtube.com/@anonymousgca5331",
            aos_delay: 160,
            cta: "Watch"
        },
        {
            title: "Reddit",
            description: "Discussions and public threads.",
            icon: "fab fa-reddit",
            link: "https://www.reddit.com/u/AnonymousGCA",
            aos_delay: 220,
            cta: "Open"
        },
        {
            title: "Web3",
            description: "Crypto identity and web3 presence.",
            icon: "fas fa-globe",
            link: "https://ud.me/anonymousgca.crypto",
            aos_delay: 280,
            cta: "Visit"
        }
    ];

    const quickLinks = [
        {label: "Email", icon: "fas fa-envelope", href: "mailto:anonymousgca@anonymousgca.eu"},
        {label: "LinkedIn", icon: "fab fa-linkedin", href: "https://www.linkedin.com/in/gabriele-caretti-046408270/"},
        {label: "GitHub", icon: "fab fa-github", href: "https://github.com/GABRYCA"},
        {label: "Discord", icon: "fab fa-discord", href: "https://discord.gg/RSp2CSuMny"}
    ];
</script>

<div class="contacts-page">
    <div class="container-xxl mt-4 mt-md-5 mb-4 mb-md-5">
        <section class="page-hero mb-4 mb-md-5" use:scrollAnimation={{ animation: 'fade-up', duration: 450 }}>
            <div class="page-hero__eyebrow">
                <i class="fas fa-satellite-dish" aria-hidden="true"></i>
                Available for contact
            </div>
            <h1 class="contacts-title page-hero__title">Connect With Me</h1>
            <p class="page-hero__lead">
                Recruiter, collaborator, or curious visitor: pick the channel that fits.
                Email and LinkedIn are the fastest paths for professional outreach.
            </p>

            <ul class="quick-links">
                {#each quickLinks as item (item.href)}
                    <li>
                        <a
                            class="quick-link"
                            href={item.href}
                            target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                            rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                        >
                            <i class="{item.icon}" aria-hidden="true"></i>
                            <span>{item.label}</span>
                        </a>
                    </li>
                {/each}
            </ul>
        </section>

        <section class="mb-4 mb-md-5" aria-labelledby="professional-heading">
            <div class="section-heading" use:scrollAnimation={{ animation: 'fade-up', duration: 400 }}>
                <h2 id="professional-heading" class="section-heading__title">Professional</h2>
                <p class="section-heading__sub">Primary channels for work and opportunities</p>
            </div>
            <div class="row g-3 g-md-4">
                {#each professional as contact (contact.title)}
                    <ContactCard
                        title={contact.title}
                        description={contact.description}
                        icon={contact.icon}
                        link={contact.link}
                        aos_delay={contact.aos_delay}
                        cta={contact.cta}
                        featured={true}
                    />
                {/each}
            </div>
        </section>

        <section aria-labelledby="social-heading">
            <div class="section-heading" use:scrollAnimation={{ animation: 'fade-up', duration: 400 }}>
                <h2 id="social-heading" class="section-heading__title">Social & community</h2>
                <p class="section-heading__sub">Where I hang out beyond the inbox</p>
            </div>
            <div class="row g-3 g-md-4">
                {#each social as contact (contact.title)}
                    <ContactCard
                        title={contact.title}
                        description={contact.description}
                        icon={contact.icon}
                        link={contact.link}
                        aos_delay={contact.aos_delay}
                        cta={contact.cta}
                    />
                {/each}
            </div>
        </section>
    </div>
</div>

<style>
    .quick-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin: 1.5rem 0 0;
        padding: 0;
        list-style: none;
    }

    .quick-link {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.6rem 1rem;
        border-radius: 999px;
        border: 1px solid var(--border-glow);
        background: hsla(0, 0%, 0%, 0.28);
        color: var(--text-color-light);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.92rem;
        transition:
            transform 0.3s var(--ease-out-expo),
            border-color 0.2s ease,
            box-shadow 0.3s ease,
            color 0.2s ease;
    }

    .quick-link i {
        color: var(--primary-color);
        filter: drop-shadow(0 0 0.35rem var(--primary-color-glow));
    }

    .quick-link:hover,
    .quick-link:focus-visible {
        transform: translateY(-2px);
        border-color: var(--border-glow-strong);
        color: var(--primary-color);
        box-shadow: 0 0 20px hsla(287, 100%, 65%, 0.2);
        outline: none;
    }

    .quick-link:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }

    .section-heading {
        margin-bottom: 1.15rem;
    }

    .section-heading__title {
        margin: 0 0 0.3rem;
        font-size: clamp(1.35rem, 2.4vw, 1.75rem);
        font-weight: 700;
        color: var(--text-color-light);
        text-wrap: balance;
    }

    .section-heading__sub {
        margin: 0;
        color: var(--text-soft);
        font-size: 0.98rem;
    }

    @media (prefers-reduced-motion: reduce) {
        .quick-link {
            transition: none;
        }

        .quick-link:hover,
        .quick-link:focus-visible {
            transform: none;
        }
    }
</style>
