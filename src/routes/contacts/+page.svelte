<script>
    import {onMount} from "svelte";
    import ContactCard from "$lib/components/ContactCard.svelte";
    import Seo from "$lib/components/Seo.svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    const contacts = [
        {
            title: "Github",
            description: "Check out my code repositories and projects",
            icon: "fab fa-github",
            link: "https://github.com/GABRYCA",
            aos_delay: "100"
        },
        {
            title: "Linkedin",
            description: "Connect with me professionally",
            icon: "fab fa-linkedin",
            link: "https://www.linkedin.com/in/gabriele-caretti-046408270/",
            aos_delay: "200"
        },
        {
            title: "Youtube",
            description: "Watch my videos",
            icon: "fab fa-youtube",
            link: "https://www.youtube.com/@anonymousgca5331",
            aos_delay: "300"
        },
        {
            title: "Crypto",
            description: "Innovative 'currencies'",
            icon: "fas fa-globe",
            link: "https://ud.me/anonymousgca.crypto",
            aos_delay: "400"
        },
        {
            title: "Reddit",
            description: "Join discussions with me on Reddit",
            icon: "fab fa-reddit",
            link: "https://www.reddit.com/u/AnonymousGCA",
            aos_delay: "500"
        },
        {
            title: "Discord",
            description: "Chat with me on Discord",
            icon: "fab fa-discord",
            link: "https://discord.gg/RSp2CSuMny",
            aos_delay: "600"
        },
        {
            title: "Email",
            description: "Send me a direct message",
            icon: "fas fa-envelope",
            link: "mailto:anonymousgca@anonymousgca.eu",
            aos_delay: "700"
        }
    ];
</script>

<Seo></Seo>

<div class="contacts-page">
    <div class="container-xxl mt-4 mt-md-5">
        <div class="row">
            <div class="col-12" data-aos="fade-up">
                <h1 class="contacts-title">Connect With Me</h1>
                <p class="text-muted w-md-50">Feel free to reach out through any of these platforms. I'm always open to new connections, collaborations, and conversations...</p>
            </div>
            <div class="col-12 mt-4">
                <div class="row justify-content-center gy-2 gy-md-4 gx-0 gx-md-3">
                    {#each contacts as contact (contact.title)}
                        <ContactCard
                                title={contact.title}
                                description={contact.description}
                                icon={contact.icon}
                                link={contact.link}
                                aos_delay={contact.aos_delay}
                        />
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
