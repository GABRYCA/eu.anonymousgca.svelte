<script>
    import SVGWave from "$lib/components/SVGWave.svelte";

    /** @type {{title?: string, icon?: string, icon_color?: string, title_color?: string}} */
    let {
        title = "Skill Title",
        icon = "fas fa-code",
        icon_color = "",
        title_color = ""
    } = $props();

</script>

<div class="col-12 col-lg-5 rounded-4 bg-black bg-opacity-10 border border-0 pb-5 element-skill" data-aos="zoom-in"
     data-aos-duration="600">
    <div class="row bg-black bg-opacity-25 pt-4 rounded-top-5">
        <div class="col">
            <p class="h2 text-center fw-bold second-text" style="color: {title_color} !important:">{title}</p>
        </div>
    </div>
    <SVGWave rotation="180" data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z" />
    <div class="row">
        <div class="col">
            <i class="{icon} fa-5x w-100 text-center" style="color: {icon_color} !important;"></i>
        </div>
    </div>
</div>

<style>

    @keyframes lights {
        0% {
            color: hsl(230, 40%, 80%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.2),
            0 0 0.125em hsla(320, 100%, 60%, 0.3),
            -1em -0.125em 0.5em hsla(40, 100%, 60%, 0),
            1em 0.125em 0.5em hsla(200, 100%, 60%, 0);
        }
        30% {
            color: hsl(230, 80%, 90%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 60%, 0.5),
            -0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2),
            0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4);
        }
        40% {
            color: hsl(230, 100%, 95%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 90%, 0.5),
            -0.25em -0.125em 0.125em hsla(40, 100%, 60%, 0.2),
            0.25em 0.125em 0.125em hsla(200, 100%, 60%, 0.4);
        }
        70% {
            color: hsl(230, 80%, 90%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 60%, 0.5),
            0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2),
            -0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4);
        }
        100% {
            color: hsl(230, 40%, 80%);
            will-change: text-shadow;
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.2),
            0 0 0.125em hsla(320, 100%, 60%, 0.3),
            1em -0.125em 0.5em hsla(40, 100%, 60%, 0),
            -1em 0.125em 0.5em hsla(200, 100%, 60%, 0);
        }
    }

    .element-skill {
        transition-duration: 0.3s !important;
        box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5), -1px -1px 5px #7a129c;
    }

    .element-skill:hover {
        transform: scale(1.05) !important;
        box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5), -1px -1px 10px #7a129c;
    }

    .fas {
        filter: drop-shadow(0 0 0.5rem #d34cff);
    }

    .second-text {
        margin: auto;
        font-weight: 300;
        color: hsl(230, 80%, 90%);
        text-shadow: 0 0 0.5rem #d34cff;
    }

    .border-custom {
        border: 1px outset rgba(122, 18, 156, 0.9) !important;
    }

    .fa-5x {
        transform: translateZ(0);
        animation: lights 5s 750ms linear infinite;
    }
</style>