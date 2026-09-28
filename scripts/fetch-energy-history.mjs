/**
 * Local-only bake of Italian day-ahead electricity history.
 *
 * Why this exists: the site is fully static and browsers cannot call
 * api.energy-charts.info directly (fixed `Access-Control-Allow-Origin`, no
 * keyless CORS), while public CORS proxies are dev-grade flaky (measured Sep
 * 2026: corsproxy.io needs an API key, codetabs/isomorphic/workers
 * frequently 403/429/503). Past day-ahead prices are immutable, so we fetch
 * them here — server-side, direct, no proxy — and commit the result as a
 * same-origin static JSON. The /energy page paints that instantly with zero
 * cross-origin requests and only revalidates the last ~3 days live.
 *
 * Workflow (keeps deploys fast): this script runs ONLY locally via
 * `bun run data:energy` — never inside `bun run build`, so Cloudflare Pages
 * builds stay short. The output (static/data/energy-history.json) IS
 * committed to git. Runs are INCREMENTAL: only days missing after the
 * committed file are fetched (a daily refresh is one tiny request), the full
 * 400-day download happens only on the very first run.
 *
 * Resilience contract: this script MUST never fail `bun run build`.
 * - Every chunk gets retries with backoff; 429 honours Retry-After.
 * - On total failure the previous baked file is kept untouched.
 * - If no baked file exists at all, a valid-but-empty stub is written so the
 *   client can fall back to its demo data instead of crashing.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENERGY_ZONE, parseV1, romeDateKey, shiftDateKey, toDaySummaries } from '../src/lib/energy/pun.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'static', 'data', 'energy-history.json');

const HISTORY_DAYS = 400;
const CHUNK_DAYS = 31;
const CHUNK_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchDirect(url, timeoutMs) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: ctrl.signal });
		if (res.status === 429) {
			const wait = Number(res.headers.get('retry-after') ?? '5');
			throw Object.assign(new Error(`HTTP 429 upstream`), { retryAfter: Math.min(Number.isFinite(wait) ? wait : 5, 30) });
		}
		if (!res.ok) throw new Error(`HTTP ${res.status} upstream`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}

async function fetchChunk(start, end) {
	const url = `https://api.energy-charts.info/price?bzn=${ENERGY_ZONE}&start=${start}&end=${end}`;
	let lastErr = null;
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			if (attempt > 0) await sleep(1500 * attempt);
			return await fetchDirect(url, CHUNK_TIMEOUT_MS);
		} catch (err) {
			lastErr = err;
			const wait = /** @type {{ retryAfter?: number }} */ (/** @type {unknown} */ (err))?.retryAfter;
			if (typeof wait === 'number') await sleep(wait * 1000);
			console.warn(`[energy-history] chunk ${start}→${end} attempt ${attempt + 1} failed: ${err instanceof Error ? err.message : err}`);
		}
	}
	throw lastErr;
}

async function main() {
	const today = romeDateKey();
	const cutoff = shiftDateKey(today, -(HISTORY_DAYS - 1));
	// Incremental seed: the committed file already holds immutable history,
	// so only the tail after its newest day needs downloading. Fresh data
	// overwrites the seed (today is always partial and gets refreshed).
	/** @type {Map<string, (number | null)[]>} */
	const merged = new Map();
	try {
		const prev = JSON.parse(await readFile(OUT, 'utf8'));
		if (prev && Array.isArray(prev.days)) {
			for (const d of prev.days) {
				if (d && typeof d.date === 'string' && Array.isArray(d.hourly)) merged.set(d.date, d.hourly);
			}
		}
	} catch {
		// First run (or unreadable file): full download below.
	}
	const newest = [...merged.keys()].sort().at(-1);
	const fetchFrom = !newest ? cutoff : newest >= today ? today : shiftDateKey(newest, 1);
	if (fetchFrom <= today) {
		let cEnd = today;
		let paced = false;
		while (cEnd >= fetchFrom) {
			const rawStart = shiftDateKey(cEnd, -(CHUNK_DAYS - 1));
			const from = rawStart < fetchFrom ? fetchFrom : rawStart;
			if (paced) await sleep(1000);
			paced = true;
			const json = await fetchChunk(from, cEnd);
			for (const [day, hourly] of parseV1(json)) merged.set(day, hourly);
			console.log(`[energy-history] chunk ${from}→${cEnd}: ${merged.size} days so far`);
			if (from <= fetchFrom) break;
			cEnd = shiftDateKey(from, -1);
		}
	} else {
		console.log('[energy-history] already up to date.');
	}
	const days = toDaySummaries(merged).filter((d) => d.date >= cutoff && d.date <= today);
	if (days.length === 0) throw new Error('Upstream returned zero usable days.');
	const payload = {
		version: 1,
		generatedAt: new Date().toISOString(),
		zone: ENERGY_ZONE,
		unit: 'EUR / MWh',
		license: 'CC BY 4.0 energy-charts.info / Fraunhofer ISE (data: Bundesnetzagentur | SMARD.de)',
		days
	};
	await mkdir(dirname(OUT), { recursive: true });
	await writeFile(OUT, JSON.stringify(payload));
	console.log(`[energy-history] baked ${days.length} days (${days[0]?.date}→${days[days.length - 1]?.date}) to static/data/energy-history.json`);
}

try {
	await main();
} catch (err) {
	console.warn(`[energy-history] FAILED (${err instanceof Error ? err.message : err}) — keeping previous baked file.`);
	try {
		await readFile(OUT, 'utf8');
		console.warn('[energy-history] previous baked file intact; build continues.');
	} catch {
		console.warn('[energy-history] no baked file present; writing empty stub.');
		try {
			await mkdir(dirname(OUT), { recursive: true });
			await writeFile(
				OUT,
				JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), zone: ENERGY_ZONE, unit: 'EUR / MWh', license: '', days: [] })
			);
		} catch {
			// Even the stub failed (read-only FS?) — still exit 0, client falls back.
		}
	}
}
