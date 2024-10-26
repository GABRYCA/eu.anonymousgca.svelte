<script>
    import {onMount} from "svelte";

    /** @type {{icon?: string, title?: string, link?: string}} */
    let { icon = 'fas fa-code', title = 'Code', link = '#' } = $props();

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<div class="col-3">
    <a href="{link}" target="_blank" data-bs-toggle="tooltip"
       data-bs-placement="top" title="{title}" aria-label="{link}">
        <span class="fa-stack fa-2x light-span">
            <i class="fas fa-circle fa-stack-2x"></i>
            <i class="{icon} fa-stack-1x fa-inverse hover-effect-icons"></i>
        </span>
    </a>
</div>


<style>
    .light-span {
        color: #575757;
    }

    .fa-circle {
        text-shadow: 2px 2px #000000;
    }

    .hover-effect-icons {
        transition-duration: 0.2s;
    }

    .hover-effect-icons:hover {
        color: #d34cff !important;
    }

    .fa-circle {
        color: rgba(255, 0, 170, 0.5);
        filter: drop-shadow(0 0 0.5rem #d34cff);
        animation: shadow 3s infinite;
    }

    @keyframes shadow {
        0% {
            filter: drop-shadow(0 0 0.5rem #ff2b2b);
        }

        50% {
            filter: drop-shadow(0 0 0.5rem #d34cff);
        }

        100% {
            filter: drop-shadow(0 0 0.5rem #ff2b2b);
        }
    }
</style>