<script>
    /** @type {{rgb?: string, data?: string}} */
    let { rgb = "52, 0, 78", data = "M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" } = $props();
</script>

<div class="row mt-5 mb-5 pt-1 pt-5">
    <div class="col px-0">
        <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
             viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
            <defs>
                <path id="gentle-wave" d="{data}"/>
            </defs>
            <g class="parallax">
                <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba({rgb},0.7)"/>
                <!-- <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba({rgb},0.5)"/>
                <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba({rgb},0.3)"/> -->
                <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba({rgb},1.0)"/>
            </g>
        </svg>
        <svg style="transform: rotate(180deg); height: 150px" class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
             viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
            <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"/>
            </defs>
            <g class="parallax">
                <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba({rgb},0.7)"/>
                <!-- <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba({rgb},0.5)"/>
                <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba({rgb},0.3)"/> -->
                <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba({rgb},1.0)"/>
            </g>
        </svg>
    </div>
</div>

<style>
    .waves {
        position: relative;
        width: 100%;
        height: 15vh;
        margin-bottom: -7px;
        min-height: 100px;
        max-height: 250px;
    }

    .parallax > use {
        animation: move-forever 25s cubic-bezier(.55, .5, .45, .5) infinite;
    }

    .parallax > use:nth-child(1) {
        animation-delay: -2s;
        animation-duration: 7s;
    }

    .parallax > use:nth-child(2) {
        animation-delay: -3s;
        animation-duration: 10s;
    }

    .parallax > use:nth-child(3) {
        animation-delay: -4s;
        animation-duration: 13s;
    }

    .parallax > use:nth-child(4) {
        animation-delay: -5s;
        animation-duration: 20s;
    }

    @keyframes move-forever {
        0% {
            transform: translate3d(-90px, 0, 0);
        }
        100% {
            transform: translate3d(85px, 0, 0);
        }
    }

    @media (max-width: 768px) {
        .waves {
            height: 40px;
            min-height: 40px;
        }
    }
</style>