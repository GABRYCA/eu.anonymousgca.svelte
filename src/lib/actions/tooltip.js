import {browser} from '$app/environment';

/**
 * A Svelte action for creating custom tooltips by AnonymousGCA.
 * Usage: <element use:tooltip={{ text: 'My tooltip', placement: 'top' }}>
 *
 * @author AnonymousGCA
 */
export function tooltip(node, params = {}) {
    if (!browser) return {};

    let {
        text = '',
        placement = 'top',
        delay = 1,
        duration = 150,
        theme = 'dark',
        offset = 10
    } = params;

    let tooltipElement = null;
    let showTimeout = null;
    let hideTimeout = null;
    let isVisible = false;

    // Create tooltip element
    function createTooltip() {
        if (tooltipElement) return;

        tooltipElement = document.createElement('div');
        tooltipElement.className = `svelte-tooltip svelte-tooltip--${theme} svelte-tooltip--${placement}`;
        tooltipElement.innerHTML = `
            <div class="svelte-tooltip__content">${text}</div>
            <div class="svelte-tooltip__arrow"></div>
        `;
        tooltipElement.style.cssText = `
            position: absolute;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity ${duration}ms ease;
            font-size: 0.875rem;
            line-height: 1.2;
            max-width: 200px;
            word-wrap: break-word;
        `;
        document.body.appendChild(tooltipElement);
    }

    // Position tooltip relative to the node
    function positionTooltip() {
        if (!tooltipElement) return;

        const nodeRect = node.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Temporary clone
        const tempTooltip = tooltipElement.cloneNode(true);
        tempTooltip.style.position = 'absolute';
        tempTooltip.style.left = '0';
        tempTooltip.style.top = '0';
        tempTooltip.style.opacity = '1';
        tempTooltip.style.visibility = 'visible';
        tempTooltip.style.pointerEvents = 'none';
        tempTooltip.style.zIndex = '-1';

        document.body.appendChild(tempTooltip);

        // Force reflow and get accurate dimensions
        tempTooltip.offsetWidth;
        tempTooltip.offsetHeight;

        const tooltipWidth = tempTooltip.offsetWidth;
        const tooltipHeight = tempTooltip.offsetHeight;

        // Remove temporary clone
        document.body.removeChild(tempTooltip);

        let left = 0;
        let top = 0;

        // Calculate base position with pixel-perfect centering
        switch (placement) {
            case 'top':
                left = Math.round(nodeRect.left + (nodeRect.width - tooltipWidth) / 2);
                top = Math.round(nodeRect.top - tooltipHeight - offset);
                break;
            case 'bottom':
                left = Math.round(nodeRect.left + (nodeRect.width - tooltipWidth) / 2);
                top = Math.round(nodeRect.bottom + offset);
                break;
            case 'left':
                left = Math.round(nodeRect.left - tooltipWidth - offset);
                top = Math.round(nodeRect.top + (nodeRect.height - tooltipHeight) / 2);
                break;
            case 'right':
                left = Math.round(nodeRect.right + offset);
                top = Math.round(nodeRect.top + (nodeRect.height - tooltipHeight) / 2);
                break;
        }

        // Keep tooltip within viewport bounds
        if (left < 0) left = 8;
        if (left + tooltipWidth > viewportWidth) left = viewportWidth - tooltipWidth - 8;
        if (top < 0) top = 8;
        if (top + tooltipHeight > viewportHeight) top = viewportHeight - tooltipHeight - 8;

        tooltipElement.style.left = `${left + window.scrollX}px`;
        tooltipElement.style.top = `${top + window.scrollY}px`;
    }

    // Show tooltip
    function showTooltip() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        showTimeout = setTimeout(() => {
            if (!text.trim()) return;

            createTooltip();
            positionTooltip();

            requestAnimationFrame(() => {
                if (tooltipElement) {
                    tooltipElement.style.opacity = '1';
                    isVisible = true;
                }
            });
        }, delay);
    }

    // Hide tooltip
    function hideTooltip() {
        if (showTimeout) {
            clearTimeout(showTimeout);
            showTimeout = null;
        }

        if (tooltipElement && isVisible) {
            hideTimeout = setTimeout(() => {
                if (tooltipElement) {
                    tooltipElement.style.opacity = '0';
                    setTimeout(() => {
                        if (tooltipElement && tooltipElement.parentNode) {
                            tooltipElement.parentNode.removeChild(tooltipElement);
                            tooltipElement = null;
                            isVisible = false;
                        }
                    }, duration);
                }
            }, 50);
        }
    }

    // Event listeners
    function onMouseEnter() {
        showTooltip();
    }

    function onMouseLeave() {
        hideTooltip();
    }

    function onFocus() {
        showTooltip();
    }

    function onBlur() {
        hideTooltip();
    }

    // Add event listeners
    node.addEventListener('mouseenter', onMouseEnter);
    node.addEventListener('mouseleave', onMouseLeave);
    node.addEventListener('focus', onFocus);
    node.addEventListener('blur', onBlur);

    // Handle window resize/scroll
    function onResize() {
        if (tooltipElement && isVisible) {
            positionTooltip();
        }
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize);

    return {
        update(newParams) {
            const {
                text: newText = '',
                placement: newPlacement = 'top',
                delay: newDelay = 100,
                duration: newDuration = 200,
                theme: newTheme = 'dark',
                offset: newOffset = 10
            } = newParams;

            text = newText;
            placement = newPlacement;
            delay = newDelay;
            duration = newDuration;
            theme = newTheme;
            offset = newOffset;

            // Update tooltip content if it exists
            if (tooltipElement) {
                tooltipElement.className = `svelte-tooltip svelte-tooltip--${theme} svelte-tooltip--${placement}`;
                const contentEl = tooltipElement.querySelector('.svelte-tooltip__content');
                if (contentEl) {
                    contentEl.innerHTML = text;
                }
                tooltipElement.style.transition = `opacity ${duration}ms ease`;
                positionTooltip();
            }
        },

        destroy() {
            // Clean up
            if (showTimeout) clearTimeout(showTimeout);
            if (hideTimeout) clearTimeout(hideTimeout);

            node.removeEventListener('mouseenter', onMouseEnter);
            node.removeEventListener('mouseleave', onMouseLeave);
            node.removeEventListener('focus', onFocus);
            node.removeEventListener('blur', onBlur);

            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize);

            if (tooltipElement && tooltipElement.parentNode) {
                tooltipElement.parentNode.removeChild(tooltipElement);
            }
        }
    };
}
