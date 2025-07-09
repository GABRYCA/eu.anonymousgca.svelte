<script>
    import {tooltip} from '$lib/actions/tooltip.js';

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

    const tooltipParams = $derived(disabled ? null : {
        text,
        placement,
        delay,
        duration,
        theme,
        offset
    });
</script>

<!-- 
    Tooltip wrapper component
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
        display: contents;
    }
</style>
