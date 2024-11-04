<script>
    import {onMount} from "svelte";
    import ContactCard from "$lib/components/ContactCard.svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<div class="row p-3 p-md-5">
    <div class="col">
        <h1 class="text-center mb-5 mt-4 mt-md-2" data-aos="fade-up">Contacts</h1>
        <div class="row justify-content-center">
            <ContactCard title="Github" icon="fab fa-github" link="https://github.com/GABRYCA" aos_delay="100"/>
            <ContactCard title="Linkedin" icon="fab fa-linkedin" link="https://www.linkedin.com/in/gabriele-caretti-046408270/" aos_delay="200"/>
            <ContactCard title="Youtube" icon="fab fa-youtube" link="https://www.youtube.com/channel/UCJgmoEFd6b9oOj2OvafuezQ" aos_delay="300"/>
            <ContactCard title="Crypto" icon="fas fa-globe" link="https://ud.me/anonymousgca.crypto" aos_delay="400"/>
            <ContactCard title="Reddit" icon="fab fa-reddit" link="https://www.reddit.com/u/AnonymousGCA" aos_delay="500"/>
            <ContactCard title="Discord" icon="fab fa-discord" link="https://discord.gg/RSp2CSuMny" aos_delay="600"/>
            <ContactCard title="Email" icon="fas fa-envelope" link="mailto:anonymousgca@anonymousgca.eu" aos_delay="700"/>
        </div>
    </div>
</div>