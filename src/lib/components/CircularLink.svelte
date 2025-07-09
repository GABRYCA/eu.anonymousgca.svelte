<script>
    import {tooltip} from '$lib/actions/tooltip.js';

    /** @type {{icon?: string, title?: string, link?: string}} */
    let {icon = 'fas fa-code', title = 'Code', link = '#'} = $props();
</script>

<div class="col-3">
    <a href="{link}" target="_blank" aria-label="{link}"
       use:tooltip={{ text: title, placement: 'top', theme: 'primary' }}>
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

    .hover-effect-icons {
        transition-duration: 0.2s;
    }

    .hover-effect-icons:hover {
        color: rgb(223, 152, 246) !important;
        /* color: rgb(211, 76, 255) !important; */
    }

    .fa-circle {
        text-shadow: 2px 2px #000000;
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