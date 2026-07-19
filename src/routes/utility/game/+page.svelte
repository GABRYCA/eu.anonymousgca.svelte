<script>
    import PixelRPG from '$lib/components/PixelRPG.svelte';
</script>

<div class="game-page container py-3 py-md-4">
    <header class="page-hero mb-4">
        <div class="page-hero__eyebrow">
            <i class="fas fa-gamepad" aria-hidden="true"></i>
            Utility · Game
        </div>
        <h1 class="page-hero__title game-title">Neon Grove</h1>
        <p class="page-hero__lead">
            A simple web-RPG concept that I've made. Wander a neon forest, poke friendly NPCs,
            bonk glitch-slimes, and stitch the night back together with three Source Shards.
        </p>
    </header>

    <PixelRPG/>

    <section class="panel-surface tips mt-4 p-3 p-md-4">
        <h2 class="h5 mb-3 tips-title">How to play</h2>
        <ul class="tips-list mb-0">
            <li><strong>Start</strong> with Space, Enter, or the big Action button.</li>
            <li><strong>Walk</strong> with WASD / arrow keys, or the on-screen D-pad on mobile.</li>
            <li><strong>Talk & loot</strong> by facing Owlbit, Fox.exe, chests, or shards, then pressing Action.</li>
            <li><strong>Battle</strong> when you bump a slime: Attack, drink a Glow Potion, or Flee.</li>
            <li><strong>Win</strong> by collecting all three shards and stepping on the purple portal.</li>
        </ul>
    </section>
</div>

<style>
    .game-title {
        font-weight: 800;
        letter-spacing: 0.02em;
        color: var(--primary-color);
        text-shadow: 0 0 1.25rem var(--primary-color-glow);
        text-wrap: balance;
    }

    .tips {
        border-color: var(--border-glow);
    }

    .tips-title {
        color: var(--primary-color);
        font-weight: 700;
    }

    .tips-list {
        padding-left: 1.15rem;
        color: var(--text-soft);
        line-height: 1.7;
        text-wrap: pretty;
    }

    .tips-list strong {
        color: var(--text-color-light);
    }

    .tips-list li + li {
        margin-top: 0.35rem;
    }
</style>
