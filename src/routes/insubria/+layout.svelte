<script>
    import {onMount} from "svelte";

    /** @type {{children?: import('svelte').Snippet}} */
    let {children} = $props();

    onMount(() => {
        const url = window.location.href;
        const day = url.split('/insubria/')[1];
        if (day) {
            const button = document.getElementById(day);
            if (button) {
                button.classList.add('active');
            }
            const buttons = document.getElementsByClassName('btn');
            for (let i = 0; i < buttons.length; i++) {
                if (buttons[i].id !== day) {
                    buttons[i].classList.remove('active');
                }
            }
        }
    });
</script>

<div class="row justify-content-around border-bottom border-light-subtle pt-3 pb-2 mb-4 shadow">
    <div class="col-auto">
        <a class="btn btn-outline-light" id="lunedi" href="/insubria/lunedi">Lunedì</a>
    </div>
    <div class="col-auto">
        <a class="btn btn-outline-light" id="martedi" href="/insubria/martedi">Martedì</a>
    </div>
    <div class="col-auto">
        <a class="btn btn-outline-light" id="mercoledi" href="/insubria/mercoledi">Mercoledì</a>
    </div>
    <div class="col-auto">
        <a class="btn btn-outline-light mt-2 mt-sm-0" id="/insubria/giovedi" href="/insubria/giovedi">Giovedì</a>
    </div>
    <div class="col-auto">
        <a class="btn btn-outline-light mt-2 mt-sm-0" id="/insubria/venerdi" href="/insubria/venerdi">Venerdi</a>
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