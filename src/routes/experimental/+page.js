const pages = 100;
const limit = 50;

async function getHoldersFromUrl(url) {
    let offset = 0;

    let result = [];
    let total = null;
    let countEmpty = 0;

    for (let i = 0; i < pages; i++) {
        console.log('Fetching page: ', i);

        if ((total != null && (total * 10) <= offset) || countEmpty > 10) {
            console.log('Total reached. Exiting...');
            return result;
        }

        // Increment offset
        offset = i * limit;

        // Build URL
        const tempUrl = url + 'offset=' + offset + '&limit=' + limit;

        console.log('tempUrl', tempUrl);

        // Fetch data
        await fetch(tempUrl)
            .then(function(response) {
                return response.json();
            }).then(function(data) {
                if (total == null) {
                    total = data.data.total;
                    console.log('Total: ', total);
                }
                const tempData = data.data.data;
                if (tempData.length === 0) {
                    countEmpty++;
                }
                for (let j = 0; j < tempData.length; j++) {
                    const alreadyExists = result.some(item => item.wallet_address === tempData[j].wallet_address);
                    if (!alreadyExists){
                        result.push(tempData[j]);
                    }
                }
            });

        // Print number of elements
        console.log('Number of elements: ', result.length);

    }

    return result;
}

export const load = async ({}) => {

    //const pages = 3901;
    /*const pages = 100;
    const limit = 50;
    const url = 'https://pro-api.solscan.io/v1.0/public/nft/collection/stats?collectionId=4a2d96b22ab0c8f01cb5ce5bc960b627c2a8271529ae5132d5352b7c86b3b54d&filter=holders&'

    const holders = await getFromEndpoint(url, pages, limit)

    return { holders: holders };*/
    return {
        title: 'SolScan GCA\'s API',
        description: 'SolScan API of GCA.',
        keywords: 'SolScan, GCA, API, NFT, Collection, Holders'
    }
}