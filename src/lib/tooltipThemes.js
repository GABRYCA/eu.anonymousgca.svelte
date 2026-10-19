/**
 * Theme for `svelte-tooltip-gca`.
 */

/** @type {import('svelte-tooltip-gca').TooltipTheme} */
export const darkTooltipTheme = {
    background: 'rgba(0, 0, 0, 0.9)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-family-sans-serif)',
    fontWeight: '500',
    padding: '8px 12px',
    maxWidth: '200px',
    arrowSize: 8,
    zIndex: 9999
};

/** @type {import('svelte-tooltip-gca').TooltipTheme} */
export const lightTooltipTheme = {
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#333333',
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-family-sans-serif)',
    fontWeight: '500',
    padding: '8px 12px',
    maxWidth: '200px',
    arrowSize: 8,
    zIndex: 9999
};

/** @type {import('svelte-tooltip-gca').TooltipTheme} */
export const primaryTooltipTheme = {
    background: '#0a2a6b',
    color: '#f4f1e9',
    border: 'rgba(76, 141, 255, 0.45)',
    shadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-family-sans-serif)',
    fontWeight: '600',
    padding: '8px 12px',
    maxWidth: '220px',
    arrowSize: 8,
    zIndex: 9999
};
