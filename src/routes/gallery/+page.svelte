<script>
    import {onMount} from "svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<div class="container">
    <div class="row mb-5">
        <div class="col text-center">
            <p class="h1 mt-3">Not just a gallery:</p>
            <p class="h5">Art here tells a story and is AI generated. Thanks Dall-E!</p>
            <hr class="mb-5">
            <div class="row">
                <div class="col">

                    <div class="row justify-content-center" data-aos="slide-up" data-aos-duration="1000">
                        <div class="col col-xxl-10">
                            <p class="h2">How did I get here?</p>
                            <a href="/img/story-tfs/1%20-%20Unknown%20place.webp" target="_blank"><img class="img-fluid w-75 rounded-5 zoom" src="img/story-tfs/1%20-%20Unknown%20place.png" alt="The first story"></a>
                        </div>
                    </div>

                    <hr class="mt-5 mb-5">

                    <div class="row justify-content-center" data-aos="slide-up" data-aos-duration="1000">
                        <div class="col col-xxl-10">
                            <p class="h2">Cold night...</p>
                            <a href="/img/story-tfs/2%20-%20Basics%20for%20surviving.webp" target="_blank"><img class="img-fluid w-75 rounded-5 zoom" src="img/story-tfs/2%20-%20Basics%20for%20surviving.png" alt="The first story"></a>
                        </div>
                    </div>

                    <hr class="mt-5 mb-5">

                    <div class="row justify-content-center" data-aos="slide-up" data-aos-duration="1000">
                        <div class="col col-xxl-10">
                            <p class="h2">Civilization on view...</p>
                            <a href="/img/story-tfs/3%20-%20Some%20civilization.webp" target="_blank"><img class="img-fluid w-75 rounded-5 zoom" src="img/story-tfs/3%20-%20Some%20civilization.png" alt="The first story"></a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .zoom {
        transition: transform .2s cubic-bezier(.17,.67,.67,.91);
    }
    .zoom:hover {
        transform: scale(1.1);
    }
</style>