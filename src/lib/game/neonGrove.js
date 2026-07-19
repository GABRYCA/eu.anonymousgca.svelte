/**
 * Neon Grove — a tiny top-down pixel RPG engine.
 * Pure canvas drawing (no external sprites). Returns a controller for UI binding.
 */

/** @typedef {'title' | 'play' | 'dialogue' | 'battle' | 'win' | 'gameover'} GameMode */

const TILE = 16;
const MAP_W = 22;
const MAP_H = 16;
const SCALE = 3;

// Tile types
const T = {
	GRASS: 0,
	PATH: 1,
	FLOWER: 2,
	WATER: 3,
	TREE: 4,
	ROCK: 5,
	BUSH: 6,
	PORTAL: 7,
	FLOOR: 8
};

const SOLID = new Set([T.WATER, T.TREE, T.ROCK, T.BUSH]);

// Hand-crafted cozy map: open grove with ponds, paths, and secrets
const MAP = [
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[4, 0, 0, 2, 0, 0, 0, 4, 0, 0, 1, 1, 1, 0, 0, 2, 0, 0, 0, 2, 0, 4],
	[4, 0, 5, 0, 0, 4, 0, 0, 0, 1, 1, 8, 1, 1, 0, 0, 4, 0, 5, 0, 0, 4],
	[4, 2, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 4],
	[4, 0, 0, 1, 1, 0, 0, 2, 0, 0, 0, 3, 3, 0, 1, 1, 1, 0, 6, 0, 0, 4],
	[4, 0, 4, 1, 0, 0, 3, 3, 3, 0, 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 4, 4],
	[4, 0, 0, 1, 0, 0, 3, 3, 3, 0, 2, 0, 0, 0, 4, 0, 1, 1, 1, 0, 0, 4],
	[4, 2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 4],
	[4, 0, 0, 0, 0, 1, 0, 4, 0, 1, 1, 1, 1, 1, 0, 4, 0, 0, 1, 0, 0, 4],
	[4, 0, 6, 0, 0, 1, 0, 0, 0, 1, 0, 7, 0, 1, 0, 0, 0, 0, 1, 5, 0, 4],
	[4, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 4],
	[4, 2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4],
	[4, 0, 0, 0, 0, 0, 5, 0, 0, 4, 0, 0, 0, 4, 0, 0, 5, 0, 0, 0, 0, 4],
	[4, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 2, 0, 4],
	[4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 4, 0, 0, 0, 4],
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
];

const COLORS = {
	grassA: '#2d6a4f',
	grassB: '#40916c',
	path: '#c4a574',
	pathEdge: '#a9845a',
	flower: '#f72585',
	flowerCenter: '#ffd60a',
	waterA: '#48cae4',
	waterB: '#0077b6',
	treeTrunk: '#6f4518',
	treeLeaf: '#1b4332',
	treeLeafLite: '#2d6a4f',
	rock: '#6c757d',
	rockLite: '#adb5bd',
	bush: '#52b788',
	portal: '#c77dff',
	portalCore: '#e0aaff',
	floor: '#3c096c',
	shadow: 'rgba(0,0,0,0.28)'
};

