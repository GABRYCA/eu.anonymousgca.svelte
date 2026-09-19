<script>
	import PixelRPG from '$lib/components/PixelRPG.svelte';
</script>

<div class="game-page container py-3 py-md-4">
	<header class="page-hero mb-4">
		<h1 class="page-hero__title game-title">Neon Grove</h1>
		<p class="page-hero__lead">
			A tiny web-RPG adventure in three levels. Wander the grove, haggle in the marsh, and face the Null King in the
			Core — shards, stardust, level-ups and a boss that carries the final shard. Progress autosaves in your browser
			until you erase it.
		</p>
	</header>

	<PixelRPG />

	<section class="panel-surface tips mt-4 p-3 p-md-4">
		<h2 class="h5 mb-3 tips-title">How to play</h2>
		<ul class="tips-list mb-0">
			<li><strong>Start</strong> with Space, Enter, or the big Action button — or Continue your saved run.</li>
			<li><strong>Walk</strong> with WASD / arrow keys, or the on-screen D-pad on mobile.</li>
			<li>
				<strong>Talk & loot</strong> by facing Owlbit, Marrow, chests, keys, or shards, then pressing Action. Coins, hearts,
				and keys pop on touch.
			</li>
			<li>
				<strong>Battle</strong> when you bump a foe: Attack, drink a Glow Potion, or Flee (the Null King won't let you).
			</li>
			<li>
				<strong>Grow</strong>: bonking foes earns XP and stardust. Level up for +1 max HP; spend stardust at Marrow's
				shop.
			</li>
			<li>
				<strong>Win</strong>: clear Lv.1 Grove (3 shards), Lv.2 Marsh (4 shards + locked chest), then Lv.3 Core — where
				the boss holds the 5th shard.
			</li>
			<li><strong>Saves</strong> persist in localStorage across visits; erase them only with the Erase button.</li>
		</ul>
	</section>
</div>

<style>
	.game-title {
		font-weight: 800;
		letter-spacing: 0.02em;
		color: var(--azure);
		text-wrap: balance;
	}

	.tips {
		border-color: var(--azure-line);
	}

	.tips-title {
		color: var(--azure);
		font-weight: 700;
	}

	.tips-list {
		padding-left: 1.15rem;
		color: var(--ink-soft);
		line-height: 1.7;
		text-wrap: pretty;
	}

	.tips-list strong {
		color: var(--ink);
	}

	.tips-list li + li {
		margin-top: 0.35rem;
	}
</style>
