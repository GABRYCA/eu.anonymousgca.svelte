<script>
    import {scrollAnimation} from "$lib/actions/scrollAnimation.js";

    let {
        aos_animation = "fade-up",
        aos_delay = 100,
        icon = "fas fa-code",
        title = "Code",
        description = "",
        link = "#",
    } = $props();
</script>

<div class="col-md-6 col-lg-4" use:scrollAnimation={{ animation: aos_animation, delay: aos_delay, duration: 500 }}>
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        class="stack-card"
        aria-label="{title}: learn more"
    >
        <div class="stack-card__icon" aria-hidden="true">
            <i class="{icon}"></i>
        </div>
        <div class="stack-card__content">
            <h3 class="stack-card__title">{title}</h3>
            <p class="stack-card__desc">{description}</p>
            <span class="stack-card__cta">
                Learn more
                <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            </span>
        </div>
    </a>
</div>

<style>
    .stack-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
        height: 100%;
        padding: 1.4rem 1.3rem 1.25rem;
        border-radius: var(--radius-card);
        border: 1px solid var(--border-glow);
        background:
            linear-gradient(155deg, hsla(287, 100%, 65%, 0.1), transparent 50%),
            var(--surface-darker);
        color: inherit;
        text-decoration: none;
        overflow: hidden;
        transition:
            transform 0.35s var(--ease-out-expo),
            border-color 0.25s ease,
            box-shadow 0.35s var(--ease-out-expo);
    }

    .stack-card::after {
        content: '';
        position: absolute;
        inset: auto -15% -40% auto;
        width: 10rem;
        height: 10rem;
        border-radius: 50%;
        background: radial-gradient(circle, hsla(0, 100%, 55%, 0.18), transparent 70%);
        pointer-events: none;
        opacity: 0.7;
        transition: opacity 0.3s ease, transform 0.4s var(--ease-out-expo);
    }

    .stack-card__icon {
        display: grid;
        place-items: center;
        width: 3.25rem;
        height: 3.25rem;
        border-radius: 0.9rem;
        border: 1px solid var(--border-glow);
        background: hsla(287, 100%, 65%, 0.12);
    }

    .stack-card__icon i {
        font-size: 1.45rem;
        color: var(--primary-color);
        filter: drop-shadow(0 0 0.5rem var(--primary-color-glow));
    }

    .stack-card__content {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 0.45rem;
        position: relative;
        z-index: 1;
    }

    .stack-card__title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-color-light);
    }

    .stack-card__desc {
        margin: 0;
        color: var(--text-soft);
        font-size: 0.95rem;
        line-height: 1.55;
        text-wrap: pretty;
    }

    .stack-card__cta {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        margin-top: auto;
        padding-top: 0.9rem;
        color: var(--primary-color);
        font-weight: 600;
        font-size: 0.9rem;
        transition: gap 0.25s var(--ease-out-expo);
    }

    .stack-card:hover,
    .stack-card:focus-visible {
        transform: translateY(-4px);
        border-color: var(--border-glow-strong);
        box-shadow:
            0 16px 36px hsla(280, 100%, 4%, 0.35),
            0 0 24px hsla(287, 100%, 65%, 0.15);
        outline: none;
    }

    .stack-card:hover::after,
    .stack-card:focus-visible::after {
        opacity: 1;
        transform: scale(1.15);
    }

    .stack-card:hover .stack-card__cta,
    .stack-card:focus-visible .stack-card__cta {
        gap: 0.7rem;
    }

    .stack-card:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
        .stack-card,
        .stack-card::after,
        .stack-card__cta {
            transition: none;
        }

        .stack-card:hover,
        .stack-card:focus-visible {
            transform: none;
        }
    }
</style>
