/**
 * Neon Grove — level data, tiles and enemy tuning.
 * Pure data module (no DOM access) so it can be unit-tested with bun/node.
 */

export const TILE = 16;
export const MAP_W = 22;
export const MAP_H = 16;
export const SCALE = 3;

// Tile types
export const T = {
	GRASS: 0,
	PATH: 1,
	FLOWER: 2,
	WATER: 3,
	TREE: 4,
	ROCK: 5,
	BUSH: 6,
	PORTAL: 7,
	FLOOR: 8,
	LAVA: 9
};

export const SOLID = new Set([T.WATER, T.TREE, T.ROCK, T.BUSH]);
export const HURTFLOOR = new Set([T.LAVA]);

const GLYPH = {
	'.': T.GRASS,
	o: T.PATH,
	'*': T.FLOWER,
	'~': T.WATER,
	'#': T.TREE,
	R: T.ROCK,
	B: T.BUSH,
	O: T.PORTAL,
	H: T.FLOOR,
	L: T.LAVA
};

/**
 * Parse string rows into a numeric map.
 * @param {string[]} rows
 * @returns {number[][]}
 */
export function parseMap(rows) {
	return rows.map((row, y) =>
		[...row].map((ch, x) => {
			const t = GLYPH[ch];
			if (t === undefined) throw new Error(`Unknown map glyph "${ch}" at (${x},${y})`);
			return t;
		})
	);
}

/**
 * Validate a numeric map. Returns a list of human-readable problems (empty = ok).
 * @param {number[][]} map
 */
export function validateMap(map) {
	const problems = [];
	if (map.length !== MAP_H) problems.push(`expected ${MAP_H} rows, got ${map.length}`);
	map.forEach((row, y) => {
		if (row.length !== MAP_W) problems.push(`row ${y}: expected ${MAP_W} cols, got ${row.length}`);
	});
	let portals = 0;
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < (map[y] ?? []).length; x++) {
			if (map[y][x] === T.PORTAL) portals += 1;
		}
	}
	if (portals < 1) problems.push('map has no portal tile');
	return problems;
}

/** @param {number[][]} map */
export function isWalkableTile(map, x, y) {
	if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
	return !SOLID.has(map[y][x]);
}

/**
 * Breadth-first reachability from a spawn over walkable tiles.
 * @param {number[][]} map
 * @param {{x:number,y:number}} spawn
 * @returns {Set<string>}
 */
export function reachableFrom(map, spawn) {
	const seen = new Set();
	const key = (x, y) => `${x},${y}`;
	if (!isWalkableTile(map, spawn.x, spawn.y)) return seen;
	const queue = [[spawn.x, spawn.y]];
	seen.add(key(spawn.x, spawn.y));
	while (queue.length) {
		const [cx, cy] = /** @type {[number,number]} */ (queue.pop());
		for (const [dx, dy] of [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		]) {
			const nx = cx + dx;
			const ny = cy + dy;
			const k = key(nx, ny);
			if (seen.has(k) || !isWalkableTile(map, nx, ny)) continue;
			seen.add(k);
			queue.push([nx, ny]);
		}
	}
	return seen;
}

// ——— Enemy tuning ———
export const ENEMIES = {
	slime: { hp: 3, atkMin: 1, atkMax: 1, xp: 8, coins: 3, flee: 0.55, color: '#ffcc00' },
	wisp: { hp: 2, atkMin: 1, atkMax: 2, xp: 12, coins: 5, flee: 0.45, color: '#4cc9f0' },
	golem: { hp: 6, atkMin: 1, atkMax: 2, xp: 20, coins: 8, flee: 0.45, color: '#b08968' },
	boss: { hp: 10, atkMin: 1, atkMax: 2, xp: 50, coins: 20, flee: 0, color: '#e63946' }
};

export const SHOP = {
	potionPrice: 6,
	heartPrice: 15,
	potionHeal: 4
};

