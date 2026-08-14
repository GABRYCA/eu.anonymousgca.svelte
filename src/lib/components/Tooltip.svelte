<script>
    import {tooltip} from 'svelte-tooltip-gca';
    import {darkTooltipTheme, lightTooltipTheme, primaryTooltipTheme} from '$lib/tooltipThemes.js';

    const THEME_MAP = {
        dark: darkTooltipTheme,
        light: lightTooltipTheme,
        primary: primaryTooltipTheme
    };

    let {
        text = '',
        placement = 'top',
        delay = 100,
        duration = 200,
        theme = 'dark',
        offset = 10,
        disabled = false,
        children
    } = $props();

    const tooltipParams = $derived({
        content: text,
        placement,
        theme: THEME_MAP[theme] ?? theme,
        offset,
        delay,
        hideDelay: 80,
        animationDuration: duration,
        disabled
    });
</script>

<!--
    Usage:
    <Tooltip text="My tooltip" placement="top" theme="primary">
        <button>Hover me</button>
    </Tooltip>
-->
<span use:tooltip={tooltipParams}>
    {@render children?.()}
</span>

<style>
    span {
        display: inline;
        max-width: 100%;
    }
</style>
