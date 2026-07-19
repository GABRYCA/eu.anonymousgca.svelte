<script>
    import SVGWave from "$lib/components/SVGWave.svelte";
    import StackCard from "$lib/components/StackCard.svelte";
    import {scrollAnimation} from "$lib/actions/scrollAnimation.js";

    let {data} = $props();

    /** @type {Record<string, boolean>} */
    let expanded = $state({});

    /**
     * @param {string} id
     */
    function togglePreview(id) {
        expanded[id] = !expanded[id];
    }

    /**
     * @param {string} url
     */
    function hostLabel(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch {
            return url;
        }
    }
</script>

<div class="projects-page">
    <div class="container-xxl">
        <section class="page-hero mt-4 mt-md-5" use:scrollAnimation={{ animation: 'fade-up', duration: 450 }}>
            <div class="page-hero__eyebrow">
                <i class="fas fa-layer-group" aria-hidden="true"></i>
                Selected work
            </div>
            <h1 class="projects-title page-hero__title">Projects</h1>
            <p class="page-hero__lead">
                Live websites and the tools behind them
            </p>
            <div class="hero-stats" aria-label="Project summary">
                <div class="hero-stat">
                    <span class="hero-stat__value">{data.websites.length}</span>
                    <span class="hero-stat__label">Featured sites</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat__value">{data.stacks.length}</span>
                    <span class="hero-stat__label">Core tools</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat__value">SK</span>
                    <span class="hero-stat__label">SvelteKit first</span>
                </div>
            </div>
        </section>
    </div>

    <SVGWave
        data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z"/>

    <section class="projects-band py-4 py-md-5" aria-labelledby="websites-heading">
        <div class="container-xxl">
            <div class="section-heading text-center mb-4" use:scrollAnimation={{ animation: 'zoom-in', duration: 400 }}>
                <h2 id="websites-heading" class="section-heading__title">Websites</h2>
                <p class="section-heading__sub">Built, shipped, and still online</p>
            </div>

            <div class="project-grid">
                {#each data.websites as website, index (website.url)}
                    {@const isOpen = !!expanded[website.url]}
                    <article
                        class={['project-card', `project-card--${website.accent ?? 'violet'}`, isOpen && 'is-open']}
                        use:scrollAnimation={{ animation: 'zoom-in', duration: 450, delay: 80 * (index + 1) }}
                    >
                        <div class="project-card__meta">
                            <span class="project-card__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                            <div class="project-card__titles">
                                <h3 class="project-card__title">{website.title}</h3>
                                <p class="project-card__host">{hostLabel(website.url)}</p>
                            </div>
                        </div>

                        <p class="project-card__desc">{website.description}</p>

                        {#if website.tags?.length}
                            <ul class="project-card__tags">
                                {#each website.tags as tag (tag)}
                                    <li>{tag}</li>
                                {/each}
                            </ul>
                        {/if}

                        <div class="project-card__actions">
                            <button
                                type="button"
                                class="btn-preview"
                                aria-expanded={isOpen}
                                aria-controls="preview-{index}"
                                onclick={() => togglePreview(website.url)}
                            >
                                <i class="fas {isOpen ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>
                                {isOpen ? 'Hide preview' : 'Show preview'}
                            </button>
                            <a
                                class="btn-visit"
                                href={website.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Visit site
                                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                            </a>
                        </div>

                        {#if isOpen}
                            <div class="browser-frame" id="preview-{index}">
                                <div class="browser-frame__chrome" aria-hidden="true">
                                    <span class="dot dot--red"></span>
                                    <span class="dot dot--yellow"></span>
                                    <span class="dot dot--green"></span>
                                    <span class="browser-frame__url">{hostLabel(website.url)}</span>
                                </div>
                                <iframe
                                    src={website.url}
                                    class="browser-frame__viewport"
                                    title="Live preview of {website.title}"
                                    loading="lazy"
                                    referrerpolicy="no-referrer"
                                ></iframe>
                            </div>
                        {/if}
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <SVGWave
        rotation="180"
        data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z"/>

    <div class="container-xxl pb-4 pb-md-5">
        <div class="section-heading text-center mb-4" use:scrollAnimation={{ animation: 'zoom-in', duration: 400 }}>
            <p class="h2 webstack-title mb-2">My Web Stack</p>
            <p class="section-heading__sub">Long story short: my favourite tools</p>
        </div>
        <div class="row justify-content-center gy-3 gx-0 gx-md-4">
            {#each data.stacks as stack (stack.url)}
                <StackCard
                    title={stack.title}
                    description={stack.description}
                    link={stack.url}
                    icon={stack.icon}
                    aos_delay={stack.aos_delay}
                />
            {/each}
        </div>
    </div>
</div>

<style>
    .hero-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .hero-stat {
        display: flex;
        flex-direction: column;
        min-width: 7.5rem;
        padding: 0.75rem 1rem;
        border-radius: 0.9rem;
        border: 1px solid var(--border-glow);
        background: hsla(0, 0%, 0%, 0.28);
    }

    .hero-stat__value {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--primary-color);
        line-height: 1.1;
        text-shadow: 0 0 12px hsla(287, 100%, 65%, 0.35);
    }

    .hero-stat__label {
        margin-top: 0.2rem;
        font-size: 0.8rem;
        color: var(--text-soft);
    }

    .section-heading__title {
        margin: 0 0 0.35rem;
        font-size: clamp(1.5rem, 2.6vw, 2rem);
        font-weight: 700;
        color: var(--text-color-light);
    }

    .section-heading__sub {
        margin: 0;
        color: var(--text-soft);
    }

    .projects-band {
        background: hsla(0, 0%, 0%, 0.22);
    }

    .project-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
        gap: 1.25rem;
    }

    .project-card {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 1.35rem;
        border-radius: var(--radius-panel);
        border: 1px solid var(--border-glow);
        background:
            linear-gradient(155deg, hsla(287, 100%, 65%, 0.12), transparent 45%),
            var(--surface-darker);
        box-shadow: 0 16px 40px hsla(280, 100%, 4%, 0.28);
        transition:
            border-color 0.25s ease,
            box-shadow 0.35s var(--ease-out-expo),
            transform 0.35s var(--ease-out-expo);
    }

    .project-card--crimson {
        background:
            linear-gradient(155deg, hsla(0, 100%, 55%, 0.14), transparent 48%),
            linear-gradient(320deg, hsla(287, 100%, 65%, 0.08), transparent 40%),
            var(--surface-darker);
    }

    .project-card.is-open,
    .project-card:hover {
        border-color: var(--border-glow-strong);
        box-shadow:
            0 18px 44px hsla(280, 100%, 4%, 0.38),
            0 0 28px hsla(287, 100%, 65%, 0.12);
    }

    .project-card__meta {
        display: flex;
        align-items: flex-start;
        gap: 0.9rem;
    }

    .project-card__index {
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--primary-color);
        opacity: 0.9;
        padding-top: 0.25rem;
    }

    .project-card__title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        line-height: 1.2;
        color: var(--text-color-light);
        text-wrap: balance;
    }

    .project-card__host {
        margin: 0.2rem 0 0;
        font-size: 0.85rem;
        color: hsla(300, 40%, 88%, 0.55);
    }

    .project-card__desc {
        margin: 0;
        color: var(--text-soft);
        line-height: 1.6;
        text-wrap: pretty;
    }

    .project-card__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .project-card__tags li {
        padding: 0.3rem 0.65rem;
        border-radius: 999px;
        border: 1px solid var(--border-glow);
        background: hsla(287, 100%, 65%, 0.1);
        color: var(--primary-color);
        font-size: 0.78rem;
        font-weight: 600;
    }

    .project-card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin-top: 0.25rem;
    }

    .btn-preview,
    .btn-visit {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.9rem;
        text-decoration: none;
        border: 1px solid transparent;
        cursor: pointer;
        transition:
            transform 0.25s var(--ease-out-expo),
            background-color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.25s ease;
    }

    .btn-preview {
        background: hsla(310, 100%, 50%, 0.35);
        border-color: hsla(310, 100%, 60%, 0.35);
        color: var(--text-color-light);
        box-shadow: 0 0 16px hsla(287, 100%, 65%, 0.2);
    }

    .btn-preview:hover,
    .btn-preview:focus-visible {
        background: hsla(310, 100%, 50%, 0.48);
        border-color: hsla(310, 100%, 70%, 0.55);
        transform: translateY(-1px);
        outline: none;
    }

    .btn-visit {
        background: transparent;
        border-color: var(--border-glow);
        color: var(--primary-color);
    }

    .btn-visit:hover,
    .btn-visit:focus-visible {
        border-color: var(--border-glow-strong);
        box-shadow: 0 0 16px hsla(287, 100%, 65%, 0.18);
        transform: translateY(-1px);
        outline: none;
        color: var(--text-color-light);
    }

    .btn-preview:focus-visible,
    .btn-visit:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }

    .browser-frame {
        margin-top: 0.35rem;
        border-radius: 0.9rem;
        overflow: hidden;
        border: 1px solid var(--border-glow);
        background: hsla(0, 0%, 0%, 0.45);
        box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.03);
        animation: frame-in 0.4s var(--ease-out-expo);
    }

    .browser-frame__chrome {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 0.75rem;
        background: hsla(280, 40%, 8%, 0.95);
        border-bottom: 1px solid var(--border-glow);
    }

    .dot {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
    }

    .dot--red { background: #ff5f57; }
    .dot--yellow { background: #febc2e; }
    .dot--green { background: #28c840; }

    .browser-frame__url {
        margin-left: 0.5rem;
        flex: 1;
        min-width: 0;
        padding: 0.2rem 0.65rem;
        border-radius: 0.4rem;
        background: hsla(0, 0%, 100%, 0.06);
        color: hsla(300, 30%, 90%, 0.65);
        font-size: 0.75rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .browser-frame__viewport {
        display: block;
        width: 100%;
        height: min(52vh, 28rem);
        border: 0;
        background: hsl(280, 40%, 6%);
    }

    @keyframes frame-in {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .project-card,
        .btn-preview,
        .btn-visit,
        .browser-frame {
            transition: none;
            animation: none;
        }

        .project-card:hover,
        .btn-preview:hover,
        .btn-visit:hover {
            transform: none;
        }
    }
</style>
