<script>
    /** @type {{aos_animation?: string, aos_delay?: string, title?: string, icon?: string, link?: string}} */
    let {
        aos_animation = "fade-up",
        aos_delay = "100",
        title = "Github",
        icon = "fab fa-github",
        link = "https://github.com/GABRYCA"
    } = $props();
</script>

<div class="col-md-6 col-lg-4 mb-4" data-aos="{aos_animation}" data-aos-delay="{aos_delay}">
    <div class="card shadow h-100 rounded-4 bg-black bg-opacity-25 border-custom">
        <div class="card-body d-flex flex-column justify-content-center">
            <h5 class="card-title text-center mb-3"><i class="{icon}"></i> {title}</h5>
            <p class="card-text text-center"><a class="link-custom" href="{link}" target="_blank" rel="author" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Open {title}"><i
                    class="fas fa-external-link-alt"></i> {title}</a></p>
        </div>
    </div>
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
        border: 1px solid rgba(122, 18, 156, 0.9) !important;
    }

    .card {
        transition-duration: 0.25s;
    }

    .card:hover {
        transform: scale(1.05);
        box-shadow: 0 0 10px #7a129c !important;
    }
</style>