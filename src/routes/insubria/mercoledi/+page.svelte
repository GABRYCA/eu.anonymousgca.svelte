<script>
    import {onMount} from "svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();

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

    const TRAGHETTO = 'traghetto';
    const TRENO = 'treno';
    const AUTOBUS = 'autobus';

    const viaggio = {
        andata: {
            normale: [
                {
                    type: TRAGHETTO,
                    icona: 'ship',
                    colore: 'traghetto',
                    nome: 'Corsa T.20',
                    oraPartenza: '07:00',
                    oraArrivo: '07:20',
                    luogoPartenza: 'Intra',
                    luogoArrivo: 'Laveno'
                },
                {
                    type: TRENO,
                    icona: 'train',
                    nome: 'Trenord 26',
                    oraPartenza: '07:38',
                    oraArrivo: '08:15',
                    luogoPartenza: 'Laveno Mombello Lago',
                    luogoArrivo: 'Varese Nord'
                },
                {
                    type: AUTOBUS,
                    icona: 'bus',
                    nome: 'Linea C/RS',
                    oraPartenza: '08:28',
                    oraArrivo: '08:40',
                    luogoPartenza: 'Morosini (FS/FNM)',
                    luogoArrivo: 'Monte Generoso, 71 (ASL)'
                }
            ],
            anticipatario: [
                {
                    type: TRAGHETTO,
                    icona: 'ship',
                    nome: 'Corsa T.44',
                    oraPartenza: '11:00',
                    oraArrivo: '11:20',
                    luogoPartenza: 'Intra',
                    luogoArrivo: 'Laveno'
                },
                {
                    type: TRENO,
                    icona: 'train',
                    nome: 'Trenord 44',
                    oraPartenza: '11:38',
                    oraArrivo: '12:15',
                    luogoPartenza: 'Laveno Mombello Lago',
                    luogoArrivo: 'Varese Nord'
                },
                {
                    type: AUTOBUS,
                    icona: 'bus',
                    nome: 'Linea C/RS',
                    oraPartenza: '12:48',
                    oraArrivo: '13:00',
                    luogoPartenza: 'Morosini (FS/FNM)',
                    luogoArrivo: 'Monte Generoso, 71 (ASL)'
                }
            ]
        },
        ritorno: {
            normale: [
                {
                    type: AUTOBUS,
                    icona: 'bus',
                    nome: "Linea C/RS",
                    oraPartenza: "13:06",
                    oraArrivo: "13:18",
                    luogoPartenza: "Monte Generoso, 84 (ASL)",
                    luogoArrivo: "Maspero (Kennedy/FS/FNM)"
                },
                {
                    type: TRENO,
                    icona: 'train',
                    nome: "Trenord 41",
                    oraPartenza: "13:47",
                    oraArrivo: "14:23",
                    luogoPartenza: "Varese Nord",
                    luogoArrivo: "Laveno Mombello Lago"
                },
                {
                    type: TRAGHETTO,
                    icona: 'ship',
                    nome: "Corsa T.61",
                    oraPartenza: "14:30",
                    oraArrivo: "14:50",
                    luogoPartenza: "Laveno",
                    luogoArrivo: "Intra"
                }
            ],
            anticipatario: [
                {
                    type: AUTOBUS,
                    icona: 'bus',
                    nome: "Linea C 3041",
                    oraPartenza: "19:21",
                    oraArrivo: "19:36",
                    luogoPartenza: "Monte Generoso, 84 (ASL)",
                    luogoArrivo: "Maspero (Kennedy/FS/FNM)"
                },
                {
                    type: TRENO,
                    icona: 'train',
                    nome: "Trenord 75",
                    oraPartenza: "19:47",
                    oraArrivo: "20:23",
                    luogoPartenza: "Varese Nord",
                    luogoArrivo: "Laveno Mombello Lago"
                },
                {
                    type: TRAGHETTO,
                    icona: 'ship',
                    nome: "Corsa T.97",
                    oraPartenza: "20:30",
                    oraArrivo: "20:50",
                    luogoPartenza: "Laveno",
                    luogoArrivo: "Intra"
                }
            ]
        }
    };

    function attesaTraMezzi(viaggio, indice) {
        if (indice < 0 || indice >= viaggio.length - 1) {
            return 0;
        }
        let arrivoPrimo = new Date(2000, 0, 1, viaggio[indice].oraArrivo.split(":")[0], viaggio[indice].oraArrivo.split(":")[1]);
        let partenzaSecondo = new Date(2000, 0, 1, viaggio[indice + 1].oraPartenza.split(":")[0], viaggio[indice + 1].oraPartenza.split(":")[1]);
        if (partenzaSecondo < arrivoPrimo) {
            partenzaSecondo.setDate(partenzaSecondo.getDate() + 1);
        }
        return (partenzaSecondo.getTime() - arrivoPrimo.getTime()) / (1000 * 60);
    }

    function durataMezzo(viaggio, indice) {
        if (indice < 0 || indice >= viaggio.length) {
            return 0;
        }
        let partenza = new Date(2000, 0, 1, viaggio[indice].oraPartenza.split(":")[0], viaggio[indice].oraPartenza.split(":")[1]);
        let arrivo = new Date(2000, 0, 1, viaggio[indice].oraArrivo.split(":")[0], viaggio[indice].oraArrivo.split(":")[1]);
        if (arrivo < partenza) {
            arrivo.setDate(arrivo.getDate() + 1);
        }
        return (arrivo.getTime() - partenza.getTime()) / (1000 * 60);
    }

    function tempoTotale(viaggio) {
        let tempo = 0;
        for (let i = 0; i < viaggio.length; i++) {
            tempo += durataMezzo(viaggio, i);
            tempo += attesaTraMezzi(viaggio, i);
        }
        return tempo;
    }
