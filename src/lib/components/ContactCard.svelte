<script>
    import {scrollAnimation} from "$lib/actions/scrollAnimation.js";

    /** @type {{aos_animation?: string, aos_delay?: number, title?: string, description?: string, icon?: string, link?: string, featured?: boolean, cta?: string}} */
    let {
        aos_animation = "fade-up",
        aos_delay = 100,
        title = "Github",
        description = "",
        icon = "fab fa-github",
        link = "https://github.com/GABRYCA",
        featured = false,
        cta = "Open"
    } = $props();

    /**
     * @param {string} url
     */
    function getUrlWithoutHttps(url) {
        return url
            .replace(/https?:\/\/(www\.)?/, '')
            .replace(/\/$/, '')
            .replace(/mailto:/, '');
    }

    const external = $derived(!link.startsWith('mailto:'));
</script>

<div
    class={['contact-card-wrap', featured ? 'col-12 col-lg-4' : 'col-12 col-sm-6 col-lg-3']}
    use:scrollAnimation={{ animation: aos_animation, duration: 500, delay: aos_delay }}
>
    <a
        href={link}
        class={['contact-card', featured && 'contact-card--featured']}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label="{title}: {getUrlWithoutHttps(link)}"
    >
        <div class="contact-card__glow" aria-hidden="true"></div>
        <div class="contact-card__icon-ring" aria-hidden="true">
            <i class="{icon}"></i>
        </div>
        <div class="contact-card__body">
            <h3 class="contact-card__title">{title}</h3>
            <p class="contact-card__desc">{description}</p>
            <span class="contact-card__link">
                <span class="contact-card__url">{getUrlWithoutHttps(link)}</span>
                <span class="contact-card__cta">
                    {cta}
                    <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                </span>
            </span>
        </div>
    </a>
</div>

<style>
    .contact-card-wrap {
        display: flex;
    }

    .contact-card {
        --card-accent: var(--primary-color);
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
        width: 100%;
        min-height: 100%;
        padding: 1.35rem 1.25rem 1.25rem;
        border-radius: var(--radius-card);
        border: 1px solid var(--border-glow);
        background:
            linear-gradient(160deg, hsla(287, 100%, 65%, 0.08), transparent 42%),
            var(--surface-darker);
        color: inherit;
        text-decoration: none;
        overflow: hidden;
        isolation: isolate;
        transition:
            transform 0.35s var(--ease-out-expo),
            border-color 0.25s ease,
            box-shadow 0.35s var(--ease-out-expo);
    }

    .contact-card--featured {
        min-height: 15.5rem;
        padding: 1.6rem 1.45rem 1.4rem;
        background:
            linear-gradient(145deg, hsla(287, 100%, 65%, 0.16), transparent 48%),
            linear-gradient(320deg, hsla(0, 100%, 50%, 0.1), transparent 40%),
            var(--surface-darker);
    }

    .contact-card__glow {
        position: absolute;
        inset: auto -20% -45% auto;
        width: 12rem;
        height: 12rem;
        border-radius: 50%;
        background: radial-gradient(circle, hsla(287, 100%, 65%, 0.28), transparent 68%);
        opacity: 0.55;
        pointer-events: none;
        z-index: -1;
        transition: opacity 0.35s ease, transform 0.45s var(--ease-out-expo);
    }

    .contact-card__icon-ring {
        display: grid;
        place-items: center;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 1rem;
        border: 1px solid var(--border-glow);
        background: hsla(287, 100%, 65%, 0.12);
        box-shadow: inset 0 0 18px hsla(287, 100%, 65%, 0.12);
        transition: transform 0.35s var(--ease-out-expo), border-color 0.25s ease, box-shadow 0.35s ease;
    }

    .contact-card--featured .contact-card__icon-ring {
        width: 4rem;
        height: 4rem;
        border-radius: 1.15rem;
    }

    .contact-card__icon-ring i {
        font-size: 1.55rem;
        color: var(--primary-color);
        filter: drop-shadow(0 0 0.55rem var(--primary-color-glow));
    }

    .contact-card--featured .contact-card__icon-ring i {
        font-size: 1.85rem;
    }

    .contact-card__body {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 0.4rem;
    }

    .contact-card__title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: var(--text-color-light);
    }

    .contact-card--featured .contact-card__title {
        font-size: 1.4rem;
    }

    .contact-card__desc {
        margin: 0;
        color: var(--text-soft);
        font-size: 0.95rem;
        line-height: 1.5;
        text-wrap: pretty;
    }

    .contact-card__link {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        margin-top: auto;
        padding-top: 1rem;
    }

    .contact-card__url {
        font-size: 0.82rem;
        color: hsla(300, 50%, 88%, 0.62);
        word-break: break-all;
    }

    .contact-card__cta {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        width: fit-content;
        color: var(--primary-color);
        font-weight: 600;
        font-size: 0.92rem;
        transition: gap 0.25s var(--ease-out-expo), filter 0.25s ease;
    }

    .contact-card:hover,
    .contact-card:focus-visible {
        transform: translateY(-4px);
        border-color: var(--border-glow-strong);
        box-shadow:
            0 16px 40px hsla(280, 100%, 4%, 0.4),
            0 0 0 1px hsla(287, 100%, 65%, 0.15),
            0 0 28px hsla(287, 100%, 65%, 0.18);
        outline: none;
    }

    .contact-card:hover .contact-card__glow,
    .contact-card:focus-visible .contact-card__glow {
        opacity: 1;
        transform: scale(1.15);
    }

    .contact-card:hover .contact-card__icon-ring,
    .contact-card:focus-visible .contact-card__icon-ring {
        transform: scale(1.06);
        border-color: var(--border-glow-strong);
        box-shadow:
            inset 0 0 18px hsla(287, 100%, 65%, 0.18),
            0 0 18px hsla(287, 100%, 65%, 0.25);
    }

    .contact-card:hover .contact-card__cta,
    .contact-card:focus-visible .contact-card__cta {
        gap: 0.7rem;
        filter: drop-shadow(0 0 0.45rem var(--primary-color-glow));
    }

    .contact-card:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
        .contact-card,
        .contact-card__glow,
        .contact-card__icon-ring,
        .contact-card__cta {
            transition: none;
        }

        .contact-card:hover,
        .contact-card:focus-visible {
            transform: none;
        }
    }
</style>
