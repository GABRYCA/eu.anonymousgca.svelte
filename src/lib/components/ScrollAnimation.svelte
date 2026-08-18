<script>
    import { scrollAnimation } from '$lib/actions/scrollAnimation.js';

    let {
        animation = 'fade-up',
        delay = 0,
        duration = 600,
        once = true,
        threshold = 0.1,
        rootMargin = '0px',
        children
    } = $props();
</script>

<div use:scrollAnimation={{ animation, delay, duration, once, threshold, rootMargin }}>
    {@render children()}
</div>
