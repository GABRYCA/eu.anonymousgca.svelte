<script>
    import {onMount} from "svelte";
    import SVGWave from "$lib/components/SVGWave.svelte";

    let { data } = $props();
    let { websites, stacks } = $state(data);

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<!-- Page title -->
<div class="row justify-content-center mt-5">
    <div class="col-12">
        <p class="h1 text-center" data-aos="fade-up">Projects</p>
    </div>
</div>

<SVGWave data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z" />

<!-- Websites projects -->
<div class="row justify-content-center pt-3 pb-5 bg-black bg-opacity-25 mt-0 gy-3">
    <div class="col-12 text-center mb-2" data-aos="zoom-in">
        <p class="h2 mb-0">Websites</p>
        <p class="text-muted">Some websites I've built in the past</p>
    </div>
    {#each websites as website, index (website.url)}
        <div class="col-12 col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay={150*(index+1)}>
            <button class="btn btn-primary w-100 rounded-5 p-1" type="button" data-bs-toggle="collapse" data-bs-target="#{website.url}" aria-expanded="false" aria-controls="{website.url}">
                {website.title}
                <a href="{website.url}" target="_blank" data-bs-toggle="tooltip" data-bs-placement="top" title="Open in a new tab" aria-label="{website.url}">
                    <span class="fa-stack">
                        <i class="fas fa-circle fa-stack-2x"></i>
                        <i class="fas fa-external-link-alt fa-stack-1x fa-inverse"></i>
                    </span>
                </a>
            </button>
            <div class="collapse" id="{website.url}">
                <iframe src="{website.url}" class="w-100 rounded-5 shadow mt-2" height="500px" title="{websites.title}"></iframe>
            </div>
        </div>
    {/each}
</div>

<SVGWave rotation="180" data="M0,84L60,107.3C120,131,240,177,360,205.3C480,233,600,243,720,210C840,177,960,103,1080,102.7C1200,103,1320,177,1440,182C1560,187,1680,121,1800,107.3C1920,93,2040,131,2160,154C2280,177,2400,187,2520,186.7C2640,187,2760,177,2880,163.3C3000,149,3120,131,3240,126C3360,121,3480,131,3600,149.3C3720,168,3840,196,3960,196C4080,196,4200,168,4320,140C4440,112,4560,84,4680,93.3C4800,103,4920,149,5040,182C5160,215,5280,233,5400,214.7C5520,196,5640,140,5760,130.7C5880,121,6000,159,6120,168C6240,177,6360,159,6480,140C6600,121,6720,103,6840,116.7C6960,131,7080,177,7200,172.7C7320,168,7440,112,7560,98C7680,84,7800,112,7920,107.3C8040,103,8160,65,8280,74.7C8400,84,8520,140,8580,168L8640,196L8640,280L8580,280C8520,280,8400,280,8280,280C8160,280,8040,280,7920,280C7800,280,7680,280,7560,280C7440,280,7320,280,7200,280C7080,280,6960,280,6840,280C6720,280,6600,280,6480,280C6360,280,6240,280,6120,280C6000,280,5880,280,5760,280C5640,280,5520,280,5400,280C5280,280,5160,280,5040,280C4920,280,4800,280,4680,280C4560,280,4440,280,4320,280C4200,280,4080,280,3960,280C3840,280,3720,280,3600,280C3480,280,3360,280,3240,280C3120,280,3000,280,2880,280C2760,280,2640,280,2520,280C2400,280,2280,280,2160,280C2040,280,1920,280,1800,280C1680,280,1560,280,1440,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z" />

<!-- Web Stack -->
<div class="row justify-content-center gy-2 mt-3 pb-md-5">
    <div class="col-12 text-center mb-2" data-aos="zoom-in">
        <p class="h2 mb-0">My Web Stack</p>
        <p class="text-muted">Some of my favourite tools for building websites</p>
    </div>
    {#each stacks as stack, index (stack.url)}
        <div class="col-12 col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay={150*(index+1)}>
            <a href="{stack.url}" target="_blank" class="btn btn-primary w-100 rounded-5 p-1" data-bs-toggle="tooltip" title="Open in a new tab">
                {stack.title}
                <span class="fa-stack">
                    <i class="fas fa-circle fa-stack-2x"></i>
                    <i class="fas fa-external-link-alt fa-stack-1x fa-inverse"></i>
                </span>
            </a>
        </div>
    {/each}
</div>

<style>
    .btn {
        background-color: rgba(255, 0, 170, 0.5) !important;
        box-shadow: 3px 3px #000000 !important;
        border: 1px solid rgba(255, 0, 170, 0.5) !important;
        filter: drop-shadow(0 0 0.5rem #d34cff) !important;
        transition: all 0.15s ease-in-out;
    }

    .btn:hover {
        background-color: rgba(255, 0, 170, 0.3) !important;
        border: 1px solid rgba(255, 0, 170, 1) !important;
        color: #ffffff !important;
    }

    .btn:focus {
        background-color: rgba(255, 0, 170, 0.3) !important;
        border: 1px solid rgba(255, 0, 170, 0.5) !important;
        color: #ffffff !important;
    }

    .fa-stack {
        color: rgba(48, 0, 35, 0.5);
    }
</style>