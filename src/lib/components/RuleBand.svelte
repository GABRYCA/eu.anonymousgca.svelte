<script>
	/** @type {{ticks?: number, accentEvery?: number, goldAt?: number}} */
	let { ticks = 36, accentEvery = 9, goldAt = 35 } = $props();
</script>

<div class="rule-band" aria-hidden="true">
	<span class="rule-band__block"></span>
	<div class="rule-band__scale">
		{#each Array(ticks) as _, index (index)}
			<i class:is-accent={index % accentEvery === 0} class:is-gold={index === goldAt}></i>
		{/each}
	</div>
</div>

<style>
	.rule-band {
		display: flex;
		align-items: flex-end;
		gap: 0.9rem;
		padding-block: 1.75rem;
		padding-inline: clamp(1rem, 4vw, 3rem);
	}

	.rule-band__block {
		width: 0.6rem;
		height: 0.6rem;
		background: var(--azure);
		flex: none;
	}

	.rule-band__scale {
		display: flex;
		flex: 1;
		align-items: flex-end;
		justify-content: space-between;
		border-bottom: 1px solid var(--line);
	}

	.rule-band__scale i {
		display: block;
		width: 1px;
		height: 0.5rem;
		background: var(--line-strong);
		flex: none;
	}

	.rule-band__scale i.is-accent {
		height: 1.05rem;
		background: var(--azure);
	}

	.rule-band__scale i.is-gold {
		height: 1.05rem;
		background: var(--gold);
	}
</style>
