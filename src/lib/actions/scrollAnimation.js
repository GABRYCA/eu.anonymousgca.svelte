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
    
    const animationConfig = animations[animation] || animations['fade-up'];
    let hasAnimated = false;
    
    // Apply initial styles
    const applyStyles = (styles) => {
        element.style.opacity = styles.opacity;
        element.style.transform = styles.transform;
        element.style.transition = `all ${duration}ms ease-out`;
    };
    
    // Set initial state
    applyStyles(animationConfig.initial);
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (once && hasAnimated) return;
                    
                    setTimeout(() => {
                        applyStyles(animationConfig.animate);
                        hasAnimated = true;
                    }, delay);
                } else if (!once) {
                    applyStyles(animationConfig.initial);
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
        }
    };
}

// Helper function to create animation with specific parameters
export function createScrollAnimation(animation, delay = 0, duration = 600) {
    return (element) => scrollAnimation(element, { animation, delay, duration });
}
