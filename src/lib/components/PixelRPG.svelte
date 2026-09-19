<script>
	import { onMount } from 'svelte';
	import { createNeonGrove } from '$lib/game/neonGrove.js';
	import { LEVELS } from '$lib/game/levels.js';

	/** @type {HTMLCanvasElement | undefined} */
	let canvasEl = $state();
	/** @type {ReturnType<typeof createNeonGrove> | null} */
	let game = $state(null);

	let mode = $state('title');
	let levelIndex = $state(0);
	let levelName = $state('');
	let levelCount = $state(3);
	let unlocked = $state(0);
	let hasSave = $state(false);
	let saveLabel = $state('');
	let victories = $state(0);
	let bestSteps = $state(/** @type {number|null} */ (null));
	let hp = $state(5);
	let maxHp = $state(5);
	let potions = $state(0);
	let coins = $state(0);
	let keysHeld = $state(0);
	let shards = $state(0);
	let shardsNeeded = $state(3);
	let steps = $state(0);
	let kills = $state(0);
	let playerLevel = $state(1);
	let xp = $state(0);
	let xpNext = $state(20);
	let inBattle = $state(false);
	let battleTurn = $state(false);
	let inShop = $state(false);
	let shopkeeperName = $state('');
	let potionPrice = $state(6);
	let heartPrice = $state(15);
	let talkedToOwl = $state(false);
	let confirmErase = $state(false);

	let xpRatio = $derived(xpNext > 0 ? Math.min(1, xp / xpNext) : 0);

	function syncHud() {
		if (!game) return;
		const s = game.getState();
		mode = s.mode;
		levelIndex = s.levelIndex;
		levelName = s.levelName;
		levelCount = s.levelCount;
		unlocked = s.unlocked;
		hasSave = s.hasSave;
		saveLabel = s.saveLabel;
		victories = s.victories;
		bestSteps = s.bestSteps;
		hp = s.hp;
		maxHp = s.maxHp;
		potions = s.potions;
		coins = s.coins;
		keysHeld = s.keysHeld;
		shards = s.shards;
		shardsNeeded = s.shardsNeeded;
		steps = s.steps;
		kills = s.kills;
		playerLevel = s.playerLevel;
		xp = s.xp;
		xpNext = s.xpNext;
		inBattle = s.inBattle;
		battleTurn = s.battleTurn;
		inShop = s.inShop;
		shopkeeperName = s.shopkeeperName;
		potionPrice = s.potionPrice;
		heartPrice = s.heartPrice;
		talkedToOwl = s.talkedToOwl;
		if (mode !== 'title') confirmErase = false;
	}

	onMount(() => {
		if (!canvasEl) return;
		const instance = createNeonGrove(syncHud);
		game = instance;
		instance.mount(canvasEl);
		syncHud();
		return () => instance.unmount();
	});

	function onAction() {
		if (!game) return;
		if (mode === 'title') game.start();
		else game.interact();
		syncHud();
	}

	/**
	 * @param {'up'|'down'|'left'|'right'} dir
	 */
	function onPad(dir) {
		game?.pressDir(dir);
		syncHud();
	}

	function onErase() {
		if (!game) return;
		if (!confirmErase) {
			confirmErase = true;
			return;
		}
		game.eraseSave();
		confirmErase = false;
		syncHud();
	}
</script>

