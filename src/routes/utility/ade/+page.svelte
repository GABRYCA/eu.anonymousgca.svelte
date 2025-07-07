<script>
    import {onMount} from "svelte";
    import Seo from "$lib/components/Seo.svelte";

    let numberInput = $state(2);
    let unitSelect = $state('Byte');
    let result = $state('');
    let bitInput = $state(0);
    let byteResult = $state('');
    let byteResultOffset = $state('');
    let resultCache = $state('');
    let resultMemory = $state('');
    let exponentInput = $state(0);
    let powerResult = $state('');
    let memoryInput = $state(0);
    let memoryScale = $state('Byte');
    let wordInput = $state(0);
    let cacheInput = $state(0);
    let cacheScale = $state('Byte');
    let binaryInput = $state('');
    let decimalInput = $state('');
    let binaryResult = $state('');
    let decimalResult = $state('');

    const unitPowers = {
        'Byte': 0,
        'KB': 10,
        'MB': 20,
        'GB': 30
    };

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    function calculatePowerOfTwo(number) {
        if ((number & (number - 1)) === 0 && number !== 0) {
            if (number < 0) {
                return '<p class="text-danger mb-0">Valore non valido (Minore di 0)</p>';
            }
            if (number >= 1024) {
                return '<p class="text-danger mb-0">Cambia scala, n >= 1024 sale al grado successivo!</p>'
            }
            return Math.log2(number);
        } else {
            return '<p class="text-danger mb-0">Inserire una potenza di 2 (valori possibili: 2, 4, 8, 16, 32, 64, 128, 256, 512)</p>';
        }
    }

    function convertBitsToBytes(bits) {
        if (bits % 8 !== 0) {
            return '<p class="text-danger mb-0">Inserire un multiplo di 8</p>';
        }
        return bits / 8;
    }

    function binaryToDecimal(e) {
        e.preventDefault();
        binaryResult = parseInt(binaryInput, 2).toString(10);
    }

    function decimalToBinary(e) {
        e.preventDefault();
        decimalResult = parseInt(decimalInput, 10).toString(2);
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log(numberInput, unitSelect);
        let power = numberInput !== 0 ? calculatePowerOfTwo(numberInput) : 0;

        if (isNaN(power)) {
            result = power;
            return;
        }

        let totalPower = power + unitPowers[unitSelect];
        let parola = totalPower === 1 ? 'Serve' : 'Servono';
        let parolaBit = totalPower === 1 ? 'Bit' : 'Bits';
        result = `<p class='mt-2 mb-0 fs-3 text-info'>2<sup class='text-warning'>${totalPower}</sup> (${parola} ${totalPower} ${parolaBit})</p>`;
    }

    function handleBitSubmit(e) {
        e.preventDefault();
        let bytes = convertBitsToBytes(bitInput);
        if (isNaN(bytes)) {
            byteResult = bytes;
            return;
        }

        let power = 0;
        while (Math.pow(2, power) < bytes) {
            power++;
        }
        if (bytes === 1) {
            power++;
        }

        let parola = power === 1 ? 'Basta' : 'Bastano';
        let parolaBit = power === 1 ? 'Bit' : 'Bits';
        byteResult = `<p class='mt-2 mb-0 fs-3 text-info'>${bytes} Byte - 2<sup class='text-warning'>${power}</sup> (${parola} ${power} ${parolaBit})</p>`;
    }

    function handlePowerSubmit(e) {
        e.preventDefault();
        if (exponentInput < 0) {
            powerResult = '<p class="text-danger mb-0">Inserire un valore maggiore o uguale a 0</p>';
            return;
        }
        powerResult = Math.pow(2, exponentInput);
    }


    function handleMemorySubmit(e) {
        e.preventDefault();
        let power = memoryInput !== 0 ? calculatePowerOfTwo(memoryInput) : 0;

        if (isNaN(power)) {
            resultMemory = power;
            return;
        }

        let totalPower = power + unitPowers[memoryScale];
        let parola = totalPower === 1 ? 'Serve' : 'Servono';
        let parolaBit = totalPower === 1 ? 'Bit' : 'Bits';
        resultMemory = `<p class='mt-2 mb-0 fs-3 text-info'>2<sup class='text-warning'>${totalPower}</sup> (${parola} ${totalPower} ${parolaBit})</p>`;
    }

    function handleBlockSubmit(e) {
        e.preventDefault();
        let bytes = convertBitsToBytes(bitInput);
        if (isNaN(bytes)) {
            byteResultOffset = bytes;
            return;
        }

        let powerBytes = 0;
        while (Math.pow(2, powerBytes) < bytes) {
            powerBytes++;
        }
        if (bytes === 1) {
            powerBytes++;
        }

        let powerWords = 0;
        while (Math.pow(2, powerWords) < wordInput) {
            powerWords++;
        }

        let totalPower = powerBytes + powerWords;
        let parola = totalPower === 1 ? 'Basta' : 'Bastano';
        let parolaBit = totalPower === 1 ? 'Bit' : 'Bits';
        byteResultOffset = `<p class='mt-2 mb-0 fs-3 text-info'>2<sup class='text-warning'>${totalPower}</sup> (${parola} ${totalPower} ${parolaBit})</p>`;
    }

    function handleCacheSubmit(e) {
        e.preventDefault();
        let power = cacheInput !== 0 ? calculatePowerOfTwo(cacheInput) : 0;

        if (isNaN(power)) {
            resultCache = power;
            return;
        }

        let totalPower = power + unitPowers[cacheScale];
        let parola = totalPower === 1 ? 'Serve' : 'Servono';
        let parolaBit = totalPower === 1 ? 'Bit' : 'Bits';
        resultCache = `<p class='mt-2 mb-0 fs-3 text-info'>2<sup class='text-warning'>${totalPower}</sup> (${parola} ${totalPower} ${parolaBit})</p>`;
    }
