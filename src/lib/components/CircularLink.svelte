<script>
    import {tooltip} from 'svelte-tooltip-gca';
    import {resolve as resolvePath} from '$app/paths';
    import {primaryTooltipTheme} from '$lib/tooltipThemes.js';

    /** @type {{icon?: string, title?: string, link?: string}} */
    let {icon = 'fas fa-code', title = 'Code', link = '#'} = $props();
    const external = $derived(!link.startsWith('/') && !link.startsWith('mailto:'));
    const label = $derived(title.replace(/^(Open|Send|Visit|View|Join|Write|Watch|Connect)\s+/i, ''));

    function resolve(value) {
        return value.startsWith('/') ? resolvePath(value) : value;
    }

</script>

<div class="col-6 col-sm-4 col-lg-3 social-item">
    <a class="social-plate" href={resolve(link)} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} aria-label={title}
       use:tooltip={{ content: title, placement: 'top', theme: primaryTooltipTheme }}>
        <span class="social-plate__disc">
            <i class={icon} aria-hidden="true"></i>
        </span>
        <span class="social-plate__label">{label}</span>
    </a>
</div>


<style>
    .social-item {
        display: flex;
        justify-content: center;
    }

    .social-plate {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 0.6rem;
        padding: 0.35rem 0.5rem;
        text-decoration: none;
        color: var(--ink-soft);
    }

    .social-plate__disc {
        display: grid;
        place-items: center;
        width: 4.25rem;
        height: 4.25rem;
        border-radius: 50%;
        border: 1px solid var(--line-strong);
        background: transparent;
        color: var(--azure);
        font-size: 1.5rem;
        transition:
            background-color 0.3s var(--ease-out-expo),
            border-color 0.3s ease,
            color 0.3s ease,
            transform 0.35s var(--ease-out-expo);
    }

    .social-plate__label {
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--ink-faint);
        transition: color 0.3s ease;
    }

    .social-plate:hover .social-plate__disc,
    .social-plate:focus-visible .social-plate__disc {
        background: var(--azure);
        border-color: var(--azure);
        color: #000;
        transform: translateY(-3px);
    }

    .social-plate:hover .social-plate__label,
    .social-plate:focus-visible .social-plate__label {
        color: var(--ink);
    }

    .social-plate:focus-visible {
        outline: 2px solid var(--azure);
        outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
        .social-plate__disc,
        .social-plate__label {
            transition: none;
        }

        .social-plate:hover .social-plate__disc,
        .social-plate:focus-visible .social-plate__disc {
            transform: none;
        }
    }
</style>
