/**
 * Neon Grove — a tiny top-down pixel RPG engine (3-level adventure).
 * Pure canvas drawing (no external sprites). Returns a controller for UI binding.
 * Persistent progression (stats, unlocks, victories) lives in localStorage
 * via `src/lib/game/save.js` and is only cleared when the player asks.
 */

import { T, SOLID, MAP_W, MAP_H, TILE, SCALE, LEVELS, ENEMIES, SHOP } from './levels.js';
import { SAVE_KEY, readSave, writeSave, clearSave } from './save.js';

/** @typedef {'title' | 'play' | 'dialogue' | 'shop' | 'battle' | 'levelcomplete' | 'win' | 'gameover'} GameMode */

export { SAVE_KEY };

const COLORS = {
	grassA: '#2d6a4f',
	grassB: '#40916c',
	path: '#c4a574',
	pathEdge: '#a9845a',
	flower: '#ffcc00',
	flowerCenter: '#ffd60a',
	waterA: '#48cae4',
	waterB: '#0077b6',
	treeTrunk: '#6f4518',
	treeLeaf: '#1b4332',
	treeLeafLite: '#2d6a4f',
	rock: '#6c757d',
	rockLite: '#adb5bd',
	bush: '#52b788',
	portal: '#4c8dff',
	portalCore: '#7fb2ff',
	floor: '#061a3f',
	shadow: 'rgba(0,0,0,0.28)',
	lavaA: '#e63946',
	lavaB: '#7a0e1e',
	lavaCrust: '#ff9e00'
};

const P = {
	skin: '#ffcdb2',
	hat: '#4c8dff',
	hatBand: '#ffcc00',
	shirt: '#00bbf9',
	pants: '#0a2a6b',
	boots: '#3d2914',
	eyes: '#1a1a2e'
};

