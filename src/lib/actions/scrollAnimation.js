import { browser } from '$app/environment';

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
    'slide-left': {
        initial: { opacity: 0, transform: 'translateX(100px)' },
        animate: { opacity: 1, transform: 'translateX(0)' }
    },
    'slide-right': {
        initial: { opacity: 0, transform: 'translateX(-100px)' },
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

/**
 * Svelte action for scroll-based animations
 * @param {HTMLElement} element 
 * @param {Object} options 
 * @param {string} options.animation - Animation type
 * @param {number} options.delay - Delay in milliseconds
 * @param {number} options.duration - Animation duration in milliseconds
 * @param {boolean} options.once - Whether animation should run only once
 * @param {number} options.threshold - Intersection observer threshold
 * @param {string} options.rootMargin - Intersection observer root margin
 */
export function scrollAnimation(element, options = {}) {
    if (!browser) return;

    const {
        animation = 'fade-up',
        delay = 0,
        duration = 600,
        once = true,
        threshold = 0.1,
        rootMargin = '0px'
    } = options;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        element.style.transition = 'none';
        return;
    }

    if (!('IntersectionObserver' in window)) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        element.style.transition = 'none';
        return;
    }

    const animationConfig = animations[animation] || animations['fade-up'];
    let hasAnimated = false;
    let timer;

    // Apply styles
    const applyStyles = (styles, transition = true) => {
        element.style.opacity = styles.opacity;
        element.style.transform = styles.transform;
        element.style.transition = transition
            ? `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`
            : 'none';
    };

    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    const isAboveViewport = rect.bottom <= 0;

    if (isInViewport || isAboveViewport) {
        hasAnimated = true;
        applyStyles(animationConfig.animate, false);
    } else {
        applyStyles(animationConfig.initial, false);
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (once && hasAnimated) return;

                    hasAnimated = true;
                    timer = window.setTimeout(() => {
                        applyStyles(animationConfig.animate);
                    }, delay);
                } else if (!once) {
                    if (timer) {
                        window.clearTimeout(timer);
                        timer = undefined;
                    }
                    hasAnimated = false;
                    applyStyles(animationConfig.initial, false);
                }
            });
        },
        {
            threshold,
            rootMargin
        }
    );

    observer.observe(element);

    return {
        update(newOptions) {
            Object.assign(options, newOptions);
        },
        destroy() {
            observer.disconnect();
            if (timer) window.clearTimeout(timer);
        }
    };
}

// Helper function to create animation with specific parameters
export function createScrollAnimation(animation, delay = 0, duration = 600) {
    return (element) => scrollAnimation(element, { animation, delay, duration });
}