// ——— Level 1: Neon Grove (tutorial — the original grove, polished) ———
const MAP1 = [
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

// ——— Level 2: Murk Marsh (water maze, merchant, locked chest) ———
const MAP2_ROWS = [
	'######################',
	'#..*....#...HHH..*...#',
	'#.R...##..HHHOHHH.R..#',
	'#.*.ooooo...HHH...*..#',
	'#...o...o..HHH.B.....#',
	'#.##o.~~~..HH...ooo..#',
	'#...o.~~~~....o...o..#',
	'#.*.oooo...***..o..o.#',
	'#...o..#..ooooo....o.#',
	'#.B.o..#.o..R..R..o..#',
	'#...o....o...ooooooo.#',
	'#.*.o.#......*......*#',
	'#...o.....R....R.....#',
	'#...o..*....o....*...#',
	'#......#...ooo...#...#',
	'######################'
];

// ——— Level 3: Null Core (lava fortress, boss holds the last shard) ———
const MAP3_ROWS = [
	'######################',
	'#..*....#...HHH..*...#',
	'#.R...##..HHHOHHH.R..#',
	'#LLLooooo...HHH..LLL.#',
	'#.L..o...o..HHH.B..L.#',
	'#.L.HHHH..HHH...oooL.#',
	'#.L.H..H..HHH.H...oL.#',
	'#.*.oH..H.....H...o..#',
	'#...oH..HHHHHHH...o..#',
	'#.B.o...o..R..R..Oo..#',
	'#...o...o...ooooooo..#',
	'#.*.o.#.o....*......*#',
	'#...o...o.R....R.....#',
	'#...o...*....o...*...#',
	'#......#...ooo...#...#',
	'######################'
];

/**
 * @typedef {{x:number,y:number,kind:string,taken?:boolean,hp?:number,maxHp?:number,name?:string,lines?:string[],atkMin?:number,atkMax?:number,xp?:number,coins?:number,flee?:number,contains?:{potions?:number,coins?:number,heart?:boolean,key?:boolean},price?:number,locked?:boolean,enemyKind?:string,dropsShard?:boolean}} EntityDef
 * @typedef {{id:string,name:string,subtitle:string,hint:string,spawn:{x:number,y:number},shardsNeeded:number,map:number[][],entities:EntityDef[]}} LevelDef
 */

/** @type {LevelDef[]} */
export const LEVELS = [
	{
		id: 'grove',
		name: 'Lv.1 — Neon Grove',
		subtitle: 'Tutorial grove',
		hint: 'Talk to Owlbit, grab 3 shards, dodge the ponds.',
		spawn: { x: 11, y: 13 },
		shardsNeeded: 3,
		map: MAP1,
		entities: [
			{
				x: 11,
				y: 8,
				kind: 'npc',
				name: 'Owlbit',
				lines: [
					'Hoot! Welcome to Neon Grove, little coder.',
					'Three Source Shards fell when the night glitched.',
					'Find them, then step into the portal to go deeper!',
					'Slimes are soft… but they still bite. Grab coins, buy potions.'
				]
			},
			{ x: 3, y: 2, kind: 'shard' },
			{ x: 19, y: 4, kind: 'shard' },
			{ x: 5, y: 12, kind: 'shard' },
			{ x: 16, y: 11, kind: 'chest', contains: { potions: 1 } },
			{ x: 5, y: 3, kind: 'coin' },
			{ x: 14, y: 12, kind: 'coin' },
			{ x: 13, y: 6, kind: 'heart' },
			{ x: 9, y: 5, kind: 'slime', enemyKind: 'slime', name: 'Glitch Slime' },
			{ x: 15, y: 7, kind: 'slime', enemyKind: 'slime', name: 'Pixel Blob' },
			{ x: 4, y: 10, kind: 'slime', enemyKind: 'slime', name: 'Bug Jelly' },
			{
				x: 19,
				y: 13,
				kind: 'npc',
				name: 'Fox.exe',
				lines: [
					'Sniff… you smell like JavaScript.',
					'There is a shiny chest near the south trees.',
					'North past the ponds: the portal only opens for 3 shards.'
				]
			}
		]
	},
	{
		id: 'marsh',
		name: 'Lv.2 — Murk Marsh',
		subtitle: 'Merchant & locked loot',
		hint: 'Wisps hit harder. Marrow sells potions; a brass key opens the richer chest.',
		spawn: { x: 11, y: 13 },
		shardsNeeded: 4,
		map: parseMap(MAP2_ROWS),
		entities: [
			{
				x: 10,
				y: 13,
				kind: 'shop',
				name: 'Marrow',
				lines: ['Psst. Potions, hearts, no questions asked.', 'Slimes drop stardust — I accept only shiny currency.']
			},
			{
				x: 13,
				y: 3,
				kind: 'npc',
				name: 'Sage Root',
				lines: [
					'The marsh keeps what it catches, traveler.',
					'Four shards sleep here. One naps behind the old stones.',
					'Wisps sting twice — keep a potion warm.'
				]
			},
			{ x: 2, y: 1, kind: 'shard' },
			{ x: 19, y: 3, kind: 'shard' },
			{ x: 5, y: 9, kind: 'shard' },
			{ x: 17, y: 12, kind: 'shard' },
			{ x: 5, y: 11, kind: 'key' },
			{ x: 8, y: 11, kind: 'chest', contains: { potions: 1 } },
			{ x: 19, y: 11, kind: 'chest', locked: true, contains: { potions: 1, heart: true } },
			{ x: 14, y: 3, kind: 'heart' },
			{ x: 6, y: 3, kind: 'coin' },
			{ x: 15, y: 7, kind: 'coin' },
			{ x: 3, y: 13, kind: 'coin' },
			{ x: 16, y: 5, kind: 'coin' },
			{ x: 9, y: 7, kind: 'coin' },
			{ x: 4, y: 7, kind: 'slime', enemyKind: 'slime', name: 'Mud Slime' },
			{ x: 10, y: 8, kind: 'slime', enemyKind: 'slime', name: 'Bog Blob' },
			{ x: 13, y: 6, kind: 'wisp', enemyKind: 'wisp', name: 'Marsh Wisp' },
			{ x: 17, y: 9, kind: 'wisp', enemyKind: 'wisp', name: 'Fen Flicker' }
		]
	},
	{
		id: 'core',
		name: 'Lv.3 — Null Core',
		subtitle: 'Boss: the Null King',
		hint: 'Lava burns. The Null King carries the 5th shard — you must beat him.',
		spawn: { x: 11, y: 13 },
		shardsNeeded: 5,
		map: parseMap(MAP3_ROWS),
		entities: [
			{
				x: 10,
				y: 13,
				kind: 'shop',
				name: 'Marrow',
				lines: ['You made it. Last stop before the King.', 'Spend every coin. Lava does not take refunds.']
			},
			{
				x: 12,
				y: 11,
				kind: 'npc',
				name: 'Sage Root',
				lines: [
					'The Null King unmade this fortress line by line.',
					'Four shards lie in the ash. The fifth beats inside his chest.',
					'Golems shrug off bonks — bring potions, aim true.'
				]
			},
			{ x: 2, y: 1, kind: 'shard' },
			{ x: 19, y: 3, kind: 'shard' },
			{ x: 5, y: 9, kind: 'shard' },
			{ x: 17, y: 12, kind: 'shard' },
			{ x: 14, y: 1, kind: 'coin' },
			{ x: 6, y: 7, kind: 'coin' },
			{ x: 3, y: 13, kind: 'coin' },
			{ x: 8, y: 3, kind: 'coin' },
			{ x: 15, y: 10, kind: 'coin' },
			{ x: 4, y: 11, kind: 'key' },
			{ x: 8, y: 5, kind: 'chest', contains: { potions: 2 } },
			{ x: 19, y: 11, kind: 'chest', locked: true, contains: { potions: 1, heart: true } },
			{ x: 7, y: 1, kind: 'heart' },
			{ x: 4, y: 7, kind: 'golem', enemyKind: 'golem', name: 'Rust Golem' },
			{ x: 13, y: 6, kind: 'golem', enemyKind: 'golem', name: 'Cinder Golem' },
			{ x: 17, y: 7, kind: 'wisp', enemyKind: 'wisp', name: 'Ash Wisp' },
			{ x: 16, y: 9, kind: 'boss', enemyKind: 'boss', name: 'Null King', dropsShard: true }
		]
	}
];

/**
 * Validate every level: dimensions, walkable spawn, walkable entities,
 * portal + shards reachable from spawn. Returns problems (empty = ok).
 */
export function validateLevels() {
	const problems = [];
	LEVELS.forEach((lv, i) => {
		for (const p of validateMap(lv.map)) problems.push(`[${lv.id}] ${p}`);
		if (!isWalkableTile(lv.map, lv.spawn.x, lv.spawn.y))
			problems.push(`[${lv.id}] spawn (${lv.spawn.x},${lv.spawn.y}) is solid`);
		const reach = reachableFrom(lv.map, lv.spawn);
		const at = (x, y) => (lv.map[y] ? lv.map[y][x] : undefined);
		let portalFound = false;
		for (let y = 0; y < MAP_H; y++)
			for (let x = 0; x < MAP_W; x++) if (at(x, y) === T.PORTAL && reach.has(`${x},${y}`)) portalFound = true;
		if (!portalFound) problems.push(`[${lv.id}] portal unreachable from spawn`);
		const shards = lv.entities.filter((e) => e.kind === 'shard');
		const bossDrops = lv.entities.filter((e) => e.dropsShard).length;
		if (shards.length + bossDrops < lv.shardsNeeded)
			problems.push(
				`[${lv.id}] only ${shards.length} shard pickups + ${bossDrops} boss drops for ${lv.shardsNeeded} needed`
			);
		const adjacentReachable = (x, y) => {
			if (isWalkableTile(lv.map, x, y) && reach.has(`${x},${y}`)) return true;
			// bump-to-interact design: standing next to the entity is enough
			return [
				[x + 1, y],
				[x - 1, y],
				[x, y + 1],
				[x, y - 1]
			].some(([nx, ny]) => isWalkableTile(lv.map, nx, ny) && reach.has(`${nx},${ny}`));
		};
		for (const e of lv.entities) {
			if (['shard', 'chest', 'key', 'coin', 'heart'].includes(e.kind)) {
				if (!adjacentReachable(e.x, e.y))
					problems.push(`[${lv.id}] ${e.kind} at (${e.x},${e.y}) unreachable from spawn`);
			} else if (!isWalkableTile(lv.map, e.x, e.y) && !adjacentReachable(e.x, e.y)) {
				problems.push(`[${lv.id}] ${e.kind} "${e.name ?? ''}" at (${e.x},${e.y}) unreachable`);
			}
		}
		// enemy stat sanity
		for (const e of lv.entities) {
			if (
				['slime', 'wisp', 'golem', 'boss'].includes(e.kind) &&
				!ENEMIES[/** @type {keyof typeof ENEMIES} */ (e.enemyKind ?? e.kind)]
			)
				problems.push(`[${lv.id}] enemy at (${e.x},${e.y}) has unknown tuning`);
		}
		if (i > 0) void 0;
	});
	return problems;
}
