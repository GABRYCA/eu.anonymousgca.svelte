<script>
    import ozerofront from"$lib/images/o-zero2w-front-optimized.webp";
    import ozeroangle from "$lib/images/o-zero2w-angled-optimized.webp";
    import orangelogo from "$lib/images/orange-logo-optimized.webp";
    import {onMount} from "svelte";
    import Seo from "$lib/components/Seo.svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<Seo></Seo>

<div class="container-xxl">
    <div class="row justify-content-center mt-4">
        <div class="col text-center">
            <p class="h1 title mt-4 mb-4" data-aos="fade-up">The Collection of Pi:</p>
        </div>
    </div>

    <div class="row mt-4" data-aos="fade-up">

        <!-- Raspberry Pi Zero 2W Info-->
        <div class="col-12 col-md-7 bg-black bg-opacity-50 p-4 pb-2 rounded-5 raspberry">
            <div class="row">
                <div class="col-12">
                    <p class="h4"><i class="fa-brands fa-raspberry-pi"></i> Raspberry Pi Zero 2W</p>
                    <p class="text-start mb-1">Deployment: <span class="text-primary-emphasis">25/12/2021</span> - Status: <span class="text-warning-emphasis">Retired</span></p>
                    <p class="text-start text-light opacity-50">[Replaced by Orange Pi]</p>
                    <hr>
                    <p>Always loved <b>Raspberry Pi</b> as an efficient, low power, little Linux Server. However, this one
                    specifically comes with some limitations:</p>
                    <ul>
                        <li class="text-danger">512MB RAM</li>
                        <li class="text-success-emphasis">4-Core 64Bit ARM CPU</li>
                        <li class="text-warning-emphasis">Slow 2.4GHz WiFi</li>
                        <li class="text-warning-emphasis">Bluetooth 4.2</li>
                        <li>1x Micro-USB 2.0</li>
                        <li>1x Mini HDMI</li>
                        <li>1x Power Micro USB</li>
                        <li>1x CSI Camera Connector</li>
                        <li>1x GPIO 40-pin</li>
                    </ul>
                    <p>Despite its very limited amount of RAM and the very slow WiFi (less than 40mbps), it served me well for many years,
                    even if with some hiccups:</p>
                    <ul>
                        <li class="text-success-emphasis">Terminal-Only, no desktop for my usage</li>
                        <li class="text-warning-emphasis">Always Swapping <span class="text-danger">(killed a 128GB Samsung EVO Plus Micro SD, luckily under warranty)</span></li>
                        <li class="text-warning-emphasis">Slow WiFi</li>
                        <li class="text-warning">Kept freezing and required a reboot (Pull the plug)</li>
                    </ul>
                    <hr>
                    <p class="h5">Usage:</p>
                    <ul>
                        <li>Docker Containers</li>
                        <li>Background Tasks (Passive Income)</li>
                        <li>Many experiments and emulators (Even learned about binfmt, and could even run AMD64 programs thanks to that!)</li>
                        <li>Little Webserver (APACHE)</li>
                    </ul>
                    <hr>
                    <p class="h5">Retired:</p>
                    <ul>
                        <li>December 2023</li>
                    </ul>
                    <hr>
                    <p class="h5">Replaced by:</p>
                    <ul>
                        <li>Orange Pi Zero 2W 4GB</li>
                    </ul>
                    <hr>
                    <p class="h5">Price (Time of buy):</p>
                    <ul>
                        <li class="text-success-emphasis">23€ including shipping fees</li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Raspberry Pi Zero 2W Images-->
        <div class="col-12 col-md-5 pt-5">
            <p class="text-center mt-md-5 opacity-25"><i class="fa-brands fa-raspberry-pi fa-10x text-light"></i></p>
            <img src="https://assets.raspberrypi.com/static/51035ec4c2f8f630b3d26c32e90c93f1/2b8d7/zero2-hero.webp" class="img-fluid rounded-5 mt-md-5 mx-auto d-block" alt="Raspberry Pi Zero 2W">
            <img src="https://assets.raspberrypi.com/static/f03a00485ac096c1033ad1c4a530d63b/6fe49/zero2-close-up.webp" class="img-fluid rounded-5 mt-md-5 mx-auto d-block" alt="Raspberry Pi Zero 2W">
        </div>

        <div class="col-12 mt-5 mb-5">
            <hr>
        </div>

        <!-- Orange pi zero 2W Images -->
        <div class="col-12 col-md-5 pt-5 pb-4">
            <img src="{orangelogo}" class="img-fluid rounded-5 mt-md-5 mx-auto d-block" alt="Orange Pi Zero 2W" />
            <img src="{ozeroangle}" class="img-fluid rounded-5 mt-3 mt-md-5 mx-auto d-block" alt="Raspberry Pi Zero 2W" />
            <img src="{ozerofront}" class="img-fluid rounded-5 mt-4 mt-md-5 mx-auto d-block" alt="Raspberry Pi Zero 2W" />
        </div>
        <!-- Orange Pi Zero 2W Info -->
        <div class="col-12 col-md-7 bg-black bg-opacity-50 p-4 pb-2 rounded-5 orange">
            <div class="row">
                <div class="col-12">
                    <p class="h4"> Orange Pi Zero 2W 4GB</p>
                    <p class="text-start mb-1">Deployment: <span class="text-primary-emphasis">01/12/2023</span> - Status: <span class="text-success-emphasis">Operational</span></p>
                    <hr>
                    <p>Intrigued by the specs and deal (28$) this alternative Raspberry Pi Zero 2W like clone got into my hands. Since then, I loved it!</p>
                    <ul>
                        <li class="text-success-emphasis">4GB RAM</li>
                        <li class="text-success-emphasis">4-Core 64Bit ARM CPU</li>
                        <li class="text-success-emphasis">2.4/5GHz WiFi 5</li>
                        <li class="text-success-emphasis">Bluetooth 5.0 BLE Support</li>
                        <li>1x USB-C 2.0</li>
                        <li>1x Mini HDMI</li>
                        <li>1x Power USB-C</li>
                        <li>1x CSI Camera Connector</li>
                        <li>1x GPIO 40-pin</li>
                    </ul>
                    <p>Despite its small price and sizes, those 4GB of LPDDR4 RAM are great, and the WiFi module, handles easily 100mbps.
                    However, it had some problems initially:</p>
                    <ul>
                        <li class="text-warning-emphasis">Not clear enough initial connection setup (All guides mentioned to use an ethernet
                        dongle, which I didn't have, but in the Ubuntu ISO image there was an hidden first_run config file which allowed after editing to enable and connect to WiFi
                        automatically</li>
                        <li class="text-warning-emphasis">Default <b><u>apt</u></b> Huawei Repositories (Thankfully you can change them through Linux configs back to ports.ubuntu.com and it works just fine)</li>
                    </ul>
                    <hr>
                    <p class="h5">Usage:</p>
                    <ul>
                        <li>Even more Docker Containers</li>
                        <li>Background Tasks (Passive Income)</li>
                        <li>Many experiments and emulators (Still using binfmt, and can run AMD64 programs thanks that)</li>
                        <li>Little Webserver (APACHE)</li>
                    </ul>
                    <hr>
                    <p class="h5">Price (Time of buy):</p>
                    <ul>
                        <li class="text-success-emphasis">About 27€ including shipping fees after change </li>
                    </ul>
                </div>
            </div>
        </div>

    </div>

</div>

<style>

    .h1.title {
        color: #ffffff;
        text-align: center;
        font-size: 2.5em;
        text-shadow: 0 0 5px #29ff10, 0 0 25px #29ff10, 0 0 50px #29ff10, 0 0 200px #29ff10;
        animation: glowing 2s infinite;
        transform: translateZ(0);
        will-change: transform, text-shadow;
    }

    @keyframes glowing {
        0% { text-shadow: 0 0 5px #29ff10, 0 0 25px #29ff10, 0 0 50px #29ff10, 0 0 200px #29ff10; }
        50% { text-shadow: 0 0 10px #29ff10, 0 0 20px #29ff10, 0 0 40px #29ff10, 0 0 80px #29ff10; }
        100% { text-shadow: 0 0 5px #29ff10, 0 0 25px #29ff10, 0 0 50px #29ff10, 0 0 200px #29ff10; }
    }

    /* Raspberry Pi */
    .bg-black.bg-opacity-50.p-4.pb-2.rounded-5.raspberry {
        position: relative;
        overflow: hidden;
    }

    .bg-black.bg-opacity-50.p-4.pb-2.rounded-5.raspberry::before,
    .bg-black.bg-opacity-50.p-4.pb-2.rounded-5.raspberry::after {
        content: "";
        position: absolute;
        top: -2px;
        left: -2px;
        width: calc(100% + 4px);
        height: calc(100% + 4px);
        background: linear-gradient(120deg, #000000, rgba(199, 5, 61, 0.25), #000000);
        z-index: -1;
        background-size: 300% 300%;
        animation: wave 25s linear infinite;
        transform: translateZ(0);
        will-change: transform, background-position;
    }

    /* Orange Pi */
    .bg-black.bg-opacity-50.p-4.pb-2.rounded-5.orange {
        position: relative;
        overflow: hidden;
    }

    .bg-black.bg-opacity-50.p-4.pb-2.rounded-5.orange::before,
    .bg-black.bg-opacity-50.p-4.pb-2.rounded-5.orange::after {
        content: "";
        position: absolute;
        top: -2px;
        left: -2px;
        width: calc(100% + 4px);
        height: calc(100% + 4px);
        background: linear-gradient(120deg, #000000, rgba(0, 89, 255, 0.2), #000000);
        z-index: -1;
        background-size: 300% 300%;
        animation: wave 25s linear infinite;
        transform: translateZ(0);
        will-change: transform, background-position;
    }

    /* Keyframes for the wave animation */
    @keyframes wave {
        0% { background-position: -100% 50%; }
        100% { background-position: 200% 50%; }
    }
</style>