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
    background: 'linear-gradient(135deg, hsl(287, 100%, 65%), hsl(0, 100%, 58%))',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: '0 4px 20px rgba(205, 61, 251, 0.3)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-family-sans-serif)',
    fontWeight: '500',
    padding: '8px 12px',
    maxWidth: '200px',
    arrowSize: 8,
    zIndex: 9999
};