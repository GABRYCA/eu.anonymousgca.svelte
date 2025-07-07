<script>
    import { onMount } from 'svelte';
    
    let {
        animation = 'fade-up',
        delay = 0,
        duration = 600,
        once = true,
        threshold = 0.1,
        rootMargin = '0px',
        children
    } = $props();
    
    let element = $state();
    let isVisible = $state(false);
    let hasAnimated = $state(false);
    
    // Animation mapping to CSS transforms and opacity
    const animations = {
        'fade-up': {
            initial: { opacity: 0, transform: 'translateY(50px)' },
            animate: { opacity: 1, transform: 'translateY(0)' }
        },
        'fade-down': {
            initial: { opacity: 0, transform: 'translateY(-50px)' },
            animate: { opacity: 1, transform: 'translateY(0)' }
        },
        'fade-left': {
            initial: { opacity: 0, transform: 'translateX(50px)' },
            animate: { opacity: 1, transform: 'translateX(0)' }
        },
        'fade-right': {
            initial: { opacity: 0, transform: 'translateX(-50px)' },
            animate: { opacity: 1, transform: 'translateX(0)' }
        },
        'zoom-in': {
            initial: { opacity: 0, transform: 'scale(0.8)' },
            animate: { opacity: 1, transform: 'scale(1)' }
        },
        'zoom-out': {
            initial: { opacity: 0, transform: 'scale(1.2)' },
            animate: { opacity: 1, transform: 'scale(1)' }
        },
        'slide-up': {
            initial: { opacity: 0, transform: 'translateY(100px)' },
            animate: { opacity: 1, transform: 'translateY(0)' }
        }
    };
    
    const getAnimationStyles = (animationType) => {
        return animations[animationType] || animations['fade-up'];
    };
    
    const shouldAnimate = $derived(() => {
        if (once) {
            return isVisible && !hasAnimated;
        }
        return isVisible;
    });
    
    onMount(() => {
        if (!element) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            isVisible = true;
                            if (once) {
                                hasAnimated = true;
                            }
                        }, delay);
                    } else if (!once) {
                        isVisible = false;
                    }
                });
            },
            {
                threshold,
                rootMargin
            }
        );
        
        observer.observe(element);
        
        return () => {
            observer.disconnect();
        };
    });
    
    $effect(() => {
        if (!element) return;
        
        const animationConfig = getAnimationStyles(animation);
        const styles = shouldAnimate() ? animationConfig.animate : animationConfig.initial;
        
        element.style.opacity = styles.opacity;
        element.style.transform = styles.transform;
        element.style.transition = `all ${duration}ms ease-out`;
    });
</script>

<div bind:this={element}>
    {@render children()}
</div>
