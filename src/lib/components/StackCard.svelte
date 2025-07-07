<script>
    import { scrollAnimation } from "$lib/actions/scrollAnimation.js";
    
    let {
        aos_animation = "fade-up",
        aos_delay = 100,
        icon = "fas fa-code",
        title = "Code",
        description = "",
        link = "#",
    } = $props();
</script>

    <div class="col-md-6 col-lg-4" use:scrollAnimation={{ animation: aos_animation, delay: aos_delay }}>
        <a href={link} target="_blank" class="text-decoration-none" data-bs-toggle="tooltip" data-bs-placement="top" title="Open in a new tab">
        <div class="card shadow h-100 rounded-4 bg-black bg-opacity-25 border-custom">
            <div class="card-body ps-4 pe-xl-5">
                <div class="row pt-2 px-1">
                    <div class="col-12">
                        <i class="{icon} bg-icon"></i>
                    </div>
                    <div class="col-12 mt-4 mb-2">
                        <h5 class="card-title fw-bold">{title}</h5>
                    </div>
                    <div class="col-12">
                        <p class="card-text text-muted">{description}</p>
                    </div>
                    <div class="col-12 mt-3">
                        <p class="text-decoration-none link-custom small">
                            Learn more <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </a>
    </div>

<style>
    .link-custom {
        transition: all 0.15s;
        color: #cd3dfb !important;
    }

    .link-custom:hover {
        filter: drop-shadow(0 0 0.5rem #d34cff);
    }

    .border-custom {
        border: 1px solid rgba(122, 18, 156, 0.2) !important;
    }

    .card {
        transition-duration: 0.25s;
    }

    .card:hover {
        box-shadow: 0 0 10px #7a129c !important;
    }

    .bg-icon {
        background: linear-gradient(45deg, #d34cff, #ff2b2b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 3rem;
        filter: drop-shadow(0 0 0.65rem #d34cff);
        animation: lights 5s 750ms linear infinite;
    }

</style>