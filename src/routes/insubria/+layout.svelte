<script>
    import {page} from '$app/state';

    /** @type {{children?: import('svelte').Snippet}} */
    let {children} = $props();

    /** @param {string} href */
    function isActive(href) {
        return page.url.pathname === href;
    }
</script>

<div class="row justify-content-around border-bottom border-light-subtle pt-3 pb-2 mb-4 shadow">
    <div class="col-auto">
        <a
            class="btn btn-outline-light"
            class:active={isActive('/insubria/lunedi')}
            href="/insubria/lunedi"
            aria-current={isActive('/insubria/lunedi') ? 'page' : undefined}
        >Lunedì</a>
    </div>
    <div class="col-auto">
        <a
            class="btn btn-outline-light"
            class:active={isActive('/insubria/martedi')}
            href="/insubria/martedi"
            aria-current={isActive('/insubria/martedi') ? 'page' : undefined}
        >Martedì</a>
    </div>
    <div class="col-auto">
        <a
            class="btn btn-outline-light"
            class:active={isActive('/insubria/mercoledi')}
            href="/insubria/mercoledi"
            aria-current={isActive('/insubria/mercoledi') ? 'page' : undefined}
        >Mercoledì</a>
    </div>
    <div class="col-auto mt-2 mt-sm-0">
        <a
            class="btn btn-outline-light"
            class:active={isActive('/insubria/giovedi')}
            href="/insubria/giovedi"
            aria-current={isActive('/insubria/giovedi') ? 'page' : undefined}
        >Giovedì</a>
    </div>
    <div class="col-auto mt-2 mt-sm-0">
        <a
            class="btn btn-outline-light"
            class:active={isActive('/insubria/venerdi')}
            href="/insubria/venerdi"
            aria-current={isActive('/insubria/venerdi') ? 'page' : undefined}
        >Venerdì</a>
    </div>
</div>

{@render children?.()}

<!-- Link agli orari degli autobus, sito trenitalia, e navigazione laghi -->
<div class="row justify-content-center mt-4 mb-4">
    <div class="col-auto my-1">
        <a href="https://www.uninsubria.it/sites/default/files/2024-09/ORARI%20BUS%20INSUBRIA_24_25.pdf" target="_blank"
           class="btn btn-outline-light">Linea Insubria</a>
    </div>
    <div class="col-auto my-1">
        <a href="https://www.ctpi.it/img/upload/OrariLinee/LineaC.pdf" target="_blank" class="btn btn-outline-light">Linea
            C</a>
    </div>
    <div class="col-auto my-1">
        <a href="https://www.ctpi.it/img/upload/OrariLinee/LineaE.pdf" target="_blank" class="btn btn-outline-light">Linea
            E</a>
    </div>
    <div class="col-auto my-1">
        <a href="https://www.trenitalia.com/" target="_blank" class="btn btn-outline-light">Orari Treni</a>
    </div>
    <div class="col-auto my-1">
        <a href="https://www.navigazionelaghi.it/biglietti-e-orari-lago-maggiore/" target="_blank"
           class="btn btn-outline-light">Navigazione Laghi</a>
    </div>
</div>

<style>
    :global(:root) {
        --color-train: #29ff10;
        --color-ship: #4868ff;
        --color-bus: #ff7e00;
    }
</style>