const P = {
	skin: '#ffcdb2',
	hat: '#9b5de5',
	hatBand: '#f15bb5',
	shirt: '#00bbf9',
	pants: '#3a0ca3',
	boots: '#3d2914',
	eyes: '#1a1a2e'
};

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
	let flash = 0;
	let message = '';
	let messageTimer = 0;

	const keys = new Set();
	/** @type {Set<string>} */
	const held = new Set();

	const player = {
		x: 11,
		y: 13,
		dir: 'down',
		hp: 5,
		maxHp: 5,
		potions: 0,
		shards: 0,
		steps: 0
	};

	/** @type {{x:number,y:number,kind:string,taken?:boolean,hp?:number,maxHp?:number,name?:string,lines?:string[],done?:boolean}[]} */
	let entities = [];

	/** @type {{speaker:string, lines:string[], index:number, onDone?:()=>void} | null} */
	let dialogue = null;

	/** @type {{enemy: typeof entities[0], log:string[], playerTurn:boolean, anim:number} | null} */
	let battle = null;

	const quest = {
		talkedToOwl: false,
		shardsNeeded: 3,
		complete: false
	};

	function resetWorld() {
		player.x = 11;
		player.y = 13;
		player.dir = 'down';
		player.hp = 5;
		player.maxHp = 5;
		player.potions = 0;
		player.shards = 0;
		player.steps = 0;
		quest.talkedToOwl = false;
		quest.complete = false;
		message = '';
		messageTimer = 0;
		dialogue = null;
		battle = null;
		mode = 'play';

		entities = [
			{
				x: 11,
				y: 8,
				kind: 'npc',
				name: 'Owlbit',
				lines: [
					'Hoot! Welcome to Neon Grove, little coder.',
					'Three Source Shards fell when the night glitched.',
					'Find them, then step into the portal to restore the forest!',
					'Slimes are soft… but they still bite. Carry a potion if you can.'
				]
			},
			{ x: 3, y: 2, kind: 'shard', taken: false },
			{ x: 18, y: 4, kind: 'shard', taken: false },
			{ x: 6, y: 12, kind: 'shard', taken: false },
			{ x: 16, y: 11, kind: 'chest', taken: false },
			{ x: 8, y: 5, kind: 'slime', hp: 3, maxHp: 3, name: 'Glitch Slime' },
			{ x: 15, y: 7, kind: 'slime', hp: 3, maxHp: 3, name: 'Pixel Blob' },
			{ x: 4, y: 10, kind: 'slime', hp: 4, maxHp: 4, name: 'Bug Jelly' },
			{
				x: 19,
				y: 13,
				kind: 'npc',
				name: 'Fox.exe',
				lines: [
					'Sniff… you smell like JavaScript.',
					'There is a shiny chest near the south trees.',
					'Also: water is wet. You are welcome.'
				]
			}
		];
		notify();
	}

	function notify() {
		onHud();
	}

	function tileAt(x, y) {
		if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return T.TREE;
		return MAP[y][x];
	}

	function isBlocked(x, y) {
		if (SOLID.has(tileAt(x, y))) return true;
		return entities.some(
			(e) =>
				e.x === x &&
				e.y === y &&
				!e.taken &&
				(e.kind === 'npc' || e.kind === 'slime' || e.kind === 'chest' || e.kind === 'shard')
		);
	}

	function entityAt(x, y) {
		return entities.find((e) => e.x === x && e.y === y && !e.taken) ?? null;
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

		if (target?.kind === 'slime') {
			startBattle(target);
			return;
		}

		if (target && (target.kind === 'npc' || target.kind === 'chest' || target.kind === 'shard')) {
			// bump interact
			interactWith(target);
			moveCooldown = 0.18;
			return;
		}

		if (!isBlocked(nx, ny) && !(nx === player.x && ny === player.y)) {
			// allow stepping on empty tiles even if entity was taken
			const solidEntity = entities.some(
				(e) => e.x === nx && e.y === ny && !e.taken && e.kind !== 'shard'
			);
			// shards and chests handled above; free walk
			if (!SOLID.has(tileAt(nx, ny)) && !solidEntity) {
				player.x = nx;
				player.y = ny;
				player.steps += 1;
				moveCooldown = 0.14;
				checkTileEvents();
				notify();
			}
		}
	}

	function checkTileEvents() {
		// pick up shard by standing? shards are entities - interact only
		if (tileAt(player.x, player.y) === T.PORTAL) {
			if (player.shards >= quest.shardsNeeded) {
				quest.complete = true;
				mode = 'win';
				notify();
			} else {
				toast(`Portal hums… need ${quest.shardsNeeded - player.shards} more shard(s).`);
			}
		}
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
		if (mode === 'dialogue' && dialogue) {
			dialogue.index += 1;
			if (dialogue.index >= dialogue.lines.length) {
				const done = dialogue.onDone;
				dialogue = null;
				mode = 'play';
				done?.();
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
		// also interact with portal underfoot via action
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
					quest.talkedToOwl = true;
					toast('Quest updated: collect 3 Source Shards!');
				}
			});
			return;
		}
		if (target.kind === 'shard') {
			target.taken = true;
			player.shards += 1;
			toast(`Source Shard collected! (${player.shards}/${quest.shardsNeeded})`);
			flash = 0.35;
			notify();
			return;
		}
		if (target.kind === 'chest') {
			target.taken = true;
			player.potions += 1;
			toast('Chest! You found a Glow Potion (+1).');
			notify();
			return;
		}
		if (target.kind === 'slime') {
			startBattle(target);
		}
	}

	function openDialogue(speaker, lines, onDone) {
		dialogue = { speaker, lines, index: 0, onDone };
		mode = 'dialogue';
		notify();
	}

	function startBattle(enemy) {
		battle = {
			enemy,
			log: [`A wild ${enemy.name ?? 'slime'} wiggles closer!`],
			playerTurn: true,
			anim: 0
		};
		mode = 'battle';
		notify();
	}

	function playerAttack() {
		if (!battle || !battle.playerTurn) return;
		const dmg = 1 + (Math.random() < 0.2 ? 1 : 0);
		battle.enemy.hp = Math.max(0, (battle.enemy.hp ?? 1) - dmg);
		battle.log = [`You bonk for ${dmg}!`, ...battle.log].slice(0, 4);
		battle.anim = 0.25;
		battle.playerTurn = false;
		notify();

		if ((battle.enemy.hp ?? 0) <= 0) {
			setTimeout(() => {
				if (!battle) return;
				battle.enemy.taken = true;
				toast(`${battle.enemy.name ?? 'Slime'} poofs into sparkles!`);
				battle = null;
				mode = 'play';
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
		const heal = 3;
		player.hp = Math.min(player.maxHp, player.hp + heal);
		battle.log = [`Potion heals ${heal} HP!`, ...battle.log].slice(0, 4);
		battle.playerTurn = false;
		notify();
		setTimeout(enemyAttack, 480);
	}

	function enemyAttack() {
		if (!battle || mode !== 'battle') return;
		const dmg = 1 + (Math.random() < 0.15 ? 1 : 0);
		player.hp = Math.max(0, player.hp - dmg);
		battle.log = [`${battle.enemy.name ?? 'Slime'} squishes you for ${dmg}!`, ...battle.log].slice(
			0,
			4
		);
		battle.anim = 0.25;
		flash = 0.2;
		notify();

		if (player.hp <= 0) {
			setTimeout(() => {
				battle = null;
				mode = 'gameover';
				notify();
			}, 500);
			return;
		}

		battle.playerTurn = true;
		notify();
	}

	function tryFlee() {
		if (!battle || !battle.playerTurn) return;
		if (Math.random() < 0.55) {
			toast('You scoot away safely!');
			battle = null;
			mode = 'play';
			// step back
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
		// prefer single axis for grid feel
		if (dx !== 0 && dy !== 0) {
			// keep last pressed priority roughly: horizontal if both
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

		// camera
		const viewW = MAP_W * TILE;
		const viewH = MAP_H * TILE;
		ctx.save();
		ctx.scale(SCALE, SCALE);

		// soft night sky behind map edges
		ctx.fillStyle = '#12001f';
		ctx.fillRect(0, 0, viewW, viewH);

		for (let y = 0; y < MAP_H; y++) {
			for (let x = 0; x < MAP_W; x++) {
				drawTile(x, y, tileAt(x, y));
			}
		}

		// entities under player depth sort
		const drawList = [...entities.filter((e) => !e.taken), { kind: 'player', x: player.x, y: player.y }];
		drawList.sort((a, b) => a.y - b.y || a.x - b.x);
		for (const e of drawList) {
			if (e.kind === 'player') drawPlayer(player.x, player.y);
			else drawEntity(e);
		}

		// flash
		if (flash > 0) {
			ctx.fillStyle = `rgba(255,255,255,${Math.min(0.45, flash)})`;
			ctx.fillRect(0, 0, viewW, viewH);
		}

		ctx.restore();

		// UI overlays in screen pixels
		drawHudOverlay();
		if (mode === 'title') drawTitle();
		if (mode === 'dialogue') drawDialogue();
		if (mode === 'battle') drawBattle();
		if (mode === 'win') drawEnd(true);
		if (mode === 'gameover') drawEnd(false);
	}

	function drawTile(tx, ty, type) {
		if (!ctx) return;
		const x = tx * TILE;
		const y = ty * TILE;
		const checker = (tx + ty) % 2 === 0;

		if (type === T.GRASS || type === T.FLOWER || type === T.PATH || type === T.PORTAL || type === T.FLOOR) {
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
			ctx.fillStyle = '#5a189a';
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

		// boots
		ctx.fillStyle = P.boots;
		ctx.fillRect(px + 4, py + 12, 3, 2);
		ctx.fillRect(px + 9, py + 12, 3, 2);
		// pants
		ctx.fillStyle = P.pants;
		ctx.fillRect(px + 5, py + 10, 6, 3);
		// body
		ctx.fillStyle = P.shirt;
		ctx.fillRect(px + 4, py + 6, 8, 5);
		// head
		ctx.fillStyle = P.skin;
		ctx.fillRect(px + 5, py + 3, 6, 4);
		// hat
		ctx.fillStyle = P.hat;
		ctx.fillRect(px + 4, py + 1, 8, 3);
		ctx.fillRect(px + 5, py + 0, 6, 2);
		ctx.fillStyle = P.hatBand;
		ctx.fillRect(px + 4, py + 3, 8, 1);
		// eyes
		ctx.fillStyle = P.eyes;
		if (player.dir === 'left') {
			ctx.fillRect(px + 5, py + 4, 1, 1);
		} else if (player.dir === 'right') {
			ctx.fillRect(px + 10, py + 4, 1, 1);
		} else if (player.dir === 'up') {
			// back of head
			ctx.fillStyle = P.hat;
			ctx.fillRect(px + 5, py + 3, 6, 4);
		} else {
			ctx.fillRect(px + 6, py + 4, 1, 1);
			ctx.fillRect(px + 9, py + 4, 1, 1);
		}
	}

	function drawEntity(e) {
		if (!ctx) return;
		const px = e.x * TILE;
		const py = e.y * TILE;
		const bob = Math.floor(anim * 4 + e.x) % 2;

		if (e.kind === 'shard') {
			drawShadow(px, py);
			const glow = 0.5 + 0.5 * Math.sin(anim * 5 + e.x);
			ctx.fillStyle = '#c77dff';
			ctx.fillRect(px + 6, py + 4 - bob, 4, 8);
			ctx.fillStyle = '#e0aaff';
			ctx.fillRect(px + 7, py + 5 - bob, 2, 6);
			ctx.fillStyle = `rgba(255,255,255,${0.4 + glow * 0.4})`;
			ctx.fillRect(px + 7, py + 6 - bob, 2, 2);
			return;
		}

		if (e.kind === 'chest') {
			drawShadow(px, py);
			ctx.fillStyle = '#b08968';
			ctx.fillRect(px + 3, py + 7, 10, 7);
			ctx.fillStyle = '#ddb892';
			ctx.fillRect(px + 3, py + 5, 10, 3);
			ctx.fillStyle = '#ffd60a';
			ctx.fillRect(px + 7, py + 8, 2, 3);
			return;
		}

		if (e.kind === 'slime') {
			drawShadow(px, py);
			const jiggle = Math.floor(anim * 5 + e.y) % 2;
			ctx.fillStyle = e.name === 'Bug Jelly' ? '#80ed99' : e.name === 'Pixel Blob' ? '#4cc9f0' : '#f72585';
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

		if (e.kind === 'npc') {
			drawShadow(px, py);
			if (e.name === 'Owlbit') {
				// owl
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
				// tiny hat tip to brand
				ctx.fillStyle = P.hat;
				ctx.fillRect(px + 6, py + 3 + bob, 4, 2);
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
				// ears
				ctx.fillStyle = '#f4a261';
				ctx.fillRect(px + 4, py + 4 + bob, 2, 3);
				ctx.fillRect(px + 10, py + 4 + bob, 2, 3);
			}
		}
	}

	function drawHudOverlay() {
		if (!ctx || !canvas || mode === 'title') return;
		// bottom message
		if (message && messageTimer > 0) {
			ctx.fillStyle = 'rgba(18,0,31,0.82)';
			roundRect(ctx, 16, canvas.height - 52, canvas.width - 32, 36, 8);
			ctx.fill();
			ctx.fillStyle = '#f8f0ff';
			ctx.font = '600 14px Roboto, system-ui, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(message, canvas.width / 2, canvas.height - 28);
		}
	}

	function drawTitle() {
		if (!ctx || !canvas) return;
		ctx.fillStyle = 'rgba(10,0,20,0.72)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const pulse = 0.85 + 0.15 * Math.sin(anim * 3);
		ctx.textAlign = 'center';
		ctx.fillStyle = `rgba(199,125,255,${pulse})`;
		ctx.font = '700 36px Roboto, system-ui, sans-serif';
		ctx.fillText('NEON GROVE', canvas.width / 2, canvas.height * 0.32);

		ctx.fillStyle = '#f15bb5';
		ctx.font = '600 16px Roboto, system-ui, sans-serif';
		ctx.fillText('A tiny pixel RPG', canvas.width / 2, canvas.height * 0.32 + 28);

		ctx.fillStyle = 'rgba(255,255,255,0.88)';
		ctx.font = '14px Roboto, system-ui, sans-serif';
		ctx.fillText('Restore 3 Source Shards and open the portal', canvas.width / 2, canvas.height * 0.48);
		ctx.fillText('Move: WASD / Arrows · Action: Space / E', canvas.width / 2, canvas.height * 0.48 + 22);

		const blink = Math.sin(anim * 4) > 0;
		if (blink) {
			ctx.fillStyle = '#00bbf9';
			ctx.font = '600 15px Roboto, system-ui, sans-serif';
			ctx.fillText('Press Space or tap Action to start', canvas.width / 2, canvas.height * 0.68);
		}

		// decorative mini player
		ctx.save();
		ctx.translate(canvas.width / 2 - 24, canvas.height * 0.78);
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
		ctx.fillStyle = 'rgba(18,0,31,0.92)';
		roundRect(ctx, 18, boxY, canvas.width - 36, 100, 12);
		ctx.fill();
		ctx.strokeStyle = 'rgba(199,125,255,0.55)';
		ctx.lineWidth = 2;
		roundRect(ctx, 18, boxY, canvas.width - 36, 100, 12);
		ctx.stroke();

		ctx.textAlign = 'left';
		ctx.fillStyle = '#c77dff';
		ctx.font = '700 15px Roboto, system-ui, sans-serif';
		ctx.fillText(dialogue.speaker, 36, boxY + 28);

		ctx.fillStyle = '#f8f0ff';
		ctx.font = '14px Roboto, system-ui, sans-serif';
		wrapText(ctx, dialogue.lines[dialogue.index], 36, boxY + 52, canvas.width - 72, 18);

		ctx.fillStyle = 'rgba(255,255,255,0.55)';
		ctx.font = '12px Roboto, system-ui, sans-serif';
		ctx.textAlign = 'right';
		ctx.fillText('Space / Action · continue', canvas.width - 36, boxY + 88);
	}

	function drawBattle() {
		if (!ctx || !canvas || !battle) return;
		ctx.fillStyle = 'rgba(12,0,22,0.78)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const shake = battle.anim > 0 ? Math.sin(battle.anim * 40) * 4 : 0;

		// enemy showcase
		ctx.save();
		ctx.translate(canvas.width / 2 + shake, canvas.height * 0.28);
		ctx.scale(6, 6);
		const enemy = battle.enemy;
		ctx.fillStyle =
			enemy.name === 'Bug Jelly' ? '#80ed99' : enemy.name === 'Pixel Blob' ? '#4cc9f0' : '#f72585';
		ctx.fillRect(-5, -2, 10, 8);
		ctx.fillRect(-4, -3, 8, 2);
		ctx.fillStyle = '#fff';
		ctx.fillRect(-3, 0, 2, 2);
		ctx.fillRect(1, 0, 2, 2);
		ctx.fillStyle = '#111';
		ctx.fillRect(-2, 1, 1, 1);
		ctx.fillRect(2, 1, 1, 1);
		ctx.restore();

		ctx.textAlign = 'center';
		ctx.fillStyle = '#fff';
		ctx.font = '700 18px Roboto, system-ui, sans-serif';
		ctx.fillText(enemy.name ?? 'Slime', canvas.width / 2, canvas.height * 0.42);

		// HP bars
		drawBar(canvas.width / 2 - 80, canvas.height * 0.46, 160, 12, (enemy.hp ?? 0) / (enemy.maxHp ?? 1), '#f72585');
		ctx.fillStyle = 'rgba(255,255,255,0.75)';
		ctx.font = '12px Roboto, system-ui, sans-serif';
		ctx.fillText(`HP ${enemy.hp}/${enemy.maxHp}`, canvas.width / 2, canvas.height * 0.46 + 28);

		drawBar(40, canvas.height - 150, 160, 12, player.hp / player.maxHp, '#00bbf9');
		ctx.textAlign = 'left';
		ctx.fillText(`You  HP ${player.hp}/${player.maxHp}  ·  Potions ${player.potions}`, 40, canvas.height - 120);

		// log
		ctx.fillStyle = 'rgba(255,255,255,0.8)';
		ctx.font = '13px Roboto, system-ui, sans-serif';
		battle.log.forEach((line, i) => {
			ctx.fillText(line, 40, canvas.height - 95 + i * 16);
		});

		ctx.textAlign = 'center';
		ctx.fillStyle = battle.playerTurn ? '#c77dff' : 'rgba(255,255,255,0.45)';
		ctx.font = '600 13px Roboto, system-ui, sans-serif';
		ctx.fillText(
			battle.playerTurn ? '1 Attack · 2 Potion · 3 Flee  (or use buttons)' : '…enemy turn…',
			canvas.width / 2,
			canvas.height - 28
		);
	}

	function drawEnd(won) {
		if (!ctx || !canvas) return;
		ctx.fillStyle = 'rgba(10,0,20,0.8)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = 'center';
		ctx.fillStyle = won ? '#c77dff' : '#f15bb5';
		ctx.font = '700 32px Roboto, system-ui, sans-serif';
		ctx.fillText(won ? 'Grove Restored!' : 'You fainted…', canvas.width / 2, canvas.height * 0.38);
		ctx.fillStyle = '#f8f0ff';
		ctx.font = '15px Roboto, system-ui, sans-serif';
		if (won) {
			ctx.fillText('The portal sings in purple light. Bytewood is stable again.', canvas.width / 2, canvas.height * 0.48);
			ctx.fillText(`Shards ${player.shards} · Steps ${player.steps} · HP ${player.hp}`, canvas.width / 2, canvas.height * 0.48 + 26);
		} else {
			ctx.fillText('Even heroes need a potion break. Try again!', canvas.width / 2, canvas.height * 0.48);
		}
		const blink = Math.sin(anim * 4) > 0;
		if (blink) {
			ctx.fillStyle = '#00bbf9';
			ctx.font = '600 14px Roboto, system-ui, sans-serif';
			ctx.fillText('Press Space / Action for title', canvas.width / 2, canvas.height * 0.62);
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
		if (flash > 0) flash -= dt;
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
		return {
			mode,
			hp: player.hp,
			maxHp: player.maxHp,
			potions: player.potions,
			shards: player.shards,
			shardsNeeded: quest.shardsNeeded,
			steps: player.steps,
			message,
			battleTurn: battle?.playerTurn ?? false,
			inBattle: mode === 'battle',
			talkedToOwl: quest.talkedToOwl
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
		start: () => {
			if (mode === 'title') resetWorld();
		},
		width: MAP_W * TILE * SCALE,
		height: MAP_H * TILE * SCALE
	};
}
