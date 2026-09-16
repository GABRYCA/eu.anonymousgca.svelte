<script>
    import { onMount } from 'svelte';

    /** @type {{value?: number, duration?: number, pad?: number, suffix?: string}} */
    let { value = 0, duration = 900, pad = 0, suffix = '' } = $props();

    let node;
    // svelte-ignore state_referenced_locally
    let displayed = $state(value);

    onMount(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced || !('IntersectionObserver' in window)) {
            return;
        }

        displayed = 0;
        let started = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || started) return;
                started = true;
                observer.disconnect();

                const start = performance.now();
                const tick = (now) => {
                    const progress = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    displayed = Math.round(eased * value);
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.4 });

        observer.observe(node);
        return () => observer.disconnect();
    });
</script>

<span class="text-mono" bind:this={node}>{String(displayed).padStart(pad, '0')}{suffix}</span>