/** @param {number} min @param {number} max */
function roll(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * @param {() => void} onHud
 */
export function createNeonGrove(onHud = () => {}) {
	/** @type {HTMLCanvasElement | null} */
	let canvas = null;
	/** @type {CanvasRenderingContext2D | null} */
	let ctx = null;
	let raf = 0;
	let last = 0;
	let running = false;

	/** @type {GameMode} */
	let mode = 'title';
	let frame = 0;
	let anim = 0;
	let moveCooldown = 0;
	let lavaCooldown = 0;
	let flash = 0;
	/** @type {number} red flash for damage */
	let hurtFlash = 0;
	let message = '';
	let messageTimer = 0;
	let levelBannerTimer = 0;
	/** @type {number} boss charge counter */
	let bossTurns = 0;

	const keys = new Set();
	/** @type {Set<string>} */
	const held = new Set();

	// Persistent run stats (carried across levels)
	const player = {
		x: 11,
		y: 13,
		dir: 'down',
		hp: 5,
		maxHp: 5,
		potions: 0,
		coins: 0,
		keysHeld: 0,
		shards: 0, // this level only
		stepsRun: 0,
		killsRun: 0,
		xp: 0,
		playerLevel: 1,
		xpNext: 20
	};

	/** @type {number} index into LEVELS */
	let levelIndex = 0;
	/** @type {number} highest level unlocked (persisted) */
	let unlocked = 0;
	let victories = 0;
	/** @type {number|null} */
	let bestSteps = null;
	/** @type {boolean} */
	let hasSave = false;
	/** @type {string} */
	let saveLabel = '';

	/** @type {{x:number,y:number,kind:string,taken?:boolean,hp?:number,maxHp?:number,name?:string,lines?:string[],atkMin?:number,atkMax?:number,xp?:number,coins?:number,flee?:number,contains?:{potions?:number,coins?:number,heart?:boolean,key?:boolean},locked?:boolean,enemyKind?:string,dropsShard?:boolean}[]} */
	let entities = [];

	/** @type {{speaker:string, lines:string[], index:number, onDone?:()=>void} | null} */
	let dialogue = null;
	/** @type {{name:string, lines:string[]} | null} */
	let shopkeeper = null;

	/** @type {{enemy: (typeof entities)[0], log:string[], playerTurn:boolean, anim:number} | null} */
	let battle = null;

	const quest = {
		talkedToOwl: false,
		complete: false
	};

	/** Snapshot of run stats at level entry (retry checkpoint). */
	let levelEntry = '';

	function notify() {
		onHud();
	}

	function currentLevel() {
		return LEVELS[levelIndex];
	}

	function tileAt(x, y) {
		const map = currentLevel().map;
		if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return T.TREE;
		return map[y][x];
	}

	/** Deep-clone level entities and fill enemy stats. */
	function buildEntities(idx) {
		return LEVELS[idx].entities.map((e) => {
			const copy = JSON.parse(JSON.stringify(e));
			if (['slime', 'wisp', 'golem', 'boss'].includes(copy.kind)) {
				const tune = ENEMIES[/** @type {keyof typeof ENEMIES} */ (copy.enemyKind ?? copy.kind)];
				copy.hp = tune.hp;
				copy.maxHp = tune.hp;
				copy.atkMin = tune.atkMin;
				copy.atkMax = tune.atkMax;
				copy.xp = tune.xp;
				copy.coins = tune.coins;
				copy.flee = tune.flee;
				if (!copy.name) copy.name = copy.kind;
			}
			copy.taken = false;
			return copy;
		});
	}

	function enterLevel(idx, opts = {}) {
		const { keepStats = true, banner = true } = /** @type {{keepStats?:boolean,banner?:boolean}} */ (opts);
		levelIndex = idx;
		const lv = LEVELS[idx];
		if (!keepStats) {
			player.hp = 5;
			player.maxHp = 5;
			player.potions = 0;
			player.coins = 0;
			player.keysHeld = 0;
			player.stepsRun = 0;
			player.killsRun = 0;
			player.xp = 0;
			player.playerLevel = 1;
			player.xpNext = 20;
		}
		player.x = lv.spawn.x;
		player.y = lv.spawn.y;
		player.dir = 'down';
		player.shards = 0;
		quest.talkedToOwl = false;
		quest.complete = false;
		entities = buildEntities(idx);
		dialogue = null;
		shopkeeper = null;
		battle = null;
		bossTurns = 0;
		lavaCooldown = 0;
		moveCooldown = 0;
		mode = 'play';
		if (banner) {
			levelBannerTimer = 3.2;
			toast(`${lv.name} — ${lv.hint}`, 3.2);
		}
		levelEntry = JSON.stringify({
			hp: player.hp,
			maxHp: player.maxHp,
			potions: player.potions,
			coins: player.coins,
			keysHeld: player.keysHeld,
			stepsRun: player.stepsRun,
			killsRun: player.killsRun,
			xp: player.xp,
			playerLevel: player.playerLevel,
			xpNext: player.xpNext
		});
		persist();
		notify();
	}

	function resetWorld() {
		startNewRun(0);
	}

	// ——— Saves ———

	function snapshot() {
		return {
			hp: player.hp,
			maxHp: player.maxHp,
			potions: player.potions,
			coins: player.coins,
			keysHeld: player.keysHeld,
			stepsRun: player.stepsRun,
			killsRun: player.killsRun,
			xp: player.xp,
			playerLevel: player.playerLevel,
			xpNext: player.xpNext,
			levelIndex,
			unlocked,
			victories,
			bestSteps,
			shards: player.shards,
			px: player.x,
			py: player.y,
			pdir: player.dir,
			talkedToOwl: quest.talkedToOwl,
			taken: entities.map((e) => !!e.taken),
			enemyHp: entities.map((e) => e.hp ?? null)
		};
	}

	function persist() {
		const ok = writeSave({
			...snapshot(),
			totalShards: player.stepsRun // reserved
		});
		hasSave = ok || hasSave;
		refreshSaveLabel();
	}

	function refreshSaveLabel() {
		const s = readSave();
		hasSave = !!s;
		if (!s) {
			saveLabel = '';
			return;
		}
		const d = s.timestamp ? new Date(s.timestamp) : null;
		const when = d ? d.toLocaleDateString() : 'saved run';
		const lv = LEVELS[s.levelIndex]?.name ?? `Level ${s.levelIndex + 1}`;
		saveLabel = `${lv} · ${when}`;
	}

	/**
	 * @param {Record<string, any>} s
	 */
	function restore(s) {
		levelIndex = Math.min(Math.max(0, s.levelIndex | 0), LEVELS.length - 1);
		unlocked = Math.min(Math.max(unlocked, s.unlocked | 0, levelIndex), LEVELS.length - 1);
		if (typeof s.victories === 'number') victories = s.victories;
		if (typeof s.bestSteps === 'number' || s.bestSteps === null) bestSteps = s.bestSteps ?? null;
		player.hp = Math.min(Number(s.hp) || 5, Number(s.maxHp) || 5);
		player.maxHp = Number(s.maxHp) || 5;
		player.potions = Math.max(0, Number(s.potions) || 0);
		player.coins = Math.max(0, Number(s.coins) || 0);
		player.keysHeld = Math.max(0, Number(s.keysHeld) || 0);
		player.stepsRun = Math.max(0, Number(s.stepsRun) || 0);
		player.killsRun = Math.max(0, Number(s.killsRun) || 0);
		player.xp = Math.max(0, Number(s.xp) || 0);
		player.playerLevel = Math.max(1, Number(s.playerLevel) || 1);
		player.xpNext = Math.max(10, Number(s.xpNext) || 20);
		player.shards = Math.max(0, Number(s.shards) || 0);
		entities = buildEntities(levelIndex);
		if (Array.isArray(s.taken)) {
			entities.forEach((e, i) => {
				if (s.taken[i]) e.taken = true;
			});
		}
		if (Array.isArray(s.enemyHp)) {
			entities.forEach((e, i) => {
				if (typeof s.enemyHp[i] === 'number' && e.hp !== undefined) {
					e.hp = Math.max(0, Math.min(e.maxHp ?? 99, s.enemyHp[i]));
					if (e.hp <= 0) e.taken = true;
				}
			});
		}
		const lv = LEVELS[levelIndex];
		player.x = Math.min(Math.max(0, Number(s.px) || lv.spawn.x), MAP_W - 1);
		player.y = Math.min(Math.max(0, Number(s.py) || lv.spawn.y), MAP_H - 1);
		player.dir = ['up', 'down', 'left', 'right'].includes(s.pdir) ? s.pdir : 'down';
		if (!isBlocked(player.x, player.y)) {
			// fine
		} else {
			player.x = lv.spawn.x;
			player.y = lv.spawn.y;
		}
		quest.talkedToOwl = !!s.talkedToOwl;
		quest.complete = false;
		dialogue = null;
		shopkeeper = null;
		battle = null;
		mode = 'play';
		levelEntry = JSON.stringify({
			hp: player.hp,
			maxHp: player.maxHp,
			potions: player.potions,
			coins: player.coins,
			keysHeld: player.keysHeld,
			stepsRun: player.stepsRun,
			killsRun: player.killsRun,
			xp: player.xp,
			playerLevel: player.playerLevel,
			xpNext: player.xpNext
		});
		levelBannerTimer = 2.5;
		notify();
	}

	function startNewRun(idx = 0) {
		const i = Math.min(Math.max(0, idx), Math.min(unlocked, LEVELS.length - 1));
		if (idx <= unlocked) enterLevel(i);
		else enterLevel(Math.min(unlocked, LEVELS.length - 1));
	}

	function continueFromSave() {
		const s = readSave();
		if (!s) {
			startNewRun(0);
			return;
		}
		restore(s);
	}

	function eraseSave() {
		clearSave();
		hasSave = false;
		saveLabel = '';
		unlocked = 0;
		victories = 0;
		bestSteps = null;
		mode = 'title';
		notify();
	}

	function retryLevel() {
		try {
			const s = JSON.parse(levelEntry || '{}');
			if (s.hp === undefined) {
				enterLevel(levelIndex);
				return;
			}
			player.hp = s.hp;
			player.maxHp = s.maxHp;
			player.potions = s.potions;
			player.coins = s.coins;
			player.keysHeld = s.keysHeld;
			player.stepsRun = s.stepsRun;
			player.killsRun = s.killsRun;
			player.xp = s.xp;
			player.playerLevel = s.playerLevel;
			player.xpNext = s.xpNext;
		} catch {
			/* fall through to fresh entry */
		}
		const lv = LEVELS[levelIndex];
		player.x = lv.spawn.x;
		player.y = lv.spawn.y;
		player.dir = 'down';
		player.shards = 0;
		entities = buildEntities(levelIndex);
		dialogue = null;
		shopkeeper = null;
		battle = null;
		mode = 'play';
		levelBannerTimer = 2.2;
		toast('Back on your feet — potions restocked from checkpoint.', 2.6);
		persist();
		notify();
	}

	function toTitle() {
		persist();
		mode = 'title';
		notify();
	}

	// ——— Movement / interaction ———

	function isBlocked(x, y) {
		if (SOLID.has(tileAt(x, y))) return true;
		return entities.some(
			(e) =>
				e.x === x &&
				e.y === y &&
				!e.taken &&
				(e.kind === 'npc' ||
					e.kind === 'shop' ||
					e.kind === 'slime' ||
					e.kind === 'wisp' ||
					e.kind === 'golem' ||
					e.kind === 'boss' ||
					e.kind === 'chest')
		);
	}

	function entityAt(x, y) {
		return entities.find((e) => e.x === x && e.y === y && !e.taken) ?? null;
	}

	function isEnemy(e) {
		return !!e && (e.kind === 'slime' || e.kind === 'wisp' || e.kind === 'golem' || e.kind === 'boss');
	}

	function facingCell() {
		let fx = player.x;
		let fy = player.y;
		if (player.dir === 'up') fy -= 1;
		if (player.dir === 'down') fy += 1;
		if (player.dir === 'left') fx -= 1;
		if (player.dir === 'right') fx += 1;
		return { x: fx, y: fy };
	}

	function toast(text, time = 2.2) {
		message = text;
		messageTimer = time;
		notify();
	}

	function gainXp(n) {
		player.xp += n;
		while (player.xp >= player.xpNext) {
			player.xp -= player.xpNext;
			player.playerLevel += 1;
			player.xpNext = 18 + player.playerLevel * 10;
			player.maxHp += 1;
			player.hp = player.maxHp;
			flash = 0.4;
			toast(`Level up! You are now Lv.${player.playerLevel} (HP ${player.maxHp}).`, 2.6);
		}
	}

	function tryMove(dx, dy) {
		if (mode !== 'play' || moveCooldown > 0) return;
		if (dx === 0 && dy === 0) return;

		if (dx < 0) player.dir = 'left';
		if (dx > 0) player.dir = 'right';
		if (dy < 0) player.dir = 'up';
		if (dy > 0) player.dir = 'down';

		const nx = player.x + dx;
		const ny = player.y + dy;
		const target = entityAt(nx, ny);

		if (target && isEnemy(target)) {
			startBattle(target);
			return;
		}

		if (
			target &&
			(target.kind === 'npc' || target.kind === 'shop' || target.kind === 'chest' || target.kind === 'shard')
		) {
			// bump interact
			interactWith(target);
			moveCooldown = 0.18;
			return;
		}

		if (!isBlocked(nx, ny) && !(nx === player.x && ny === player.y)) {
			// shards, coins, hearts and keys are walkable pickups; everyone else solid
			const solidEntity = entities.some(
				(e) =>
					e.x === nx &&
					e.y === ny &&
					!e.taken &&
					(e.kind === 'npc' ||
						e.kind === 'shop' ||
						e.kind === 'slime' ||
						e.kind === 'wisp' ||
						e.kind === 'golem' ||
						e.kind === 'boss' ||
						e.kind === 'chest')
			);
			if (!SOLID.has(tileAt(nx, ny)) && !solidEntity) {
				player.x = nx;
				player.y = ny;
				player.stepsRun += 1;
				moveCooldown = 0.14;
				afterStep();
				persist();
				notify();
			}
		}
	}

	function afterStep() {
		// lava burn
		if (tileAt(player.x, player.y) === T.LAVA && lavaCooldown <= 0) {
			lavaCooldown = 0.9;
			player.hp = Math.max(0, player.hp - 1);
			hurtFlash = 0.35;
			flash = 0.2;
			if (player.hp <= 0) {
				battle = null;
				mode = 'gameover';
				persist();
				notify();
				return;
			}
			toast(player.hp <= 2 ? 'Lava! Your boots are smoking — heal fast!' : 'Ouch — molten glitch burns (1 HP).');
		}
		// auto pickups: shards, coins, hearts, keys
		const here = entityAt(player.x, player.y);
		if (here && !here.taken) {
			if (here.kind === 'shard') {
				here.taken = true;
				player.shards += 1;
				const need = currentLevel().shardsNeeded;
				toast(`Source Shard collected! (${player.shards}/${need})`);
				flash = 0.35;
				persist();
			} else if (here.kind === 'coin') {
				here.taken = true;
				player.coins += 1;
				toast(`+1 stardust (${player.coins} total).`);
				persist();
			} else if (here.kind === 'heart') {
				here.taken = true;
				player.maxHp += 1;
				player.hp = Math.min(player.maxHp, player.hp + 2);
				flash = 0.3;
				toast(`Heartfruit! Max HP is now ${player.maxHp}.`);
				persist();
			} else if (here.kind === 'key') {
				here.taken = true;
				player.keysHeld += 1;
				toast(`Brass key acquired (${player.keysHeld}). It hums near locked chests.`);
				persist();
			}
		}
		checkTileEvents();
	}

	function checkTileEvents() {
		if (tileAt(player.x, player.y) === T.PORTAL) {
			const need = currentLevel().shardsNeeded;
			if (player.shards >= need) {
				completeLevel();
			} else {
				toast(`Portal hums… need ${need - player.shards} more shard(s).`);
			}
		}
	}

	function completeLevel() {
		quest.complete = true;
		unlocked = Math.max(unlocked, Math.min(levelIndex + 1, LEVELS.length - 1));
		if (levelIndex >= LEVELS.length - 1) {
			victories += 1;
			if (bestSteps === null || player.stepsRun < bestSteps) bestSteps = player.stepsRun;
			mode = 'win';
		} else {
			mode = 'levelcomplete';
			// small reward for clearing: heal + coins
			player.hp = Math.min(player.maxHp, player.hp + 2);
			player.coins += 3;
		}
		persist();
		notify();
	}

	function nextLevel() {
		if (mode !== 'levelcomplete') return;
		enterLevel(Math.min(levelIndex + 1, LEVELS.length - 1));
	}

	function interact() {
		if (mode === 'title') {
			resetWorld();
			return;
		}
		if (mode === 'win' || mode === 'gameover') {
			mode = 'title';
			notify();
			return;
		}
		if (mode === 'levelcomplete') {
			nextLevel();
			return;
		}
		if (mode === 'shop') {
			closeShop();
			return;
		}
		if (mode === 'dialogue' && dialogue) {
			dialogue.index += 1;
			if (dialogue.index >= dialogue.lines.length) {
				const done = dialogue.onDone;
				dialogue = null;
				if (shopkeeper) {
					const sk = shopkeeper;
					shopkeeper = null;
					openShop(sk.name, sk.lines);
				} else {
					mode = 'play';
					done?.();
				}
			}
			notify();
			return;
		}
		if (mode === 'battle' && battle) {
			if (!battle.playerTurn) return;
			playerAttack();
			return;
		}
		if (mode !== 'play') return;

		const { x, y } = facingCell();
		const target = entityAt(x, y);
		if (target) {
			interactWith(target);
			return;
		}
		if (tileAt(player.x, player.y) === T.PORTAL) {
			checkTileEvents();
		} else {
			toast('Nothing here… yet.');
		}
	}

	function interactWith(target) {
		if (target.kind === 'npc') {
			openDialogue(target.name ?? '???', target.lines ?? ['…'], () => {
				if (target.name === 'Owlbit') {
					if (!quest.talkedToOwl) {
						quest.talkedToOwl = true;
						toast('Quest updated: collect 3 Source Shards!');
					}
					persist();
				}
			});
			return;
		}
		if (target.kind === 'shop') {
			openDialogue(target.name ?? 'Merchant', target.lines ?? ['…'], undefined, {
				name: target.name ?? 'Merchant',
				lines: target.lines ?? []
			});
			return;
		}
		if (target.kind === 'shard') {
			target.taken = true;
			player.shards += 1;
			const need = currentLevel().shardsNeeded;
			toast(`Source Shard collected! (${player.shards}/${need})`);
			flash = 0.35;
			persist();
			notify();
			return;
		}
		if (target.kind === 'chest') {
			if (target.locked && player.keysHeld <= 0) {
				toast('Locked tight. A brass key would turn this…');
				notify();
				return;
			}
			if (target.locked) player.keysHeld -= 1;
			target.taken = true;
			const c = target.contains ?? { potions: 1 };
			const bits = [];
			if (c.potions) {
				player.potions += c.potions;
				bits.push(`+${c.potions} potion${c.potions > 1 ? 's' : ''}`);
			}
			if (c.coins) {
				player.coins += c.coins;
				bits.push(`+${c.coins} stardust`);
			}
			if (c.key) {
				player.keysHeld += 1;
				bits.push('+1 key');
			}
			if (c.heart) {
				player.maxHp += 1;
				player.hp = Math.min(player.maxHp, player.hp + 2);
				bits.push(`max HP ${player.maxHp}`);
			}
			if (!bits.length) bits.push('empty… the glitch ate it');
			toast(`Chest! ${bits.join(' · ')}.`);
			flash = 0.25;
			persist();
			notify();
			return;
		}
		if (isEnemy(target)) {
			startBattle(target);
		}
	}

	/**
	 * @param {string} speaker
	 * @param {string[]} lines
	 * @param {(() => void) | undefined} onDone
	 * @param {{name:string,lines:string[]} | undefined} thenShop
	 */
	function openDialogue(speaker, lines, onDone, thenShop) {
		dialogue = { speaker, lines, index: 0, onDone };
		shopkeeper = thenShop ?? null;
		mode = 'dialogue';
		notify();
	}

	/** @param {string} name @param {string[]} lines */
	function openShop(name, lines) {
		shopkeeper = { name, lines };
		mode = 'shop';
		notify();
	}

	function closeShop() {
		shopkeeper = null;
		mode = 'play';
		persist();
		notify();
	}

	function buyPotion() {
		if (mode !== 'shop') return;
		if (player.coins < SHOP.potionPrice) {
			toast(`Need ${SHOP.potionPrice} stardust for a potion (you have ${player.coins}).`);
			return;
		}
		player.coins -= SHOP.potionPrice;
		player.potions += 1;
		toast(`Bought a Glow Potion! (${player.potions} total)`);
		persist();
		notify();
	}

	function buyHeart() {
		if (mode !== 'shop') return;
		if (player.coins < SHOP.heartPrice) {
			toast(`Need ${SHOP.heartPrice} stardust for heartfruit (you have ${player.coins}).`);
			return;
		}
		player.coins -= SHOP.heartPrice;
		player.maxHp += 1;
		player.hp = Math.min(player.maxHp, player.hp + 2);
		toast(`Heartfruit! Max HP is now ${player.maxHp}.`);
		persist();
		notify();
	}

	// ——— Battle ———

	function startBattle(enemy) {
		battle = {
			enemy,
			log: [`A wild ${enemy.name ?? 'slime'} wiggles closer!`],
			playerTurn: true,
			anim: 0
		};
		bossTurns = 0;
		mode = 'battle';
		notify();
	}

	function rewardFor(enemy) {
		const xp = enemy.xp ?? 8;
		const coins = enemy.coins ?? 2;
		player.killsRun += 1;
		player.coins += coins;
		let extra = `+${xp} XP · +${coins} stardust`;
		if (enemy.dropsShard) {
			player.shards += 1;
			const need = currentLevel().shardsNeeded;
			extra += ` · +1 SHARD (${player.shards}/${need})`;
		}
		gainXp(xp);
		return extra;
	}

	function playerAttack() {
		if (!battle || !battle.playerTurn) return;
		// seasoned heroes hit harder: +1 damage from Lv.3, 25% crit
		const dmg = 1 + (player.playerLevel >= 3 ? 1 : 0) + (Math.random() < 0.25 ? 1 : 0);
		battle.enemy.hp = Math.max(0, (battle.enemy.hp ?? 1) - dmg);
		battle.log = [`You bonk for ${dmg}!`, ...battle.log].slice(0, 4);
		battle.anim = 0.25;
		battle.playerTurn = false;
		notify();

		if ((battle.enemy.hp ?? 0) <= 0) {
			setTimeout(() => {
				if (!battle) return;
				const foe = battle.enemy;
				foe.taken = true;
				const extra = rewardFor(foe);
				toast(`${foe.name ?? 'Slime'} poofs into sparkles! ${extra}`);
				battle = null;
				mode = 'play';
				persist();
				notify();
			}, 450);
			return;
		}

		setTimeout(enemyAttack, 480);
	}

	function usePotionInBattle() {
		if (!battle || !battle.playerTurn) return;
		if (player.potions <= 0) {
			battle.log = ['No potions left!', ...battle.log].slice(0, 4);
			notify();
			return;
		}
		player.potions -= 1;
		const heal = SHOP.potionHeal;
		player.hp = Math.min(player.maxHp, player.hp + heal);
		battle.log = [`Potion heals ${heal} HP!`, ...battle.log].slice(0, 4);
		battle.playerTurn = false;
		notify();
		setTimeout(enemyAttack, 480);
	}

	function enemyAttack() {
		if (!battle || mode !== 'battle') return;
		const foe = battle.enemy;
		const isBoss = foe.kind === 'boss';
		bossTurns += 1;
		let dmg;
		if (isBoss && bossTurns % 3 === 0) {
			dmg = roll(2, 3);
			battle.log = [`${foe.name} UNMAKES you for ${dmg}!`, ...battle.log].slice(0, 4);
		} else {
			dmg = roll(foe.atkMin ?? 1, foe.atkMax ?? 1);
			battle.log = [`${foe.name ?? 'Slime'} squishes you for ${dmg}!`, ...battle.log].slice(0, 4);
		}
		player.hp = Math.max(0, player.hp - dmg);
		battle.anim = 0.25;
		hurtFlash = 0.3;
		flash = 0.2;
		notify();

		if (player.hp <= 0) {
			setTimeout(() => {
				battle = null;
				mode = 'gameover';
				persist();
				notify();
			}, 500);
			return;
		}

		battle.playerTurn = true;
		notify();
	}

	function tryFlee() {
		if (!battle || !battle.playerTurn) return;
		const chance = battle.enemy.flee ?? 0.5;
		if (chance <= 0) {
			battle.log = ['No escape — the Null King seals the exits!', ...battle.log].slice(0, 4);
			notify();
			return;
		}
		if (Math.random() < chance) {
			toast('You scoot away safely!');
			battle = null;
			mode = 'play';
			if (player.dir === 'up') player.y = Math.min(MAP_H - 2, player.y + 1);
			else if (player.dir === 'down') player.y = Math.max(1, player.y - 1);
			else if (player.dir === 'left') player.x = Math.min(MAP_W - 2, player.x + 1);
			else player.x = Math.max(1, player.x - 1);
			notify();
		} else {
			battle.log = ['Flee failed!', ...battle.log].slice(0, 4);
			battle.playerTurn = false;
			notify();
			setTimeout(enemyAttack, 480);
		}
	}

	// ——— Input ———
	function onKeyDown(e) {
		const k = e.key.toLowerCase();
		if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(k)) {
			e.preventDefault();
		}
		keys.add(k);
		if (!held.has(k)) {
			held.add(k);
			handlePress(k);
		}
	}

	function onKeyUp(e) {
		const k = e.key.toLowerCase();
		keys.delete(k);
		held.delete(k);
	}

	function handlePress(k) {
		if (k === 'enter' || k === ' ' || k === 'e' || k === 'z') {
			if (mode === 'battle') return; // use buttons
			interact();
			return;
		}
		if (mode === 'battle') {
			if (k === '1' || k === 'a') playerAttack();
			if (k === '2' || k === 'p') usePotionInBattle();
			if (k === '3' || k === 'f') tryFlee();
			return;
		}
		if (mode === 'shop') {
			if (k === '1' || k === 'p') buyPotion();
			if (k === '2' || k === 'h') buyHeart();
			return;
		}
		if (mode !== 'play') {
			if (k === 'enter' || k === ' ') interact();
		}
	}

	function processHeldMovement(dt) {
		if (mode !== 'play') return;
		let dx = 0;
		let dy = 0;
		if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
		if (keys.has('arrowright') || keys.has('d')) dx += 1;
		if (keys.has('arrowup') || keys.has('w')) dy -= 1;
		if (keys.has('arrowdown') || keys.has('s')) dy += 1;
		if (dx !== 0 && dy !== 0) {
			dy = 0;
		}
		if (dx !== 0 || dy !== 0) tryMove(dx, dy);
	}

	/** @param {'up'|'down'|'left'|'right'} dir */
	function pressDir(dir) {
		if (dir === 'up') tryMove(0, -1);
		if (dir === 'down') tryMove(0, 1);
		if (dir === 'left') tryMove(-1, 0);
		if (dir === 'right') tryMove(1, 0);
	}

	// ——— Drawing ———
	function draw() {
		if (!ctx || !canvas) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, w, h);

		const viewW = MAP_W * TILE;
		const viewH = MAP_H * TILE;
		ctx.save();
		ctx.scale(SCALE, SCALE);

		ctx.fillStyle = '#05070d';
		ctx.fillRect(0, 0, viewW, viewH);

		for (let y = 0; y < MAP_H; y++) {
			for (let x = 0; x < MAP_W; x++) {
				drawTile(x, y, tileAt(x, y));
			}
		}

		const drawList = [...entities.filter((e) => !e.taken), { kind: 'player', x: player.x, y: player.y }];
		drawList.sort((a, b) => a.y - b.y || a.x - b.x);
		for (const e of drawList) {
			if (e.kind === 'player') drawPlayer(player.x, player.y);
			else drawEntity(/** @type {(typeof entities)[0]} */ (e));
		}

		if (flash > 0) {
			ctx.fillStyle = `rgba(255,255,255,${Math.min(0.45, flash)})`;
			ctx.fillRect(0, 0, viewW, viewH);
		}
		if (hurtFlash > 0) {
			ctx.fillStyle = `rgba(230,57,70,${Math.min(0.35, hurtFlash)})`;
			ctx.fillRect(0, 0, viewW, viewH);
		}

		ctx.restore();

		drawHudOverlay();
		if (levelBannerTimer > 0 && (mode === 'play' || mode === 'dialogue')) drawLevelBanner();
		if (mode === 'title') drawTitle();
		if (mode === 'dialogue') drawDialogue();
		if (mode === 'shop') drawShop();
		if (mode === 'battle') drawBattle();
		if (mode === 'levelcomplete') drawLevelComplete();
		if (mode === 'win') drawEnd(true);
		if (mode === 'gameover') drawEnd(false);
	}

	function drawTile(tx, ty, type) {
		if (!ctx) return;
		const x = tx * TILE;
		const y = ty * TILE;
		const checker = (tx + ty) % 2 === 0;

		if (
			type === T.GRASS ||
			type === T.FLOWER ||
			type === T.PATH ||
			type === T.PORTAL ||
			type === T.FLOOR ||
			type === T.LAVA
		) {
			ctx.fillStyle = checker ? COLORS.grassA : COLORS.grassB;
			ctx.fillRect(x, y, TILE, TILE);
		}

		if (type === T.PATH) {
			ctx.fillStyle = COLORS.path;
			ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
			ctx.fillStyle = COLORS.pathEdge;
			ctx.fillRect(x + 2, y + TILE - 3, TILE - 4, 1);
		}

		if (type === T.FLOWER) {
			ctx.fillStyle = COLORS.flower;
			ctx.fillRect(x + 5, y + 5, 2, 2);
			ctx.fillRect(x + 9, y + 7, 2, 2);
			ctx.fillRect(x + 6, y + 10, 2, 2);
			ctx.fillStyle = COLORS.flowerCenter;
			ctx.fillRect(x + 6, y + 6, 1, 1);
		}

		if (type === T.WATER) {
			const wave = Math.sin(anim * 3 + tx * 0.7 + ty) > 0;
			ctx.fillStyle = wave ? COLORS.waterA : COLORS.waterB;
			ctx.fillRect(x, y, TILE, TILE);
			ctx.fillStyle = 'rgba(255,255,255,0.25)';
			ctx.fillRect(x + 2, y + 3 + (wave ? 1 : 0), 4, 1);
		}

		if (type === T.LAVA) {
			const bubble = Math.sin(anim * 5 + tx * 1.3 + ty * 0.9) > 0;
			ctx.fillStyle = bubble ? COLORS.lavaA : COLORS.lavaB;
			ctx.fillRect(x, y, TILE, TILE);
			ctx.fillStyle = COLORS.lavaCrust;
			ctx.fillRect(x + 2, y + 2, 3, 2);
			ctx.fillRect(x + 9, y + 8, 4, 2);
			ctx.fillRect(x + 5, y + 12, 3, 1);
			ctx.fillStyle = 'rgba(255,255,255,0.35)';
			ctx.fillRect(x + 11, y + 3, 2, 1);
		}

		if (type === T.TREE) {
			ctx.fillStyle = checker ? COLORS.grassA : COLORS.grassB;
			ctx.fillRect(x, y, TILE, TILE);
			ctx.fillStyle = COLORS.treeTrunk;
			ctx.fillRect(x + 7, y + 10, 3, 5);
			ctx.fillStyle = COLORS.treeLeaf;
			ctx.fillRect(x + 3, y + 2, 10, 9);
			ctx.fillStyle = COLORS.treeLeafLite;
			ctx.fillRect(x + 5, y + 3, 4, 3);
		}

		if (type === T.ROCK) {
			ctx.fillStyle = checker ? COLORS.grassA : COLORS.grassB;
			ctx.fillRect(x, y, TILE, TILE);
			ctx.fillStyle = COLORS.rock;
			ctx.fillRect(x + 3, y + 6, 10, 7);
			ctx.fillStyle = COLORS.rockLite;
			ctx.fillRect(x + 4, y + 7, 4, 2);
		}

		if (type === T.BUSH) {
			ctx.fillStyle = checker ? COLORS.grassA : COLORS.grassB;
			ctx.fillRect(x, y, TILE, TILE);
			ctx.fillStyle = COLORS.bush;
			ctx.fillRect(x + 2, y + 6, 12, 7);
			ctx.fillStyle = '#95d5b2';
			ctx.fillRect(x + 4, y + 7, 3, 2);
		}

		if (type === T.PORTAL) {
			const pulse = 0.5 + 0.5 * Math.sin(anim * 4);
			ctx.fillStyle = COLORS.path;
			ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
			ctx.fillStyle = COLORS.portal;
			ctx.fillRect(x + 3, y + 3, 10, 10);
			ctx.fillStyle = COLORS.portalCore;
			ctx.fillRect(x + 5, y + 5, 6, 6);
			ctx.fillStyle = `rgba(255,255,255,${0.25 + pulse * 0.35})`;
			ctx.fillRect(x + 7, y + 7, 2, 2);
		}

		if (type === T.FLOOR) {
			ctx.fillStyle = COLORS.floor;
			ctx.fillRect(x, y, TILE, TILE);
			ctx.fillStyle = '#0a2a6b';
			ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
		}
	}

	function drawShadow(px, py) {
		if (!ctx) return;
		ctx.fillStyle = COLORS.shadow;
		ctx.fillRect(px + 3, py + 13, 10, 2);
	}

	function drawPlayer(tx, ty) {
		if (!ctx) return;
		const bob = mode === 'play' ? Math.floor(anim * 6) % 2 : 0;
		const px = tx * TILE;
		const py = ty * TILE - bob;
		drawShadow(tx * TILE, ty * TILE);

		ctx.fillStyle = P.boots;
		ctx.fillRect(px + 4, py + 12, 3, 2);
		ctx.fillRect(px + 9, py + 12, 3, 2);
		ctx.fillStyle = P.pants;
		ctx.fillRect(px + 5, py + 10, 6, 3);
		ctx.fillStyle = P.shirt;
		ctx.fillRect(px + 4, py + 6, 8, 5);
		ctx.fillStyle = P.skin;
		ctx.fillRect(px + 5, py + 3, 6, 4);
		ctx.fillStyle = P.hat;
		ctx.fillRect(px + 4, py + 1, 8, 3);
		ctx.fillRect(px + 5, py + 0, 6, 2);
		ctx.fillStyle = P.hatBand;
		ctx.fillRect(px + 4, py + 3, 8, 1);
		ctx.fillStyle = P.eyes;
		if (player.dir === 'left') {
			ctx.fillRect(px + 5, py + 4, 1, 1);
		} else if (player.dir === 'right') {
			ctx.fillRect(px + 10, py + 4, 1, 1);
		} else if (player.dir === 'up') {
			ctx.fillStyle = P.hat;
			ctx.fillRect(px + 5, py + 3, 6, 4);
		} else {
			ctx.fillRect(px + 6, py + 4, 1, 1);
			ctx.fillRect(px + 9, py + 4, 1, 1);
		}
	}

	/** @param {(typeof entities)[0]} e */
	function drawEntity(e) {
		if (!ctx) return;
		const px = e.x * TILE;
		const py = e.y * TILE;
		const bob = Math.floor(anim * 4 + e.x) % 2;

		if (e.kind === 'shard') {
			drawShadow(px, py);
			const glow = 0.5 + 0.5 * Math.sin(anim * 5 + e.x);
			ctx.fillStyle = '#4c8dff';
			ctx.fillRect(px + 6, py + 4 - bob, 4, 8);
			ctx.fillStyle = '#7fb2ff';
			ctx.fillRect(px + 7, py + 5 - bob, 2, 6);
			ctx.fillStyle = `rgba(255,255,255,${0.4 + glow * 0.4})`;
			ctx.fillRect(px + 7, py + 6 - bob, 2, 2);
			return;
		}

		if (e.kind === 'coin') {
			drawShadow(px, py);
			const spin = Math.floor(anim * 6 + e.y) % 2;
			ctx.fillStyle = '#ffcc00';
			ctx.fillRect(px + (spin ? 7 : 5), py + 6 - bob, spin ? 2 : 6, 4);
			ctx.fillStyle = '#fff3b0';
			ctx.fillRect(px + (spin ? 7 : 6), py + 7 - bob, spin ? 2 : 2, 2);
			return;
		}

		if (e.kind === 'heart') {
			drawShadow(px, py);
			ctx.fillStyle = '#e63946';
			ctx.fillRect(px + 4, py + 6 - bob, 3, 3);
			ctx.fillRect(px + 9, py + 6 - bob, 3, 3);
			ctx.fillRect(px + 4, py + 8 - bob, 8, 4);
			ctx.fillRect(px + 6, py + 12 - bob, 4, 1);
			ctx.fillStyle = 'rgba(255,255,255,0.5)';
			ctx.fillRect(px + 5, py + 7 - bob, 1, 1);
			return;
		}

		if (e.kind === 'key') {
			drawShadow(px, py);
			ctx.fillStyle = '#ffcc00';
			ctx.fillRect(px + 5, py + 5 - bob, 4, 4);
			ctx.fillRect(px + 8, py + 8 - bob, 2, 5);
			ctx.fillRect(px + 8, py + 10 - bob, 3, 1);
			ctx.fillRect(px + 8, py + 12 - bob, 3, 1);
			return;
		}

		if (e.kind === 'chest') {
			drawShadow(px, py);
			const body = e.locked ? '#8a6d3b' : '#b08968';
			ctx.fillStyle = body;
			ctx.fillRect(px + 3, py + 7, 10, 7);
			ctx.fillStyle = e.locked ? '#c9a227' : '#ddb892';
			ctx.fillRect(px + 3, py + 5, 10, 3);
			ctx.fillStyle = '#ffd60a';
			ctx.fillRect(px + 7, py + 8, 2, 3);
			if (e.locked) {
				ctx.fillStyle = '#111';
				ctx.fillRect(px + 7, py + 9, 2, 2);
			}
			return;
		}

		if (isEnemy(e)) {
			drawShadow(px, py);
			const jiggle = Math.floor(anim * 5 + e.y) % 2;
			const tune = ENEMIES[/** @type {keyof typeof ENEMIES} */ (e.enemyKind ?? 'slime')];
			const color = tune?.color ?? '#ffcc00';
			if (e.kind === 'boss') {
				ctx.fillStyle = color;
				ctx.fillRect(px + 2, py + 4 + jiggle, 12, 9);
				ctx.fillRect(px + 3, py + 3 + jiggle, 10, 2);
				ctx.fillStyle = '#fff';
				ctx.fillRect(px + 4, py + 6 + jiggle, 3, 3);
				ctx.fillRect(px + 9, py + 6 + jiggle, 3, 3);
				ctx.fillStyle = '#111';
				ctx.fillRect(px + 5, py + 7 + jiggle, 1, 2);
				ctx.fillRect(px + 10, py + 7 + jiggle, 1, 2);
				// crown
				ctx.fillStyle = '#ffcc00';
				ctx.fillRect(px + 3, py + 0 + jiggle, 2, 3);
				ctx.fillRect(px + 7, py + 0 + jiggle, 2, 3);
				ctx.fillRect(px + 11, py + 0 + jiggle, 2, 3);
				ctx.fillRect(px + 3, py + 2 + jiggle, 10, 1);
				// shard glow in chest
				const glow = 0.4 + 0.4 * Math.sin(anim * 6);
				ctx.fillStyle = `rgba(127,178,255,${glow})`;
				ctx.fillRect(px + 7, py + 9 + jiggle, 2, 2);
				return;
			}
			if (e.kind === 'wisp') {
				const hover = Math.sin(anim * 4 + e.x) > 0 ? -1 : 0;
				ctx.fillStyle = color;
				ctx.fillRect(px + 4, py + 5 + hover, 8, 7);
				ctx.fillRect(px + 5, py + 4 + hover, 6, 2);
				ctx.fillStyle = '#fff';
				ctx.fillRect(px + 6, py + 7 + hover, 2, 2);
				ctx.fillRect(px + 9, py + 7 + hover, 1, 1);
				ctx.fillStyle = '#111';
				ctx.fillRect(px + 6, py + 8 + hover, 2, 1);
				ctx.fillStyle = 'rgba(76,201,240,0.4)';
				ctx.fillRect(px + 6, py + 12, 4, 1);
				return;
			}
			if (e.kind === 'golem') {
				ctx.fillStyle = color;
				ctx.fillRect(px + 3, py + 5 + jiggle, 10, 8);
				ctx.fillRect(px + 4, py + 3 + jiggle, 8, 3);
				ctx.fillStyle = COLORS.rockLite;
				ctx.fillRect(px + 4, py + 6 + jiggle, 4, 2);
				ctx.fillStyle = '#e63946';
				ctx.fillRect(px + 5, py + 8 + jiggle, 2, 2);
				ctx.fillRect(px + 9, py + 8 + jiggle, 2, 2);
				return;
			}
			ctx.fillStyle = color;
			ctx.fillRect(px + 3, py + 6 + jiggle, 10, 8);
			ctx.fillRect(px + 4, py + 5 + jiggle, 8, 2);
			ctx.fillStyle = '#fff';
			ctx.fillRect(px + 5, py + 8 + jiggle, 2, 2);
			ctx.fillRect(px + 9, py + 8 + jiggle, 2, 2);
			ctx.fillStyle = '#111';
			ctx.fillRect(px + 6, py + 9 + jiggle, 1, 1);
			ctx.fillRect(px + 10, py + 9 + jiggle, 1, 1);
			ctx.fillStyle = 'rgba(255,255,255,0.35)';
			ctx.fillRect(px + 4, py + 7 + jiggle, 3, 1);
			return;
		}

		if (e.kind === 'npc' || e.kind === 'shop') {
			drawShadow(px, py);
			if (e.name === 'Owlbit') {
				ctx.fillStyle = '#d4a373';
				ctx.fillRect(px + 4, py + 5 + bob, 8, 9);
				ctx.fillStyle = '#faedcd';
				ctx.fillRect(px + 5, py + 7 + bob, 6, 5);
				ctx.fillStyle = '#fff';
				ctx.fillRect(px + 5, py + 5 + bob, 3, 3);
				ctx.fillRect(px + 8, py + 5 + bob, 3, 3);
				ctx.fillStyle = '#222';
				ctx.fillRect(px + 6, py + 6 + bob, 1, 1);
				ctx.fillRect(px + 9, py + 6 + bob, 1, 1);
				ctx.fillStyle = '#e85d04';
				ctx.fillRect(px + 7, py + 8 + bob, 2, 2);
				ctx.fillStyle = P.hat;
				ctx.fillRect(px + 6, py + 3 + bob, 4, 2);
			} else if (e.name === 'Marrow') {
				// hooded merchant
				ctx.fillStyle = '#5e548e';
				ctx.fillRect(px + 4, py + 4 + bob, 8, 4);
				ctx.fillRect(px + 3, py + 7 + bob, 10, 7);
				ctx.fillStyle = '#ffcc00';
				ctx.fillRect(px + 6, py + 8 + bob, 4, 4);
				ctx.fillStyle = '#222';
				ctx.fillRect(px + 6, py + 5 + bob, 1, 1);
				ctx.fillRect(px + 9, py + 5 + bob, 1, 1);
				ctx.fillStyle = '#9f86c0';
				ctx.fillRect(px + 12, py + 9 + bob, 2, 4);
			} else if (e.name === 'Sage Root') {
				ctx.fillStyle = '#2d6a4f';
				ctx.fillRect(px + 4, py + 6 + bob, 8, 8);
				ctx.fillStyle = '#95d5b2';
				ctx.fillRect(px + 5, py + 4 + bob, 6, 4);
				ctx.fillStyle = '#222';
				ctx.fillRect(px + 6, py + 6 + bob, 1, 1);
				ctx.fillRect(px + 9, py + 6 + bob, 1, 1);
				ctx.fillStyle = '#d8f3dc';
				ctx.fillRect(px + 7, py + 10 + bob, 2, 3);
			} else {
				// fox
				ctx.fillStyle = '#f4a261';
				ctx.fillRect(px + 4, py + 6 + bob, 8, 7);
				ctx.fillStyle = '#e76f51';
				ctx.fillRect(px + 12, py + 8 + bob, 2, 5);
				ctx.fillStyle = '#fff';
				ctx.fillRect(px + 5, py + 9 + bob, 4, 3);
				ctx.fillStyle = '#222';
				ctx.fillRect(px + 6, py + 7 + bob, 1, 1);
				ctx.fillRect(px + 9, py + 7 + bob, 1, 1);
				ctx.fillStyle = '#f4a261';
				ctx.fillRect(px + 4, py + 4 + bob, 2, 3);
				ctx.fillRect(px + 10, py + 4 + bob, 2, 3);
			}
		}
	}

	function drawHudOverlay() {
		if (!ctx || !canvas || mode === 'title') return;
		if (message && messageTimer > 0) {
			ctx.fillStyle = 'rgba(5,7,13,0.82)';
			roundRect(ctx, 16, canvas.height - 52, canvas.width - 32, 36, 8);
			ctx.fill();
			ctx.fillStyle = '#f4f1e9';
			ctx.font = '600 14px Roboto, system-ui, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(message, canvas.width / 2, canvas.height - 28);
		}
	}

	function drawLevelBanner() {
		if (!ctx || !canvas) return;
		const lv = currentLevel();
		ctx.textAlign = 'center';
		ctx.fillStyle = 'rgba(5,7,13,0.72)';
		roundRect(ctx, canvas.width / 2 - 260, 26, 520, 64, 10);
		ctx.fill();
		ctx.fillStyle = '#4c8dff';
		ctx.font = '700 20px Roboto, system-ui, sans-serif';
		ctx.fillText(lv.name, canvas.width / 2, 54);
		ctx.fillStyle = 'rgba(244,241,233,0.85)';
		ctx.font = '13px Roboto, system-ui, sans-serif';
		ctx.fillText(lv.hint, canvas.width / 2, 74);
	}

	function drawTitle() {
		if (!ctx || !canvas) return;
		ctx.fillStyle = 'rgba(4,6,10,0.72)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const pulse = 0.85 + 0.15 * Math.sin(anim * 3);
		ctx.textAlign = 'center';
		ctx.fillStyle = `rgba(76,141,255,${pulse})`;
		ctx.font = '700 36px Roboto, system-ui, sans-serif';
		ctx.fillText('NEON GROVE', canvas.width / 2, canvas.height * 0.24);

		ctx.fillStyle = '#ffcc00';
		ctx.font = '600 16px Roboto, system-ui, sans-serif';
		ctx.fillText('A tiny pixel RPG · 3 levels', canvas.width / 2, canvas.height * 0.24 + 28);

		ctx.fillStyle = 'rgba(255,255,255,0.88)';
		ctx.font = '14px Roboto, system-ui, sans-serif';
		ctx.fillText('Collect shards · beat the Null King · your save persists', canvas.width / 2, canvas.height * 0.4);
		LEVELS.forEach((lv, i) => {
			const locked = i > unlocked;
			ctx.fillStyle = locked ? 'rgba(255,255,255,0.35)' : i === 0 ? '#00bbf9' : 'rgba(255,255,255,0.75)';
			ctx.font = '13px Roboto, system-ui, sans-serif';
			ctx.fillText(
				`${locked ? '🔒' : '◆'} ${lv.name} — ${lv.subtitle}`,
				canvas.width / 2,
				canvas.height * 0.4 + 24 + i * 20
			);
		});
		if (hasSave) {
			ctx.fillStyle = 'rgba(255,204,0,0.9)';
			ctx.font = '13px Roboto, system-ui, sans-serif';
			ctx.fillText(`💾 ${saveLabel}`, canvas.width / 2, canvas.height * 0.4 + 24 + LEVELS.length * 20 + 6);
		}

		ctx.fillStyle = 'rgba(255,255,255,0.75)';
		ctx.font = '13px Roboto, system-ui, sans-serif';
		ctx.fillText('Move: WASD / Arrows · Action: Space / E', canvas.width / 2, canvas.height * 0.72);

		const blink = Math.sin(anim * 4) > 0;
		if (blink) {
			ctx.fillStyle = '#00bbf9';
			ctx.font = '600 15px Roboto, system-ui, sans-serif';
			ctx.fillText(
				hasSave ? 'Press Space for a new run — or Continue below' : 'Press Space or tap Start to begin',
				canvas.width / 2,
				canvas.height * 0.8
			);
		}

		ctx.save();
		ctx.translate(canvas.width / 2 - 24, canvas.height * 0.84);
		ctx.scale(3, 3);
		drawPlayerSprite(0, 0);
		ctx.restore();
	}

	function drawPlayerSprite(px, py) {
		if (!ctx) return;
		ctx.fillStyle = P.boots;
		ctx.fillRect(px + 4, py + 12, 3, 2);
		ctx.fillRect(px + 9, py + 12, 3, 2);
		ctx.fillStyle = P.pants;
		ctx.fillRect(px + 5, py + 10, 6, 3);
		ctx.fillStyle = P.shirt;
		ctx.fillRect(px + 4, py + 6, 8, 5);
		ctx.fillStyle = P.skin;
		ctx.fillRect(px + 5, py + 3, 6, 4);
		ctx.fillStyle = P.hat;
		ctx.fillRect(px + 4, py + 1, 8, 3);
		ctx.fillRect(px + 5, py + 0, 6, 2);
		ctx.fillStyle = P.hatBand;
		ctx.fillRect(px + 4, py + 3, 8, 1);
		ctx.fillStyle = P.eyes;
		ctx.fillRect(px + 6, py + 4, 1, 1);
		ctx.fillRect(px + 9, py + 4, 1, 1);
	}

	function drawDialogue() {
		if (!ctx || !canvas || !dialogue) return;
		const boxY = canvas.height - 120;
		ctx.fillStyle = 'rgba(5,7,13,0.92)';
		roundRect(ctx, 18, boxY, canvas.width - 36, 100, 12);
		ctx.fill();
		ctx.strokeStyle = 'rgba(76,141,255,0.55)';
		ctx.lineWidth = 2;
		roundRect(ctx, 18, boxY, canvas.width - 36, 100, 12);
		ctx.stroke();

		ctx.textAlign = 'left';
		ctx.fillStyle = '#4c8dff';
		ctx.font = '700 15px Roboto, system-ui, sans-serif';
		ctx.fillText(dialogue.speaker, 36, boxY + 28);

		ctx.fillStyle = '#f4f1e9';
		ctx.font = '14px Roboto, system-ui, sans-serif';
		wrapText(ctx, dialogue.lines[dialogue.index], 36, boxY + 52, canvas.width - 72, 18);

		ctx.fillStyle = 'rgba(255,255,255,0.55)';
		ctx.font = '12px Roboto, system-ui, sans-serif';
		ctx.textAlign = 'right';
		ctx.fillText(
			shopkeeper ? 'Space / Action · open shop' : 'Space / Action · continue',
			canvas.width - 36,
			boxY + 88
		);
	}

	function drawShop() {
		if (!ctx || !canvas || !shopkeeper) return;
		ctx.fillStyle = 'rgba(5,7,13,0.82)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ffcc00';
		ctx.font = '700 22px Roboto, system-ui, sans-serif';
		ctx.fillText(`${shopkeeper.name}'s wares`, canvas.width / 2, canvas.height * 0.3);
		ctx.fillStyle = 'rgba(255,255,255,0.85)';
		ctx.font = '14px Roboto, system-ui, sans-serif';
		ctx.fillText(`Stardust: ${player.coins} · Potions: ${player.potions} · Max HP: ${player.maxHp}`, canvas.width / 2, canvas.height * 0.3 + 28);
		ctx.fillText(`1 · Glow Potion (+${SHOP.potionHeal} HP in battle) — ${SHOP.potionPrice} stardust`, canvas.width / 2, canvas.height * 0.46);
		ctx.fillText(`2 · Heartfruit (+1 max HP) — ${SHOP.heartPrice} stardust`, canvas.width / 2, canvas.height * 0.46 + 24);
		ctx.fillStyle = '#4c8dff';
		ctx.font = '600 13px Roboto, system-ui, sans-serif';
		ctx.fillText('Use the buttons below (or 1 / 2) · Space to leave', canvas.width / 2, canvas.height * 0.62);
	}

	function drawBattle() {
		if (!ctx || !canvas || !battle) return;
		ctx.fillStyle = 'rgba(5,7,13,0.78)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const shake = battle.anim > 0 ? Math.sin(battle.anim * 40) * 4 : 0;

		ctx.save();
		ctx.translate(canvas.width / 2 + shake, canvas.height * 0.28);
		const big = battle.enemy.kind === 'boss' ? 7 : 6;
		ctx.scale(big, big);
		const enemy = battle.enemy;
		const tune = ENEMIES[/** @type {keyof typeof ENEMIES} */ (enemy.enemyKind ?? 'slime')];
		ctx.fillStyle = tune?.color ?? '#ffcc00';
		ctx.fillRect(-5, -2, 10, 8);
		ctx.fillRect(-4, -3, 8, 2);
		ctx.fillStyle = '#fff';
		ctx.fillRect(-3, 0, 2, 2);
		ctx.fillRect(1, 0, 2, 2);
		ctx.fillStyle = '#111';
		ctx.fillRect(-2, 1, 1, 1);
		ctx.fillRect(2, 1, 1, 1);
		if (enemy.kind === 'boss') {
			ctx.fillStyle = '#ffcc00';
			ctx.fillRect(-4, -5, 2, 2);
			ctx.fillRect(-1, -5, 2, 2);
			ctx.fillRect(2, -5, 2, 2);
		}
		ctx.restore();

		ctx.textAlign = 'center';
		ctx.fillStyle = '#fff';
		ctx.font = '700 18px Roboto, system-ui, sans-serif';
		ctx.fillText(
			`${enemy.name ?? 'Slime'}${enemy.dropsShard ? ' 👑' : ''}`,
			canvas.width / 2,
			canvas.height * 0.42
		);

		drawBar(canvas.width / 2 - 80, canvas.height * 0.46, 160, 12, (enemy.hp ?? 0) / (enemy.maxHp ?? 1), '#ffcc00');
		ctx.fillStyle = 'rgba(255,255,255,0.75)';
		ctx.font = '12px Roboto, system-ui, sans-serif';
		ctx.fillText(`HP ${enemy.hp}/${enemy.maxHp}`, canvas.width / 2, canvas.height * 0.46 + 28);

		drawBar(40, canvas.height - 150, 160, 12, player.hp / player.maxHp, '#00bbf9');
		ctx.textAlign = 'left';
		ctx.fillText(`You  HP ${player.hp}/${player.maxHp}  ·  Potions ${player.potions}`, 40, canvas.height - 120);

		ctx.fillStyle = 'rgba(255,255,255,0.8)';
		ctx.font = '13px Roboto, system-ui, sans-serif';
		battle.log.forEach((line, i) => {
			ctx.fillText(line, 40, canvas.height - 95 + i * 16);
		});

		ctx.textAlign = 'center';
		ctx.fillStyle = battle.playerTurn ? '#4c8dff' : 'rgba(255,255,255,0.45)';
		ctx.font = '600 13px Roboto, system-ui, sans-serif';
		ctx.fillText(
			battle.playerTurn ? '1 Attack · 2 Potion · 3 Flee  (or use buttons)' : '…enemy turn…',
			canvas.width / 2,
			canvas.height - 28
		);
	}

	function drawLevelComplete() {
		if (!ctx || !canvas) return;
		const lv = currentLevel();
		const next = LEVELS[levelIndex + 1];
		ctx.fillStyle = 'rgba(4,6,10,0.8)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = 'center';
		ctx.fillStyle = '#4c8dff';
		ctx.font = '700 30px Roboto, system-ui, sans-serif';
		ctx.fillText(`${lv.name} clear!`, canvas.width / 2, canvas.height * 0.36);
		ctx.fillStyle = '#f4f1e9';
		ctx.font = '15px Roboto, system-ui, sans-serif';
		ctx.fillText(
			`Shards ${player.shards}/${lv.shardsNeeded} · Kills ${player.killsRun} · Steps ${player.stepsRun}`,
			canvas.width / 2,
			canvas.height * 0.46
		);
		if (next) {
			ctx.fillText(`Next: ${next.name} — ${next.hint}`, canvas.width / 2, canvas.height * 0.46 + 26);
		}
		const blink = Math.sin(anim * 4) > 0;
		if (blink) {
			ctx.fillStyle = '#00bbf9';
			ctx.font = '600 14px Roboto, system-ui, sans-serif';
			ctx.fillText('Press Space / Action for the next level', canvas.width / 2, canvas.height * 0.62);
		}
	}

	function drawEnd(won) {
		if (!ctx || !canvas) return;
		ctx.fillStyle = 'rgba(4,6,10,0.8)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = 'center';
		ctx.fillStyle = won ? '#4c8dff' : '#ffcc00';
		ctx.font = '700 32px Roboto, system-ui, sans-serif';
		ctx.fillText(won ? 'Grove Restored!' : 'You fainted…', canvas.width / 2, canvas.height * 0.36);
		ctx.fillStyle = '#f4f1e9';
		ctx.font = '15px Roboto, system-ui, sans-serif';
		if (won) {
			ctx.fillText('The Null King poofs. The portal sings in azure light.', canvas.width / 2, canvas.height * 0.46);
			ctx.fillText(
				`Lv.${player.playerLevel} · Steps ${player.stepsRun} · Kills ${player.killsRun} · Wins ${victories}`,
				canvas.width / 2,
				canvas.height * 0.46 + 26
			);
			if (bestSteps !== null)
				ctx.fillText(`Best adventure: ${bestSteps} steps`, canvas.width / 2, canvas.height * 0.46 + 52);
		} else {
			ctx.fillText('Even heroes need a potion break. Retry from your checkpoint!', canvas.width / 2, canvas.height * 0.46);
			ctx.fillText(
				`${currentLevel().name} · Shards ${player.shards}/${currentLevel().shardsNeeded}`,
				canvas.width / 2,
				canvas.height * 0.46 + 26
			);
		}
		const blink = Math.sin(anim * 4) > 0;
		if (blink) {
			ctx.fillStyle = '#00bbf9';
			ctx.font = '600 14px Roboto, system-ui, sans-serif';
			ctx.fillText('Press Space / Action for title', canvas.width / 2, canvas.height * 0.64);
		}
	}

	function drawBar(x, y, w, h, ratio, color) {
		if (!ctx) return;
		ctx.fillStyle = 'rgba(0,0,0,0.45)';
		roundRect(ctx, x, y, w, h, 4);
		ctx.fill();
		ctx.fillStyle = color;
		roundRect(ctx, x, y, Math.max(0, w * Math.min(1, ratio)), h, 4);
		ctx.fill();
	}

	/**
	 * @param {CanvasRenderingContext2D} c
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} r
	 */
	function roundRect(c, x, y, w, h, r) {
		const rr = Math.min(r, w / 2, h / 2);
		c.beginPath();
		c.moveTo(x + rr, y);
		c.arcTo(x + w, y, x + w, y + h, rr);
		c.arcTo(x + w, y + h, x, y + h, rr);
		c.arcTo(x, y + h, x, y, rr);
		c.arcTo(x, y, x + w, y, rr);
		c.closePath();
	}

	/**
	 * @param {CanvasRenderingContext2D} c
	 * @param {string} text
	 * @param {number} x
	 * @param {number} y
	 * @param {number} maxWidth
	 * @param {number} lineHeight
	 */
	function wrapText(c, text, x, y, maxWidth, lineHeight) {
		const words = text.split(' ');
		let line = '';
		let yy = y;
		for (const word of words) {
			const test = line ? `${line} ${word}` : word;
			if (c.measureText(test).width > maxWidth && line) {
				c.fillText(line, x, yy);
				line = word;
				yy += lineHeight;
			} else {
				line = test;
			}
		}
		if (line) c.fillText(line, x, yy);
	}

	function tick(ts) {
		if (!running) return;
		const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
		last = ts;
		anim += dt;
		frame += 1;
		if (moveCooldown > 0) moveCooldown -= dt;
		if (lavaCooldown > 0) lavaCooldown -= dt;
		if (flash > 0) flash -= dt;
		if (hurtFlash > 0) hurtFlash -= dt;
		if (levelBannerTimer > 0) levelBannerTimer -= dt;
		if (messageTimer > 0) {
			messageTimer -= dt;
			if (messageTimer <= 0) message = '';
		}
		if (battle && battle.anim > 0) battle.anim -= dt;

		processHeldMovement(dt);
		draw();
		raf = requestAnimationFrame(tick);
	}

	function mount(el) {
		canvas = el;
		ctx = canvas.getContext('2d');
		canvas.width = MAP_W * TILE * SCALE;
		canvas.height = MAP_H * TILE * SCALE;
		// restore meta (unlocks/victories) without leaving the title
		const s = readSave();
		if (s) {
			unlocked = Math.min(Math.max(0, s.unlocked | 0), LEVELS.length - 1);
			if (typeof s.victories === 'number') victories = s.victories;
			if (typeof s.bestSteps === 'number') bestSteps = s.bestSteps;
		}
		refreshSaveLabel();
		// fresh board behind the title screen
		levelIndex = 0;
		entities = buildEntities(0);
		const lv0 = LEVELS[0];
		player.x = lv0.spawn.x;
		player.y = lv0.spawn.y;
		running = true;
		last = performance.now();
		window.addEventListener('keydown', onKeyDown, { passive: false });
		window.addEventListener('keyup', onKeyUp);
		raf = requestAnimationFrame(tick);
		notify();
	}

	function unmount() {
		running = false;
		cancelAnimationFrame(raf);
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('keyup', onKeyUp);
		canvas = null;
		ctx = null;
	}

	function getState() {
		const lv = LEVELS[levelIndex];
		return {
			mode,
			levelIndex,
			levelName: lv.name,
			levelHint: lv.hint,
			levelCount: LEVELS.length,
			unlocked,
			hasSave,
			saveLabel,
			victories,
			bestSteps,
			px: player.x,
			py: player.y,
			pdir: player.dir,
			hp: player.hp,
			maxHp: player.maxHp,
			potions: player.potions,
			coins: player.coins,
			keysHeld: player.keysHeld,
			shards: player.shards,
			shardsNeeded: lv.shardsNeeded,
			steps: player.stepsRun,
			kills: player.killsRun,
			playerLevel: player.playerLevel,
			xp: player.xp,
			xpNext: player.xpNext,
			message,
			battleTurn: battle?.playerTurn ?? false,
			inBattle: mode === 'battle',
			inShop: mode === 'shop',
			talkedToOwl: quest.talkedToOwl,
			shopkeeperName: shopkeeper?.name ?? '',
			potionPrice: SHOP.potionPrice,
			heartPrice: SHOP.heartPrice
		};
	}

	return {
		mount,
		unmount,
		getState,
		pressDir,
		interact,
		playerAttack,
		usePotionInBattle,
		tryFlee,
		buyPotion,
		buyHeart,
		closeShop,
		nextLevel,
		retryLevel,
		toTitle,
		saveNow: () => {
			persist();
			notify();
		},
		continueFromSave,
		eraseSave,
		startNewRun,
		start: () => {
			if (mode === 'title') resetWorld();
		},
		width: MAP_W * TILE * SCALE,
		height: MAP_H * TILE * SCALE
	};
}
