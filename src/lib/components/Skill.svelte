<script>
    import { scrollAnimation } from "$lib/actions/scrollAnimation.js";

    /** @type {{title?: string, icon?: string, icon_color?: string, title_color?: string}} */
    let {
        title = "Skill Title",
        icon = "fas fa-code",
        icon_color = "",
        title_color = ""
    } = $props();

</script>

<div class="col-12 col-lg-5 skill-plate" use:scrollAnimation={{ animation: 'ink-up', duration: 600 }}>
    <i class="{icon} skill-plate__icon" style:color={icon_color} aria-hidden="true"></i>
    <h3 class="skill-plate__title" style:color={title_color}>{title}</h3>
</div>

<style>
    .skill-plate {
        display: flex;
        align-items: center;
        gap: 1.15rem;
        margin-inline: clamp(0.5rem, 2vw, 1rem);
        padding: 1.5rem 1.35rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-card);
        background: var(--surface);
        transition:
            background-color 0.3s var(--ease-out-expo),
            border-color 0.3s ease,
            transform 0.3s var(--ease-out-expo);
    }

    .skill-plate__icon {
        font-size: 2.1rem;
        color: var(--azure);
        width: 2.6rem;
        text-align: center;
        transition: color 0.3s ease, transform 0.35s var(--ease-out-expo);
    }

    .skill-plate__title {
        margin: 0;
        font-size: clamp(1.15rem, 1.6vw, 1.45rem);
        font-weight: 700;
        color: var(--ink);
        transition: color 0.3s ease;
    }

    .skill-plate:hover {
        background: var(--azure);
        border-color: var(--azure);
        transform: translateY(-3px);
    }

    .skill-plate:hover .skill-plate__icon {
        color: #000 !important;
        transform: translateX(3px);
    }

    .skill-plate:hover .skill-plate__title {
        color: #000 !important;
    }

    @media (prefers-reduced-motion: reduce) {
        .skill-plate,
        .skill-plate__icon {
            transition: none;
        }

        .skill-plate:hover {
            transform: none;
        }

        .skill-plate:hover .skill-plate__icon {
            transform: none;
        }
    }
</style>
