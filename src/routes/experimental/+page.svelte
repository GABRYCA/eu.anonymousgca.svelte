<script>
    import {tooltip} from '$lib/actions/tooltip.js';
    import Tooltip from '$lib/components/Tooltip.svelte';


    const pages = 10000;
    const limit = 50;
    const limitCountEmpty = 5;
    let collectionId = $state('');
    let isCollectionActive = $state(false);
    let csvCollectionHoldersUrl = $state('');
    let fetchCollectionHoldersError = $state('');
    let holdersTempTotal = $state(null);
    let holdersProgressCounter = $state(null);
    let pagesHoldersProgressCounter = null;

    async function handleCollectionHoldersFetch(event) {
        event.preventDefault();
        if (isCollectionActive) return;
        if (collectionId.length !== 64) {
            fetchCollectionHoldersError = 'Collection ID must be 64 characters long';
            return;
        }
        isCollectionActive = true;

        const url = 'https://pro-api.solscan.io/v1.0/public/nft/collection/stats?collectionId=' + collectionId + '&filter=holders&'
        const holders = await getHoldersFromUrl(url);

        if (holders.length === 0) {
            fetchCollectionHoldersError = 'No holders found';
        } else {
            const csv = [
                ['Holder', 'Quantity', 'Percentage'],
                ...holders.map(({wallet_address, value, percentage}) => [wallet_address, value, percentage])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], {type: 'text/csv'});

            csvCollectionHoldersUrl = URL.createObjectURL(blob);
        }

        holdersTempTotal = null;
        holdersProgressCounter = null;
        pagesHoldersProgressCounter = null;
        isCollectionActive = false;
    }

    async function getHoldersFromUrl(url) {
        let offset = 0;

        let result = [];
        let total = null;
        let countEmpty = 0;

        for (let i = 0; i < pages; i++) {
            pagesHoldersProgressCounter = i;

            if ((total != null && (total * 10) <= offset) || countEmpty > limitCountEmpty) {
                return result;
            }

            // Increment offset
            offset = i * limit;

            // Build URL
            const tempUrl = url + 'offset=' + offset + '&limit=' + limit;

            //console.log('tempUrl', tempUrl);

            // Fetch data
            await fetch(tempUrl)
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                    if (total == null) {
                        total = data.data.total;
                        holdersTempTotal = total;
                        //console.log('Total: ', total);
                    }
                    const tempData = data.data.data;
                    if (tempData.length === 0) {
                        countEmpty++;
                    }
                    for (let j = 0; j < tempData.length; j++) {
                        const alreadyExists = result.some(item => item.wallet_address === tempData[j].wallet_address);
                        if (!alreadyExists) {
                            result.push(tempData[j]);
                        }
                    }
                });

            // Print number of elements
            //console.log('Number of elements: ', result.length);
            holdersProgressCounter = result.length;
        }

        return result;
    }
</script>