<div class="rpg-shell">
	<div class="rpg-stage panel-surface">
		<div class="rpg-canvas-wrap">
			<canvas
				bind:this={canvasEl}
				class="rpg-canvas"
				width={1056}
				height={768}
				aria-label="Neon Grove pixel RPG game canvas"
			></canvas>
		</div>

		{#if mode !== 'title'}
			<div class="rpg-hud" aria-live="polite">
				<div class="hud-level" title="Current level">{levelName}</div>
				<div class="hud-stat" title="Hit points">
					<i class="fas fa-heart" aria-hidden="true"></i>
					<span>{hp}/{maxHp}</span>
				</div>
				<div class="hud-stat" title="Hero level and XP">
					<i class="fas fa-star" aria-hidden="true"></i>
					<span>Lv.{playerLevel}</span>
					<span class="xp-bar" aria-hidden="true"
						><span class="xp-fill" style:width={`${Math.round(xpRatio * 100)}%`}></span></span
					>
				</div>
				<div class="hud-stat" title="Source shards on this level">
					<i class="fas fa-gem" aria-hidden="true"></i>
					<span>{shards}/{shardsNeeded}</span>
				</div>
				<div class="hud-stat" title="Glow potions">
					<i class="fas fa-flask" aria-hidden="true"></i>
					<span>{potions}</span>
				</div>
				<div class="hud-stat" title="Stardust coins">
					<i class="fas fa-coins" aria-hidden="true"></i>
					<span>{coins}</span>
				</div>
				{#if keysHeld > 0}
					<div class="hud-stat" title="Brass keys">
						<i class="fas fa-key" aria-hidden="true"></i>
						<span>{keysHeld}</span>
					</div>
				{/if}
				<div class="hud-stat d-none d-sm-flex" title="Steps walked this run">
					<i class="fas fa-shoe-prints" aria-hidden="true"></i>
					<span>{steps}</span>
				</div>
				<div class="hud-quest">
					{#if levelIndex === 0 && !talkedToOwl}
						Talk to Owlbit near the portal
					{:else if shards < shardsNeeded}
						{levelName}: collect shards ({shards}/{shardsNeeded})
					{:else}
						Enter the glowing portal!
					{/if}
				</div>
			</div>
		{/if}

		{#if mode === 'title'}
			<div class="rpg-save" aria-live="polite">
				<div class="save-row">
					{#if hasSave}
						<button
							type="button"
							class="rpg-btn"
							onclick={() => {
								game?.continueFromSave();
								syncHud();
							}}
						>
							<i class="fas fa-floppy-disk me-1" aria-hidden="true"></i> Continue
						</button>
						<span class="save-label">{saveLabel}</span>
					{/if}
					{#if victories > 0}
						<span class="save-label"
							>🏆 {victories}× restored{#if bestSteps !== null}
								· best {bestSteps} steps{/if}</span
						>
					{/if}
				</div>
				<div class="save-row">
					<span class="save-caption">New run from:</span>
					{#each LEVELS as lv, i}
						<button
							type="button"
							class="rpg-btn rpg-btn--ghost"
							disabled={i > unlocked}
							title={i > unlocked ? 'Finish the previous level to unlock' : lv.hint}
							onclick={() => {
								game?.startNewRun(i);
								syncHud();
							}}
						>
							{i > unlocked ? '🔒' : `Lv.${i + 1}`}
						</button>
					{/each}
					{#if hasSave}
						<button type="button" class="rpg-btn rpg-btn--danger" onclick={onErase}>
							{#if confirmErase}
								Confirm erase?
							{:else}
								Erase save
							{/if}
						</button>
					{/if}
				</div>
			</div>
		{/if}

		{#if inBattle}
			<div class="rpg-battle-actions" role="group" aria-label="Battle actions">
				<button
					type="button"
					class="rpg-btn"
					disabled={!battleTurn}
					onclick={() => {
						game?.playerAttack();
						syncHud();
					}}
				>
					<i class="fas fa-hand-fist me-1" aria-hidden="true"></i> Attack
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--soft"
					disabled={!battleTurn || potions <= 0}
					onclick={() => {
						game?.usePotionInBattle();
						syncHud();
					}}
				>
					<i class="fas fa-flask me-1" aria-hidden="true"></i> Potion
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--ghost"
					disabled={!battleTurn}
					onclick={() => {
						game?.tryFlee();
						syncHud();
					}}
				>
					<i class="fas fa-person-running me-1" aria-hidden="true"></i> Flee
				</button>
			</div>
		{/if}

		{#if inShop}
			<div class="rpg-battle-actions" role="group" aria-label="Shop actions">
				<button
					type="button"
					class="rpg-btn"
					disabled={coins < potionPrice}
					onclick={() => {
						game?.buyPotion();
						syncHud();
					}}
				>
					<i class="fas fa-flask me-1" aria-hidden="true"></i> Potion · {potionPrice} ✦
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--soft"
					disabled={coins < heartPrice}
					onclick={() => {
						game?.buyHeart();
						syncHud();
					}}
				>
					<i class="fas fa-heart me-1" aria-hidden="true"></i> Heartfruit · {heartPrice} ✦
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--ghost"
					onclick={() => {
						game?.closeShop();
						syncHud();
					}}
				>
					Leave
				</button>
			</div>
		{/if}

		{#if mode === 'levelcomplete'}
			<div class="rpg-battle-actions" role="group" aria-label="Level complete actions">
				<button
					type="button"
					class="rpg-btn"
					onclick={() => {
						game?.nextLevel();
						syncHud();
					}}
				>
					<i class="fas fa-door-open me-1" aria-hidden="true"></i> Enter Lv.{levelIndex + 2}
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--ghost"
					onclick={() => {
						game?.saveNow();
						syncHud();
					}}
				>
					<i class="fas fa-floppy-disk me-1" aria-hidden="true"></i> Save
				</button>
			</div>
		{/if}

		{#if mode === 'gameover'}
			<div class="rpg-battle-actions" role="group" aria-label="Game over actions">
				<button
					type="button"
					class="rpg-btn"
					onclick={() => {
						game?.retryLevel();
						syncHud();
					}}
				>
					<i class="fas fa-rotate-right me-1" aria-hidden="true"></i> Retry level
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--ghost"
					onclick={() => {
						game?.toTitle();
						syncHud();
					}}
				>
					Title
				</button>
			</div>
		{/if}

		{#if mode === 'win'}
			<div class="rpg-battle-actions" role="group" aria-label="Victory actions">
				<button
					type="button"
					class="rpg-btn"
					onclick={() => {
						game?.startNewRun(0);
						syncHud();
					}}
				>
					<i class="fas fa-rotate-right me-1" aria-hidden="true"></i> New adventure
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--ghost"
					onclick={() => {
						game?.toTitle();
						syncHud();
					}}
				>
					Title
				</button>
			</div>
		{/if}

		{#if mode === 'play' || mode === 'dialogue'}
			<div class="rpg-battle-actions rpg-mini-actions">
				<button
					type="button"
					class="rpg-btn rpg-btn--ghost rpg-btn--sm"
					onclick={() => {
						game?.saveNow();
						syncHud();
					}}
				>
					<i class="fas fa-floppy-disk me-1" aria-hidden="true"></i> Save
				</button>
				<button
					type="button"
					class="rpg-btn rpg-btn--ghost rpg-btn--sm"
					onclick={() => {
						game?.toTitle();
						syncHud();
					}}
				>
					Title
				</button>
				<span class="save-label">Progress autosaves — {kills} foe(s) bonked</span>
			</div>
		{/if}
	</div>

	<div class="rpg-controls">
		<div class="dpad" aria-label="Movement pad">
			<button
				type="button"
				class="pad-btn pad-up"
				aria-label="Move up"
				onpointerdown={(e) => {
					e.preventDefault();
					onPad('up');
				}}
			>
				<i class="fas fa-caret-up" aria-hidden="true"></i>
			</button>
			<button
				type="button"
				class="pad-btn pad-left"
				aria-label="Move left"
				onpointerdown={(e) => {
					e.preventDefault();
					onPad('left');
				}}
			>
				<i class="fas fa-caret-left" aria-hidden="true"></i>
			</button>
			<button
				type="button"
				class="pad-btn pad-right"
				aria-label="Move right"
				onpointerdown={(e) => {
					e.preventDefault();
					onPad('right');
				}}
			>
				<i class="fas fa-caret-right" aria-hidden="true"></i>
			</button>
			<button
				type="button"
				class="pad-btn pad-down"
				aria-label="Move down"
				onpointerdown={(e) => {
					e.preventDefault();
					onPad('down');
				}}
			>
				<i class="fas fa-caret-down" aria-hidden="true"></i>
			</button>
		</div>

		<div class="action-col">
			<button type="button" class="action-btn" onclick={onAction}>
				<span class="action-label">
					{#if mode === 'title'}
						Start
					{:else if mode === 'dialogue'}
						Next
					{:else if mode === 'shop'}
						Leave
					{:else if mode === 'levelcomplete'}
						Next
					{:else if mode === 'win' || mode === 'gameover'}
						Menu
					{:else if inBattle}
						Info
					{:else}
						Action
					{/if}
				</span>
				<span class="action-hint">Space / E</span>
			</button>
			<p class="controls-help mb-0">
				Desktop: <kbd>WASD</kbd> or arrows to walk, <kbd>Space</kbd> to talk / pick up. Battle: <kbd>1</kbd> attack,
				<kbd>2</kbd>
				potion, <kbd>3</kbd> flee. Shop: <kbd>1</kbd> potion, <kbd>2</kbd> heartfruit. Saves live in your browser until you
				erase them.
			</p>
		</div>
	</div>
</div>

<style>
	.rpg-shell {
		display: grid;
		gap: 1rem;
	}

	.rpg-stage {
		position: relative;
		overflow: hidden;
		padding: 0.65rem;
		background: var(--surface);
	}

	.rpg-canvas-wrap {
		width: 100%;
		border-radius: var(--radius-card);
		overflow: hidden;
		border: 1px solid var(--line);
		background: #05070d;
		line-height: 0;
	}

	.rpg-canvas {
		display: block;
		width: 100%;
		height: auto;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		touch-action: none;
	}

	.rpg-hud {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.55rem 0.85rem;
		margin-top: 0.7rem;
		padding: 0.55rem 0.75rem;
		border-radius: var(--radius-card);
		background: var(--surface-2);
		border: 1px solid var(--line);
	}

	.hud-level {
		font-weight: 700;
		font-size: 0.85rem;
		color: #000;
		background: var(--azure);
		border-radius: var(--radius-card);
		padding: 0.15rem 0.5rem;
		white-space: nowrap;
	}

	.hud-stat {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-weight: 600;
		font-size: 0.92rem;
		color: var(--ink);
		white-space: nowrap;
	}

	.hud-stat i {
		color: var(--azure);
	}

	.xp-bar {
		display: inline-block;
		width: 3rem;
		height: 0.45rem;
		border-radius: 999px;
		background: rgba(244, 241, 233, 0.16);
		overflow: hidden;
	}

	.xp-fill {
		display: block;
		height: 100%;
		background: var(--gold);
		transition: width 0.25s var(--ease-out-expo);
	}

	.hud-quest {
		flex: 1 1 12rem;
		min-width: 0;
		font-size: 0.88rem;
		color: var(--ink-soft);
		text-align: right;
	}

	.rpg-save {
		display: grid;
		gap: 0.5rem;
		margin-top: 0.65rem;
		padding: 0.6rem 0.75rem;
		border-radius: var(--radius-card);
		background: var(--surface-2);
		border: 1px dashed var(--line-strong);
	}

	.save-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.save-label {
		font-size: 0.85rem;
		color: var(--ink-soft);
	}

	.save-caption {
		font-size: 0.85rem;
		color: var(--ink-soft);
	}

	.rpg-battle-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.65rem;
	}

	.rpg-mini-actions {
		align-items: center;
	}

	.rpg-btn {
		appearance: none;
		border: 1px solid var(--line-strong);
		background: var(--azure-soft);
		color: var(--ink);
		border-radius: var(--radius-card);
		padding: 0.55rem 1rem;
		font-weight: 600;
		font-size: 0.9rem;
		transition:
			background-color 0.2s var(--ease-out-expo),
			color 0.2s,
			opacity 0.2s;
	}

	.rpg-btn:hover:not(:disabled),
	.rpg-btn:focus-visible {
		background: var(--azure);
		border-color: var(--azure);
		color: #000;
		outline: none;
	}

	.rpg-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.rpg-btn--soft {
		border-color: var(--gold-line);
		background: var(--gold-soft);
	}

	.rpg-btn--soft:hover:not(:disabled),
	.rpg-btn--soft:focus-visible {
		background: var(--gold);
		border-color: var(--gold);
		color: #000;
	}

	.rpg-btn--ghost {
		border-color: var(--line);
		background: transparent;
	}

	.rpg-btn--danger {
		border-color: rgba(255, 107, 107, 0.55);
		background: rgba(255, 107, 107, 0.12);
	}

	.rpg-btn--danger:hover:not(:disabled),
	.rpg-btn--danger:focus-visible {
		background: #ff6b6b;
		border-color: #ff6b6b;
		color: #000;
	}

	.rpg-btn--sm {
		padding: 0.35rem 0.7rem;
		font-size: 0.82rem;
	}

	.rpg-controls {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		align-items: center;
	}

	.dpad {
		display: grid;
		grid-template-columns: repeat(3, 3rem);
		grid-template-rows: repeat(3, 3rem);
		gap: 0.3rem;
		user-select: none;
		touch-action: manipulation;
	}

	.pad-btn {
		appearance: none;
		border: 1px solid var(--line);
		background: var(--surface-2);
		color: var(--ink);
		border-radius: var(--radius-card);
		font-size: 1.15rem;
		display: grid;
		place-items: center;
		transition:
			background-color 0.15s var(--ease-out-expo),
			transform 0.1s;
	}

	.pad-btn:active {
		transform: scale(0.94);
		background: var(--azure-soft);
		border-color: var(--azure-line);
	}

	.pad-btn:focus-visible {
		outline: 2px solid var(--azure);
		outline-offset: 2px;
	}

	.pad-up {
		grid-column: 2;
		grid-row: 1;
	}
	.pad-left {
		grid-column: 1;
		grid-row: 2;
	}
	.pad-right {
		grid-column: 3;
		grid-row: 2;
	}
	.pad-down {
		grid-column: 2;
		grid-row: 3;
	}

	.action-col {
		display: grid;
		gap: 0.65rem;
		justify-items: start;
	}

	.action-btn {
		appearance: none;
		min-width: 7.5rem;
		min-height: 7.5rem;
		border-radius: 50%;
		border: 1px solid var(--azure);
		background: var(--azure);
		color: #000;
		display: grid;
		place-content: center;
		gap: 0.2rem;
		transition:
			transform 0.15s var(--ease-out-expo),
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.action-btn:hover,
	.action-btn:focus-visible {
		background: var(--gold);
		border-color: var(--gold);
		outline: none;
	}

	.action-btn:active {
		transform: scale(0.96);
	}

	.action-label {
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: 0.02em;
	}

	.action-hint {
		font-size: 0.72rem;
		opacity: 0.75;
	}

	.controls-help {
		max-width: 28rem;
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--ink-soft);
	}

	.controls-help kbd {
		display: inline-block;
		padding: 0.1rem 0.35rem;
		border-radius: var(--radius-card);
		border: 1px solid var(--line);
		background: var(--surface-2);
		font-size: 0.78rem;
		color: var(--ink);
	}

	@media (max-width: 640px) {
		.rpg-controls {
			grid-template-columns: 1fr;
			justify-items: center;
			text-align: center;
		}

		.action-col {
			justify-items: center;
		}

		.hud-quest {
			text-align: left;
			flex-basis: 100%;
		}

		.controls-help {
			max-width: 22rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pad-btn,
		.action-btn,
		.rpg-btn,
		.xp-fill {
			transition: none;
		}
	}
</style>