</script>

<Seo></Seo>

<div class="container mt-5">
    <div class="card shadow">
        <div class="card-header bg-danger-subtle text-white">
            <h5 class="mb-0"><i class="fas fa-calculator"></i> Calcolatore Bit Memoria/Cache</h5>
        </div>
        <div class="card-body">
            <form onsubmit={handleSubmit}>
                <div class="row mb-3">
                    <div class="col-md-10 col-sm-12">
                        <label for="numberInput" class="form-label">Inserire potenza di 2, come 2, 4, 8... ossia <strong
                                class="text-warning">x</strong> per il calcolo <span class="text-info">log</span><sub
                                class="text-info">2</sub><strong class="text-warning">x</strong></label>
                        <input bind:value={numberInput} type="number" class="form-control shadow" id="numberInput"
                               min="0" max="1024" step="2">
                    </div>
                    <div class="col-md-2 col-sm-12">
                        <label for="unitSelect" class="form-label mt-2 mt-md-0">Unità</label>
                        <select bind:value={unitSelect} class="form-select shadow" id="unitSelect">
                            <option>Byte</option>
                            <option>KB</option>
                            <option>MB</option>
                            <option>GB</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-primary bg-black bg-opacity-25 w-100">
                    <i class="fas fa-check"></i> Calcola
                </button>
            </form>
            {#if result !== ''}
                <div class="alert alert-info mt-3 mb-0" role="alert">
                    <h5 class="alert-heading"><i class="fas fa-info-circle"></i> Risultato:</h5>
                    {@html result}
                </div>
            {/if}
        </div>
    </div>
</div>

<div class="container mt-5">
    <div class="card shadow">
        <div class="card-header bg-danger-subtle text-white">
            <h5 class="mb-0"><i class="fas fa-calculator"></i> Convertitore Bit a Byte</h5>
        </div>
        <div class="card-body">
            <form onsubmit={handleBitSubmit}>
                <div class="row mb-3">
                    <div class="col-12">
                        <label for="bitInput" class="form-label">Numero di Bit (multiplo di 8, solitamente 16, 32, 64
                            etc...)</label>
                        <input bind:value={bitInput} type="number" class="form-control shadow" id="bitInput" min="0"
                               step="8">
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-primary bg-black bg-opacity-25 w-100"><i
                        class="fas fa-check"></i> Converti
                </button>
            </form>
            {#if byteResult !== ''}
                <div class="alert alert-info mt-3 mb-0" role="alert">
                    <h5 class="alert-heading"><i class="fas fa-info-circle"></i> Risultato:</h5>
                    {@html byteResult}
                </div>
            {/if}
        </div>
    </div>
</div>

<div class="container mt-5">
    <div class="card shadow">
        <div class="card-header bg-danger-subtle text-white">
            <h5 class="mb-0"><i class="fas fa-calculator"></i> Calcolatore Potenza di 2</h5>
        </div>
        <div class="card-body">
            <form onsubmit={handlePowerSubmit}>
                <div class="row justify-content-start">
                    <div class="col-12 mb-2">
                        <label for="exponentInput" class="form-label">Inserire esponente di <strong
                                class="text-info">2</strong>, ossia <strong class="text-warning">x</strong> di <strong
                                class="text-info">2</strong><sup class="text-warning"><strong>x</strong></sup></label>
                    </div>
                    <div class="col-auto mt-3 pe-1">
                        <p class="fs-3">2</p>
                    </div>
                    <div class="col-auto ps-0">
                        <input bind:value={exponentInput} type="number" class="form-control shadow" id="exponentInput"
                               min="0" max="99">
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-primary bg-black bg-opacity-25 w-100"><i
                        class="fas fa-check"></i> Calcola
                </button>
            </form>
            {#if powerResult !== ''}
                <div class="alert alert-info mt-3 mb-0" role="alert">
                    <h5 class="alert-heading"><i class="fas fa-info-circle"></i> Risultato:</h5>
                    <p>{powerResult}</p>
                </div>
            {/if}
        </div>
    </div>
</div>

<div class="container mt-5">
    <p class="h1 text-center">Calcolatori Indirizzamenti di memoria</p>
    <hr class="text-light">


    <div class="card shadow">
        <div class="card-header bg-danger-subtle text-white">
            <h5 class="mb-0"><i class="fas fa-calculator"></i> Calcolatore dimensione memoria totale:</h5>
        </div>
        <div class="card-body">
            <form onsubmit={handleMemorySubmit}>
                <div class="row mb-3">
                    <div class="col-md-10 col-sm-12">
                        <label for="memoryInput" class="form-label">Inserire la quantità di memoria</label>
                        <input bind:value={memoryInput} type="number" class="form-control shadow" id="memoryInput"
                               min="0" max="1024" step="2">
                    </div>
                    <div class="col-md-2 col-sm-12">
                        <label for="memoryScale" class="form-label mt-2 mt-md-0">Scala</label>
                        <select bind:value={memoryScale} class="form-select shadow" id="memoryScale">
                            <option>Byte</option>
                            <option>KB</option>
                            <option>MB</option>
                            <option>GB</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-primary bg-black bg-opacity-25 w-100"><i
                        class="fas fa-check"></i> Calcola
                </button>
            </form>
            {#if resultMemory !== ''}
                <div class="alert alert-info mt-3 mb-0" role="alert">
                    <h5 class="alert-heading"><i class="fas fa-info-circle"></i> Risultato:</h5>
                    {@html resultMemory}
                </div>
            {/if}
        </div>
    </div>


    <hr class="text-light">

    <div class="card shadow">
        <div class="card-header bg-danger-subtle text-white">
            <h5 class="mb-0"><i class="fas fa-calculator"></i> Calcolatore dimensione blocco/<span class="text-info">offset</span>:
            </h5>
        </div>
        <div class="card-body">
            <form onsubmit={handleBlockSubmit}>
                <div class="row mb-3">
                    <div class="col-md-6 col-sm-12">
                        <label for="wordInput" class="form-label">Inserire il numero di parole</label>
                        <input bind:value={wordInput} type="number" class="form-control shadow" id="wordInput" min="0"
                               max="1024" step="2">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        <label for="bitInput" class="form-label mt-2 mt-md-0">Inserire il numero di bit per
                            parola</label>
                        <input bind:value={bitInput} type="number" class="form-control shadow" id="bitInput" min="0"
                               max="1024" step="2">
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-primary bg-black bg-opacity-25 w-100"><i
                        class="fas fa-check"></i> Calcola
                </button>
            </form>
            {#if byteResultOffset !== ''}
                <div class="alert alert-info mt-3 mb-0" role="alert">
                    <h5 class="alert-heading"><i class="fas fa-info-circle"></i> Risultato:</h5>
                    {@html byteResultOffset}
                </div>
            {/if}
        </div>
    </div>


    <hr class="text-light">

    <div class="card shadow">
        <div class="card-header bg-danger-subtle text-white">
            <h5 class="mb-0"><i class="fas fa-calculator"></i> Calcolatore dimensione memoria cache:</h5>
        </div>
        <div class="card-body">
            <form onsubmit={handleCacheSubmit}>
                <div class="row mb-3">
                    <div class="col-md-10 col-sm-12">
                        <label for="cacheInput" class="form-label">Inserire la dimensione della cache</label>
                        <input bind:value={cacheInput} type="number" class="form-control shadow" id="cacheInput" min="0"
                               max="1024" step="2">
                    </div>
                    <div class="col-md-2 col-sm-12">
                        <label for="cacheScale" class="form-label mt-2 mt-md-0">Scala</label>
                        <select bind:value={cacheScale} class="form-select shadow" id="cacheScale">
                            <option>Byte</option>
                            <option>KB</option>
                            <option>MB</option>
                            <option>GB</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-primary bg-black bg-opacity-25 w-100"><i
                        class="fas fa-check"></i> Calcola
                </button>
            </form>
            {#if resultCache !== ''}
                <div class="alert alert-info mt-3 mb-0" role="alert">
                    <h5 class="alert-heading"><i class="fas fa-info-circle"></i> Risultato:</h5>
                    {@html resultCache}
                </div>
            {/if}
        </div>
    </div>
</div>

<div class="container mt-5">

    <div class="row">
        <div class="col">
            <p class="h2 text-center mt-1">Calcolatori binari</p>
        </div>
    </div>

    <hr class="text-light">

    <div class="row">
        <div class="col-md-6 col-sm-12">
            <div class="card shadow">
                <div class="card-header bg-danger-subtle">
                    <h5 class="mb-0"><i class="fas fa-calculator"></i> Convertitore Binario Decimale</h5>
                </div>
                <div class="card-body">
                    <form onsubmit={binaryToDecimal}>
                        <div class="input-group mb-3">
                            <input bind:value={binaryInput} type="text" class="form-control"
                                   placeholder="Inserire numero binario">
                            <button class="btn btn-outline-secondary" type="submit" aria-label="Binario a Decimale">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                    {#if binaryResult !== ''}
                        <div class="alert alert-success" role="alert">
                            Decimale: {binaryResult}
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <div class="col-md-6 col-sm-12">
            <div class="card">
                <div class="card-header bg-danger-subtle">
                    <h5 class="mb-0"><i class="fas fa-calculator"></i> Convertitore Decimale Binario</h5>
                </div>
                <div class="card-body">
                    <form onsubmit={decimalToBinary}>
                        <div class="input-group mb-3">
                            <input bind:value={decimalInput} type="text" class="form-control"
                                   placeholder="Inserire numero decimale">
                            <button class="btn btn-outline-secondary" type="submit" aria-label="Decimale a Binario"><i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                    {#if decimalResult !== ''}
                        <div class="alert alert-success" role="alert">
                            Binario: {decimalResult}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

</div>