<div class="container">
    <!-- Tooltip Demo Section -->
    <div class="row text-center mt-4 mb-5">
        <div class="col">
            <h1>New Svelte 5 Tooltip System</h1>
            <p class="text-muted">Hover over these elements to see the new tooltips in action!</p>
        </div>
    </div>

    <div class="row mb-5">
        <div class="col-md-4">
            <div class="card bg-dark bg-opacity-50 h-100">
                <div class="card-header">
                    <h6>Basic Tooltips</h6>
                </div>
                <div class="card-body">
                    <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-sm btn-primary" use:tooltip={{ text: 'Top tooltip', placement: 'top' }}>
                            Top
                        </button>
                        <button class="btn btn-sm btn-primary"
                                use:tooltip={{ text: 'Bottom tooltip', placement: 'bottom' }}>Bottom
                        </button>
                        <button class="btn btn-sm btn-primary"
                                use:tooltip={{ text: 'Left tooltip', placement: 'left' }}>Left
                        </button>
                        <button class="btn btn-sm btn-primary"
                                use:tooltip={{ text: 'Right tooltip', placement: 'right' }}>Right
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card bg-dark bg-opacity-50 h-100">
                <div class="card-header">
                    <h6>Themed Tooltips</h6>
                </div>
                <div class="card-body">
                    <div class="d-flex flex-wrap gap-2">
                        <span class="badge bg-secondary" use:tooltip={{ text: 'Dark theme', theme: 'dark' }}>Dark</span>
                        <span class="badge bg-light text-dark" use:tooltip={{ text: 'Light theme', theme: 'light' }}>Light</span>
                        <span class="badge bg-primary"
                              use:tooltip={{ text: 'Primary theme', theme: 'primary' }}>Primary</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card bg-dark bg-opacity-50 h-100">
                <div class="card-header">
                    <h6>Component Wrapper</h6>
                </div>
                <div class="card-body">
                    <Tooltip text="Using component wrapper" theme="primary">
                        <button class="btn btn-sm btn-success">Hover me</button>
                    </Tooltip>
                </div>
            </div>
        </div>
    </div>

    <hr class="mb-5">

    <!-- Original experimental content -->
    <div class="row text-center mt-4">
        <div class="col">
            <h1>SolScan GCA API</h1>
            <!-- Small text red, patched with neon -->
            <p class="text-danger-emphasis">Solana changed again, may not work!</p>
        </div>
    </div>
    <div class="row text-center border border-primary rounded-4 bg-black bg-opacity-50 p-3 pt-2 mt-2">
        <div class="col-12">
            <h4>Get NFT Collection Holders</h4>
        </div>
        <!-- Form to input NFT collection id and then send request to the API -->
        <div class="col">
            <form onsubmit={handleCollectionHoldersFetch}>
                <div class="form-group text-start">
                    <label for="collectionId">Collection ID</label>
                    <input type="text" class="form-control" id="collectionId"
                           placeholder="Example: 4a2d96b22ab0c8f01cb5ce5bc960b627c2a8271529ae5132d5352b7c86b3b54d"
                           bind:value={collectionId} minlength="64" maxlength="64" required>
                </div>
                <!-- Progress status using counters -->
                {#if isCollectionActive}
                    <!-- Waiting for first request -->
                    {#if !holdersTempTotal}
                        <div class="col">
                            <div class="progress mt-2">
                                <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0"
                                     aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="mt-2">
                                <p class="mb-0">Holders: Waiting for first request</p>
                            </div>
                        </div>
                    {:else}
                        <div class="col">
                            <div class="progress mt-2">
                                <div class="progress-bar" role="progressbar"
                                     style="width: {holdersProgressCounter ? (holdersProgressCounter / holdersTempTotal) * 100 : 0}%;"
                                     aria-valuenow={holdersProgressCounter} aria-valuemin="0"
                                     aria-valuemax={holdersTempTotal}></div>
                            </div>
                            <div class="mt-2">
                                <p class="mb-0">Holders: Loaded / Expected Total (Unreliable, SolScan API has broken
                                    counter)</p>
                                <span>{holdersProgressCounter ? holdersProgressCounter : 0}
                                    / {holdersTempTotal ? holdersTempTotal : 0}</span>
                            </div>
                        </div>
                    {/if}
                {/if}
                <button type="submit"
                        class="btn btn-primary mt-1 w-100 {isCollectionActive ? 'disabled' : ''}">{isCollectionActive ? 'Loading...' : 'Submit'}</button>
            </form>
        </div>
        <!-- Error message using alert -->
        {#if fetchCollectionHoldersError}
            <div class="col">
                <div class="alert alert-danger mt-2" role="alert">
                    {fetchCollectionHoldersError}
                </div>
            </div>
        {/if}
        {#if csvCollectionHoldersUrl}
            <div class="col-12">
                <a href={csvCollectionHoldersUrl} download="holders.csv" class="btn btn-success mt-2 w-100"><i
                        class="fas fa-solid fa-file-csv"></i> Download CSV</a>
            </div>
        {/if}
    </div>

    <!-- Disclaimer -->
    <div class="row text-center mt-2">
        <div class="col">
            <p class="text-muted">Disclaimer: This is a proof of concept, results may vary and API may be unreliable,
                use at your own risk!</p>
        </div>
    </div>
</div>

<!--
<a href={url} download="holders.csv">Download CSV</a>
-->