</script>

<div class="row text-center rounded-5 border border-light-subtle pt-5 pb-5 mx-1 mb-4 shadow">
    <div class="col text-white">
        <div class="row justify-content-center">
            <div class="col-auto">
                <h2 class="shadow px-5 pt-1 pb-1 rounded bg-success bg-opacity-10">Normale Andata:</h2>
            </div>
        </div>

        <!--<table class="table table-hover table-striped shadow mt-3">
            <thead>
            <tr>
                <th scope="col">Mezzo</th>
                <th scope="col">Partenza</th>
                <th scope="col">Arrivo</th>
                <th scope="col">Durata</th>
                <th scope="col">Att. tra mezzi</th>
            </tr>
            </thead>
            <tbody>
            {#each viaggio.andata.normale as mezzo, i}
                <tr>
                    <td><i class="fa fa-{mezzo.icona}"></i> {mezzo.nome}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoPartenza}">{mezzo.oraPartenza}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoArrivo}">{mezzo.oraArrivo}</td>
                    <td>{durataMezzo(viaggio.andata.normale, i)} min</td>
                    <td>{attesaTraMezzi(viaggio.andata.normale, i)} min</td>
                </tr>
            {/each}
            </tbody>
        </table>-->

        <p class="h3 text-danger-emphasis bg-light-subtle bg-opacity-25 pt-1 pb-2 rounded-4 mt-3">Nessuna lezione? <span class="text-primary-emphasis">Per ora...</span></p>

        <div class="row justify-content-center mt-4">
            <div class="col-auto">
                <h2 class="shadow px-5 pt-1 pb-1 rounded bg-success bg-opacity-10">Normale Ritorno:</h2>
            </div>
        </div>

        <!-- Tabella normale ritorno -->
        <!--<table class="table table-hover table-striped shadow mt-3">
            <thead>
            <tr>
                <th scope="col">Mezzo</th>
                <th scope="col">Partenza</th>
                <th scope="col">Arrivo</th>
                <th scope="col">Durata</th>
                <th scope="col">Att. tra mezzi</th>
            </tr>
            </thead>
            <tbody>
            {#each viaggio.ritorno.normale as mezzo, i}
                <tr>
                    <td><i class="fa fa-{mezzo.icona}"></i> {mezzo.nome}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoPartenza}">{mezzo.oraPartenza}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoArrivo}">{mezzo.oraArrivo}</td>
                    <td>{durataMezzo(viaggio.ritorno.normale, i)} min</td>
                    <td>{attesaTraMezzi(viaggio.ritorno.normale, i)} min</td>
                </tr>
            {/each}
            </tbody>
        </table>-->
        <p class="h3 text-danger-emphasis bg-light-subtle bg-opacity-25 pt-1 pb-2 rounded-4 mt-4">Sul momento, <span class="text-primary-emphasis">ormai abbiamo imparato!</span></p>

        <hr class="mt-5 mb-5">

        <div class="row justify-content-center">
            <div class="col-auto">
                <h2 class="shadow px-5 pt-1 pb-1 rounded bg-primary bg-opacity-10">Anticipatario Andata <strong class="text-danger-emphasis">(NO)</strong>:</h2>
            </div>
        </div>

        <!-- Tabella anticipatario -->
        <table class="table table-hover table-striped shadow mt-3">
            <thead>
            <tr>
                <th scope="col">Mezzo</th>
                <th scope="col">Partenza</th>
                <th scope="col">Arrivo</th>
                <th scope="col">Durata</th>
                <th scope="col">Att. tra mezzi</th>
            </tr>
            </thead>
            <tbody>
            {#each viaggio.andata.anticipatario as mezzo, i}
                <tr>
                    <td><i class="fa fa-{mezzo.icona}"></i> {mezzo.nome}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoPartenza}">{mezzo.oraPartenza}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoArrivo}">{mezzo.oraArrivo}</td>
                    <td>{durataMezzo(viaggio.andata.anticipatario, i)} min</td>
                    <td>{attesaTraMezzi(viaggio.andata.anticipatario, i)} min</td>
                </tr>
            {/each}
            </tbody>
        </table>

        <div class="row justify-content-center mt-4">
            <div class="col-auto">
                <h2 class="shadow px-5 pt-1 pb-1 rounded bg-primary bg-opacity-10">Anticipatario Ritorno <strong class="text-danger-emphasis">(NO)</strong>:</h2>
            </div>
        </div>

        <!-- Tabella anticipatario ritorno -->
        <table class="table table-hover table-striped shadow mt-3">
            <thead>
            <tr>
                <th scope="col">Mezzo</th>
                <th scope="col">Partenza</th>
                <th scope="col">Arrivo</th>
                <th scope="col">Durata</th>
                <th scope="col">Att. tra mezzi</th>
            </tr>
            </thead>
            <tbody>
            {#each viaggio.ritorno.anticipatario as mezzo, i}
                <tr>
                    <td><i class="fa fa-{mezzo.icona}"></i> {mezzo.nome}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoPartenza}">{mezzo.oraPartenza}</td>
                    <td data-bs-toggle="tooltip" data-bs-placement="top" title="{mezzo.luogoArrivo}">{mezzo.oraArrivo}</td>
                    <td>{durataMezzo(viaggio.ritorno.anticipatario, i)} min</td>
                    <td>{attesaTraMezzi(viaggio.ritorno.anticipatario, i)} min</td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .fa-bus {
        color: var(--color-bus) !important;
    }

    .fa-train {
        color: var(--color-train) !important;
    }

    .fa-ship {
        color: var(--color-ship) !important;
    }
</style>