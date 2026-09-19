import { browser } from '$app/environment';

/* Motion presets — short travel distances keep reveals feeling precise
   rather than theatrical, and every variant eases with the site's
   expo-out curve so entrances share one motion language. */
const animations = {
	'fade-up': {
		initial: { opacity: 0, transform: 'translateY(24px)' },
		animate: { opacity: 1, transform: 'translateY(0)' }
	},
	'fade-down': {
		initial: { opacity: 0, transform: 'translateY(-24px)' },
		animate: { opacity: 1, transform: 'translateY(0)' }
	},
	'fade-left': {
		initial: { opacity: 0, transform: 'translateX(24px)' },
		animate: { opacity: 1, transform: 'translateX(0)' }
	},
	'fade-right': {
		initial: { opacity: 0, transform: 'translateX(-24px)' },
		animate: { opacity: 1, transform: 'translateX(0)' }
	},
	'slide-left': {
		initial: { opacity: 0, transform: 'translateX(40px)' },
		animate: { opacity: 1, transform: 'translateX(0)' }
	},
	'slide-right': {
		initial: { opacity: 0, transform: 'translateX(-40px)' },
		animate: { opacity: 1, transform: 'translateX(0)' }
	},
	'slide-up': {
		initial: { opacity: 0, transform: 'translateY(40px)' },
		animate: { opacity: 1, transform: 'translateY(0)' }
	},
	'zoom-in': {
		initial: { opacity: 0, transform: 'scale(0.94)' },
		animate: { opacity: 1, transform: 'scale(1)' }
	},
	'zoom-out': {
		initial: { opacity: 0, transform: 'scale(1.06)' },
		animate: { opacity: 1, transform: 'scale(1)' }
	},
	'ink-up': {
		initial: { opacity: 0, transform: 'translateY(16px)' },
		animate: { opacity: 1, transform: 'translateY(0)' }
	}
};

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Show the element immediately (no transition) — used when the element is
 * already on screen, motion is reduced, or IntersectionObserver is missing.
 * @param {HTMLElement} element
 */
function showInstantly(element) {
	element.style.opacity = '1';
	element.style.transform = 'none';
	element.style.clipPath = 'none';
	element.style.transition = 'none';
	element.style.willChange = 'auto';
}

/**
 * Svelte action for scroll-triggered reveal animations.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @param {string} [options.animation] - Animation preset name
 * @param {number} [options.delay] - Delay in milliseconds
 * @param {number} [options.duration] - Animation duration in milliseconds
 * @param {boolean} [options.once] - Whether the animation should run only once
 * @param {number} [options.threshold] - Intersection observer threshold
 * @param {string} [options.rootMargin] - Intersection observer root margin
 */
export function scrollAnimation(element, options = {}) {
	if (!browser) return;

	const config = {
		animation: options.animation ?? 'fade-up',
		delay: options.delay ?? 0,
		duration: options.duration ?? 600,
		once: options.once ?? true,
		threshold: options.threshold ?? 0.1,
		rootMargin: options.rootMargin ?? '0px 0px -8% 0px'
	};

	const media = window.matchMedia('(prefers-reduced-motion: reduce)');

	if (media.matches || !('IntersectionObserver' in window)) {
		showInstantly(element);
		return {
			update() {},
			destroy() {}
		};
	}

	let preset = animations[config.animation] ?? animations['fade-up'];
	let hasAnimated = false;
	let timer;

	const applyStyles = (styles, { transition = true } = {}) => {
		element.style.opacity = styles.opacity;
		element.style.transform = styles.transform;
		element.style.transition = transition
			? `opacity ${config.duration}ms ${EASE}, transform ${config.duration}ms ${EASE}`
			: 'none';
		// Only hint the compositor while motion is actually happening.
		element.style.willChange = transition ? 'opacity, transform' : 'auto';
	};

	const playInkReveal = () => {
		if (config.animation !== 'ink-up') return;
		// Keep the class-driven clip-path animation in sync with the
		// requested duration so both layers finish together.
		element.style.setProperty('--ink-duration', `${config.duration}ms`);
		element.classList.add('ink-reveal');
		window.setTimeout(() => {
			element.classList.remove('ink-reveal');
			element.style.removeProperty('--ink-duration');
			element.style.willChange = 'auto';
		}, config.duration + 80);
	};

	const rect = element.getBoundingClientRect();
	const isOnScreen = rect.top < window.innerHeight && rect.bottom > 0;
	const isAboveViewport = rect.bottom <= 0;

	if (isOnScreen || isAboveViewport) {
		hasAnimated = true;
		applyStyles(preset.animate, { transition: false });
	} else {
		applyStyles(preset.initial, { transition: false });
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				// An element above the viewport was already scrolled past
				// (possible when hydration lands after a scroll restoration):
				// reveal it immediately instead of leaving it invisible.
				if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
					hasAnimated = true;
					applyStyles(preset.animate, { transition: false });
					continue;
				}

				if (entry.isIntersecting) {
					if (config.once && hasAnimated) continue;

					hasAnimated = true;
					timer = window.setTimeout(() => {
						timer = undefined;
						applyStyles(preset.animate);
						playInkReveal();
					}, config.delay);
				} else if (!config.once) {
					if (timer) {
						window.clearTimeout(timer);
						timer = undefined;
					}
					hasAnimated = false;
					applyStyles(preset.initial, { transition: false });
				}
			}
		},
		{ threshold: config.threshold, rootMargin: config.rootMargin }
	);

	observer.observe(element);

	return {
		update(newOptions = {}) {
			Object.assign(config, newOptions);
			preset = animations[config.animation] ?? preset;
			// Re-sync the current state without replaying the reveal.
			applyStyles(hasAnimated ? preset.animate : preset.initial, { transition: false });
		},
		destroy() {
			observer.disconnect();
			if (timer) window.clearTimeout(timer);
			// Leave no inline state behind (clean unmount during route swaps).
			element.style.removeProperty('opacity');
			element.style.removeProperty('transform');
			element.style.removeProperty('transition');
			element.style.removeProperty('will-change');
			element.classList.remove('ink-reveal');
			element.style.removeProperty('--ink-duration');
		}
	};
}

// Helper to build a pre-tuned scroll animation action
export function createScrollAnimation(animation, delay = 0, duration = 600) {
	return (element) => scrollAnimation(element, { animation, delay, duration });
}
