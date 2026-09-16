<script>
    import RuleBand from "$lib/components/RuleBand.svelte";
    import {scrollAnimation} from "$lib/actions/scrollAnimation.js";
    import {onMount} from "svelte";
    import {quintOut} from "svelte/easing";
    import {fly} from "svelte/transition";

    let {data} = $props();

    const kinds = [
        {id: 'all', label: 'Everything'},
        {id: 'web', label: 'Websites'},
        {id: 'svelte', label: 'Svelte works'},
        {id: 'uni', label: 'University'},
        {id: 'tool', label: 'VS Code'}
    ];

    let activeKind = $state('all');
    const filtered = $derived(activeKind === 'all' ? data.projects : data.projects.filter((project) => project.kind === activeKind));

    /** @type {Record<string, boolean>} */
    let expanded = $state({});
    let reducedMotion = $state(false);

    onMount(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => reducedMotion = media.matches;
        updateMotionPreference();
        media.addEventListener('change', updateMotionPreference);

        return () => media.removeEventListener('change', updateMotionPreference);
    });

    /**
     * @param {string} kindId
     */
    function kindCount(kindId) {
        return kindId === 'all'
            ? data.projects.length
            : data.projects.filter((project) => project.kind === kindId).length;
    }

    /**
     * @param {string} kindId
     */
    function selectKind(kindId) {
        activeKind = kindId;
    }

    /**
     * @param {string} id
     */
    function togglePreview(id) {
        expanded[id] = !expanded[id];
    }

    /**
     * Smooth grid-rows reveal for the preview iframe.
     * @param {HTMLElement} node
     * @param {{duration?: number}} options
     */
    function previewReveal(node, {duration = 360} = {}) {
        return {
            duration,
            easing: quintOut,
            css: (t) => `grid-template-rows: ${t}fr; opacity: ${t}; margin-top: ${(t - 1) * 0.9}rem;`
        };
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

    /**
     * @param {{kind: string, url: string}} project
     */
    function primaryCta(project) {
        if (project.kind === 'web') return 'Visit site';
        if (project.url.includes('npmjs.com')) return 'View on npm';
        return 'View source';
    }
</script>

<div class="projects-page">
    <div class="container-xxl">
        <section class="projects-hero" use:scrollAnimation={{ animation: 'ink-up', duration: 700 }}>
            <h1 class="display-title projects-title">Projects</h1>
            <p class="projects-hero__lead">
                Live websites, Svelte packages and components, university work and developer tooling.
                Everything here is shipped and open, sorted by most recent activity — pick a category and dive in.
            </p>
        </section>
    </div>

    <RuleBand/>

    <section class="catalogue" aria-labelledby="catalogue-heading">
        <div class="container-xxl">
            <div class="catalogue-head">
                <h2 id="catalogue-heading" class="catalogue-head__title">Catalogue</h2>
                <span class="catalogue-head__rule" aria-hidden="true"></span>
            </div>

            <div class="catalogue-bar">
                <div class="filters" role="group" aria-label="Filter projects">
                    {#each kinds as kind (kind.id)}
                        <button
                            type="button"
                            class="filter"
                            class:is-active={activeKind === kind.id}
                            aria-pressed={activeKind === kind.id}
                            onclick={() => selectKind(kind.id)}
                        >
                            {kind.label}
                            <span class="filter__count text-mono">{String(kindCount(kind.id)).padStart(2, '0')}</span>
                        </button>
                    {/each}
                </div>
                <p class="catalogue-bar__status text-mono" aria-live="polite">
                    {String(filtered.length).padStart(2, '0')} shown
                </p>
            </div>

            <div class="project-grid">
                {#key activeKind}
                    {#each filtered as project, i (project.url)}
                        {@const isOpen = !!expanded[project.url]}
                        <article
                            class="project-card"
                            class:is-open={isOpen}
                            in:fly={{y: reducedMotion ? 0 : 18, duration: reducedMotion ? 0 : 320, delay: reducedMotion ? 0 : Math.min(i * 40, 280)}}
                        >
                        <header class="project-card__head">
                            <span class="project-card__kind">{project.kindLabel}</span>
                            {#if project.meta}
                                <span class="project-card__meta text-mono">{project.meta}</span>
                            {/if}
                        </header>

                        <h3 class="project-card__title">{project.title}</h3>
                        <p class="project-card__desc">{project.description}</p>

                        {#if project.tags?.length}
                            <ul class="project-card__tags">
                                {#each project.tags as tag (tag)}
                                    <li>{tag}</li>
                                {/each}
                            </ul>
                        {/if}

                        <div class="project-card__actions">
                            {#if project.live}
                                <button
                                    type="button"
                                    class="btn-plate btn-plate--ghost"
                                    aria-expanded={isOpen}
                                    aria-controls="preview-{project.url}"
                                    onclick={() => togglePreview(project.url)}
                                >
                                    <i class="fas {isOpen ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>
                                    {isOpen ? 'Hide preview' : 'Show preview'}
                                </button>
                            {/if}
                            <a
                                class="btn-plate btn-plate--solid"
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {primaryCta(project)}
                                <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                            </a>
                        </div>

                        {#if isOpen}
                            <div class="preview-reveal" transition:previewReveal={{duration: reducedMotion ? 0 : 360}}>
                                <div class="preview-reveal__inner">
                                    <div class="browser-frame" id="preview-{project.url}">
                                        <div class="browser-frame__chrome" aria-hidden="true">
                                            <span class="dot dot--red"></span>
                                            <span class="dot dot--yellow"></span>
                                            <span class="dot dot--green"></span>
                                            <span class="browser-frame__url text-mono">{hostLabel(project.url)}</span>
                                        </div>
                                        <iframe
                                            src={project.url}
                                            class="browser-frame__viewport"
                                            title="Live preview of {project.title}"
                                            loading="lazy"
                                            referrerpolicy="no-referrer"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </article>
                    {/each}
                {/key}
            </div>

            <a class="github-row" href="https://github.com/GABRYCA?tab=repositories" target="_blank" rel="noopener noreferrer">
                <span class="github-row__title">More on GitHub</span>
                <span class="github-row__hint">Repositories, forks and experiments — all public</span>
                <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
    </section>
</div>

<style>
    .projects-hero {
        position: relative;
        padding-block: clamp(2rem, 6vw, 4.5rem);
        overflow: hidden;
    }

    .projects-hero::after {
        content: '';
        position: absolute;
        right: -4rem;
        bottom: -5rem;
        width: clamp(9rem, 22vw, 16rem);
        height: clamp(9rem, 22vw, 16rem);
        background: var(--azure-dark);
        transform: rotate(12deg);
        z-index: -1;
        pointer-events: none;
    }

    .projects-hero__lead {
        max-width: 46rem;
        margin: 1.25rem 0 0;
        color: var(--ink-soft);
        font-size: clamp(1rem, 1.3vw, 1.15rem);
        line-height: 1.65;
        text-wrap: pretty;
    }

    .catalogue {
        background: var(--surface);
        border-block: 1px solid var(--line);
        padding-block: clamp(2rem, 5vw, 3.5rem);
    }

    .catalogue-head {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
    }

    .catalogue-head__title {
        margin: 0;
        font-size: clamp(1.5rem, 2.6vw, 2rem);
        font-weight: 800;
        font-variation-settings: 'wdth' 115;
        text-transform: uppercase;
        letter-spacing: -0.025em;
        color: var(--ink);
        white-space: nowrap;
    }

    .catalogue-head__rule {
        flex: 1;
        height: 1px;
        background: var(--line);
    }

    .catalogue-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--line);
    }

    .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .filter {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.9rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-card);
        background: transparent;
        color: var(--ink-soft);
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
    }

    .filter__count {
        font-size: 0.72rem;
        color: var(--ink-faint);
        transition: color 0.2s ease;
    }

    .filter:hover {
        border-color: var(--azure-line);
        color: var(--ink);
    }

    .filter.is-active {
        background: var(--azure);
        border-color: var(--azure);
        color: #000;
    }

    .filter.is-active .filter__count {
        color: rgba(0, 0, 0, 0.65);
    }

    .filter:focus-visible {
        outline: 2px solid var(--azure);
        outline-offset: 2px;
    }

    .catalogue-bar__status {
        margin: 0;
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ink-faint);
    }

    .project-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 21rem), 1fr));
        gap: 1.25rem;
    }

    .project-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        padding: 1.35rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-card);
        background: var(--bg);
        /* NOTE: hover lift uses the independent `translate` property (not `transform`)
           so it never fights with Svelte's fly transition which animates `transform`. */
        transition:
            border-color 0.25s ease,
            translate 0.35s var(--ease-out-expo);
    }

    .project-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 2.25rem;
        background: var(--azure);
        transform: scaleY(0);
        transform-origin: 0 0;
        transition: transform 0.35s var(--ease-out-expo);
    }

    .project-card.is-open,
    .project-card:hover {
        border-color: var(--azure-line);
        translate: 0 -3px;
    }

    .project-card.is-open::before,
    .project-card:hover::before {
        transform: scaleY(1);
    }

    .project-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .project-card__kind {
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--ink-faint);
    }

    .project-card__meta {
        padding: 0.2rem 0.55rem;
        border: 1px solid var(--gold-line);
        border-radius: var(--radius-card);
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--gold);
        white-space: nowrap;
    }

    .project-card__title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        line-height: 1.15;
        color: var(--ink);
        text-wrap: balance;
    }

    .project-card__desc {
        margin: 0;
        color: var(--ink-soft);
        line-height: 1.6;
        text-wrap: pretty;
    }

    .project-card__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin: 0;
        margin-top: auto;
        padding: 0;
        list-style: none;
    }

    .project-card__tags li {
        padding: 0.25rem 0.55rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-card);
        color: var(--ink-soft);
        font-size: 0.74rem;
        font-weight: 600;
    }

    .project-card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
    }

    .btn-plate {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 0.95rem;
        border-radius: var(--radius-card);
        font-weight: 700;
        font-size: 0.86rem;
        text-decoration: none;
        border: 1px solid transparent;
        cursor: pointer;
        transition:
            transform 0.25s var(--ease-out-expo),
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
    }

    .btn-plate--solid {
        background: var(--azure);
        border-color: var(--azure);
        color: #000;
    }

    .btn-plate--solid:hover,
    .btn-plate--solid:focus-visible {
        background: var(--gold);
        border-color: var(--gold);
        color: #000;
        transform: translateY(-1px);
    }

    .btn-plate--ghost {
        background: transparent;
        border-color: var(--line-strong);
        color: var(--ink);
    }

    .btn-plate--ghost:hover,
    .btn-plate--ghost:focus-visible {
        border-color: var(--azure);
        color: var(--azure);
        transform: translateY(-1px);
    }

    .btn-plate:focus-visible {
        outline: 2px solid var(--azure);
        outline-offset: 2px;
    }

    .btn-plate:active {
        transform: scale(0.97);
    }

    .preview-reveal {
        display: grid;
        grid-template-rows: 1fr;
    }

    .preview-reveal__inner {
        min-height: 0;
        overflow: hidden;
    }

    .browser-frame {
        margin-top: 0.35rem;
        border-radius: var(--radius-card);
        overflow: hidden;
        border: 1px solid var(--line);
        background: var(--bg);
    }

    .browser-frame__chrome {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 0.75rem;
        background: var(--surface-2);
        border-bottom: 1px solid var(--line);
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
        border-radius: var(--radius-card);
        background: rgba(244, 241, 233, 0.06);
        color: var(--ink-faint);
        font-size: 0.72rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .browser-frame__viewport {
        display: block;
        width: 100%;
        height: min(52vh, 28rem);
        border: 0;
        background: var(--bg);
    }

    .github-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.5rem 1rem;
        margin-top: 1.75rem;
        padding: 1.25rem 1.35rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-card);
        background: var(--bg);
        text-decoration: none;
        transition: border-color 0.25s ease, background-color 0.25s ease;
    }

    .github-row__title {
        font-family: var(--font-display);
        font-variation-settings: 'wdth' 115;
        font-size: 1.15rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: -0.01em;
        color: var(--ink);
    }

    .github-row__hint {
        flex: 1;
        min-width: 12rem;
        color: var(--ink-soft);
        font-size: 0.92rem;
    }

    .github-row i {
        color: var(--azure);
        transition: transform 0.3s var(--ease-out-expo), color 0.25s ease;
    }

    .github-row:hover,
    .github-row:focus-visible {
        border-color: var(--azure-line);
        background: var(--surface-2);
        outline: none;
    }

    .github-row:hover i,
    .github-row:focus-visible i {
        transform: translateX(4px);
        color: var(--gold);
    }

    .github-row:focus-visible {
        outline: 2px solid var(--azure);
        outline-offset: 2px;
    }

    @media (max-width: 575.98px) {
        .catalogue-bar {
            align-items: flex-start;
            flex-direction: column;
        }

        .filter {
            flex: 1 1 auto;
            justify-content: center;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .project-card,
        .project-card::before,
        .btn-plate,
        .github-row,
        .github-row i {
            transition: none;
        }

        .project-card:hover,
        .btn-plate:hover,
        .btn-plate:active {
            transform: none;
            translate: none;
        }
    }
</style>
