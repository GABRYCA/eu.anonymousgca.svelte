/**
 * Client-side PUN / day-ahead price helpers for the /utility/energy page.
 *
 * Context: the site is fully static (`adapter-static`, prerendered, no server),
 * so everything here runs in the browser. The official GME endpoints
 * (mercatoelettrico.org, api.mercatoelettrico.org) expose no CORS headers and
 * the official API needs credentials, so prices come from the no-key
 * Fraunhofer ISE Energy-Charts API (bidding zone IT-North, CC BY 4.0).
 *
 * Architecture (Sep 2026): history is BAKED at build time by
 * scripts/fetch-energy-history.mjs into static/data/energy-history.json
 * (same-origin, silent, zero console spam — past day-ahead prices are
 * immutable). Only the last ~3 days are revalidated live through a short
 * list of verified CORS mirrors (single race, losers aborted, 10s budget),
 * then merged over the bake. localStorage caches and a bundled sample shape
 * remain as deeper fallbacks, in that order.
 *
 * True PUN (the national purchase-weighted average) is NOT available on any
 * no-key API — the page labels the series honestly as "Zona Nord (proxy PUN)".
 */

export const ENERGY_ZONE = 'IT-North';
export const CACHE_KEY = 'pun-cache-v1';
/** Keep cached days for 6h — respects the ~2 req/min Energy-Charts limit. */
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
/**
 * Stale-cache grace: an expired cache is still far better than demo data.
 * Day-ahead prices for past days are immutable, so a cache up to 30 days old
 * stays a truthful fallback when the network fails.
 */
export const STALE_GRACE_MS = 30 * 24 * 60 * 60 * 1000;
/** Per-range trend caches (daily summaries, immutable history → long grace). */
export const trendCacheKey = (/** @type {string} */ span) => `pun-trend-v1-${span}`;
export const TREND_SPANS = ['7d', '30d', '365d'];
/** Range presets exposed to the /energy page (days back from today). */
export const RANGE_DAYS = { '7g': 7, '30g': 30, '12m': 365 };
/** The tiny v1 live payload (3 days ≈ 6 KB); 15s still bounds the spinner. */
const LIVE_TIMEOUT_MS = 15000;
const V1_BASE = 'https://api.energy-charts.info/price';
/**
 * CORS mirrors for the tiny live revalidation (last ~3 days only — history
 * ships baked with the site, see scripts/fetch-energy-history.mjs).
 *
 * Verified Sep 2026 from a real browser network: corsproxy.io answers 401
 * (API key required), isomorphic-git 403, api.cors.lol and the Cloudflare
 * demo worker are chronically 429, codetabs flaps 503. Only allorigins is
 * consistently usable, with codetabs as backup — so the list stays short on
 * purpose: every extra mirror is one more failed request spamming the
 * visitor's console and one more hammer on shared rate budgets.
 */
const MIRRORS = [
	{
		id: 'allorigins-raw',
		url: (/** @type {string} */ t) => `https://api.allorigins.win/raw?url=${encodeURIComponent(t)}`,
		unwrap: async (/** @type {Response} */ res) => await res.json()
	},
	{
		id: 'allorigins-get',
		url: (/** @type {string} */ t) => `https://api.allorigins.win/get?url=${encodeURIComponent(t)}`,
		unwrap: async (/** @type {Response} */ res) => JSON.parse((await res.json()).contents)
	},
	{
		id: 'codetabs',
		url: (/** @type {string} */ t) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(t)}`,
		unwrap: async (/** @type {Response} */ res) => await res.json()
	}
];

/** Plausible 24h shapes (€/MWh) used for prerender + offline fallback. */
const SAMPLE_TODAY = [
	112.4, 104.8, 98.2, 94.6, 96.1, 108.3, 132.7, 158.9, 176.4, 168.2, 154.6, 142.1, 136.8, 134.2, 138.9, 146.5, 158.3,
	189.7, 224.6, 248.3, 231.9, 198.4, 162.7, 131.2
];
const SAMPLE_YESTERDAY = [
	121.6, 110.2, 101.5, 96.8, 99.4, 115.7, 141.2, 166.3, 182.1, 174.8, 159.3, 147.6, 141.9, 139.5, 143.8, 151.2, 164.9,
	198.2, 236.1, 261.4, 242.7, 207.5, 171.3, 139.8
];

/**
 * Current date key (YYYY-MM-DD) in Europe/Rome, without relying on server TZ.
 * @param {Date} [now]
 */
export function romeDateKey(now = new Date()) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Rome',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(now);
	const get = (/** @type {string} */ t) => parts.find((p) => p.type === t)?.value ?? '';
	return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Shift a YYYY-MM-DD key by n days (UTC noon avoids DST edge cases).
 * @param {string} iso
 * @param {number} n
 */
export function shiftDateKey(iso, n) {
	const d = new Date(`${iso}T12:00:00Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}

/** Current hour (0–23) in Europe/Rome. */
export function romeHour() {
	return Number(
		new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', hourCycle: 'h23' }).format(new Date())
	);
}

/**
 * Aggregate 15-min v2 points into 24 hourly means (classic PUN chart shape).
 * Groups by the wall-clock hour already present in the Rome-offset timestamp,
 * so DST transitions cannot misplace a quarter-hour.
 * @param {{ timestamp: string, values: { day_ahead_price: number | null } }[]} points
 * @returns {Map<string, (number | null)[]>} day key -> 24 hourly means
 */
export function aggregate15toHourly(points) {
	/** @type {Map<string, { sum: number[]; count: number[] }>} */
	const acc = new Map();
	for (const p of points) {
		const price = p?.values?.day_ahead_price;
		if (typeof price !== 'number' || !Number.isFinite(price)) continue;
		const day = p.timestamp.slice(0, 10);
		const hour = Number(p.timestamp.slice(11, 13));
		if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !(hour >= 0 && hour <= 23)) continue;
		let entry = acc.get(day);
		if (!entry) {
			entry = { sum: new Array(24).fill(0), count: new Array(24).fill(0) };
			acc.set(day, entry);
		}
		entry.sum[hour] += price;
		entry.count[hour] += 1;
	}
	/** @type {Map<string, (number | null)[]>} */
	const out = new Map();
	for (const [day, entry] of acc) {
		out.set(
			day,
			entry.sum.map((s, h) => (entry.count[h] > 0 ? Math.round((s / entry.count[h]) * 100) / 100 : null))
		);
	}
	return out;
}

/**
 * Parse a v1 (hourly unix_seconds + price) payload into day -> hourly.
 * @param {{ unix_seconds?: number[], price?: (number | null)[] }} json
 */
export function parseV1(json) {
	/** @type {Map<string, (number | null)[]>} */
	const out = new Map();
	const secs = Array.isArray(json?.unix_seconds) ? json.unix_seconds : [];
	const prices = Array.isArray(json?.price) ? json.price : [];
	const fmt = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Rome',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hourCycle: 'h23'
	});
	secs.forEach((s, i) => {
		const price = prices[i];
		if (typeof s !== 'number' || typeof price !== 'number' || !Number.isFinite(price)) return;
		const parts = fmt.formatToParts(new Date(s * 1000));
		const get = (/** @type {string} */ t) => parts.find((p) => p.type === t)?.value ?? '';
		const day = `${get('year')}-${get('month')}-${get('day')}`;
		const hour = Number(get('hour'));
		if (!out.has(day)) out.set(day, new Array(24).fill(null));
		out.get(day)[hour] = Math.round(price * 100) / 100;
	});
	return out;
}

/**
 * @param {Map<string, (number | null)[]>} byDay
 * @returns {{ date: string, hourly: (number | null)[], avg: number | null, min: number | null, max: number | null, minHour: number, maxHour: number }[]}
 */
export function toDaySummaries(byDay) {
	return [...byDay.entries()]
		.sort(([a], [b]) => (a < b ? -1 : 1))
		.map(([date, hourly]) => {
			const valid = hourly.map((v, h) => ({ v, h })).filter((d) => typeof d.v === 'number');
			const values = valid.map((d) => /** @type {number} */ (d.v));
			const avg =
				values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : null;
			const min = values.length > 0 ? Math.min(...values) : null;
			const max = values.length > 0 ? Math.max(...values) : null;
			return {
				date,
				hourly,
				avg,
				min,
				max,
				minHour: valid.find((d) => d.v === min)?.h ?? 0,
				maxHour: valid.find((d) => d.v === max)?.h ?? 0
			};
		});
}

/**
 * Cheapest sliding window of `size` consecutive hours (e.g. best 3h slot
 * to run energy-hungry appliances).
 * @param {(number | null)[]} hourly
 * @param {number} [size]
 */
export function cheapestWindow(hourly, size = 3) {
	let best = null;
	for (let h = 0; h + size <= 24; h++) {
		const slice = hourly.slice(h, h + size);
		if (slice.some((v) => typeof v !== 'number')) continue;
		const avg = slice.reduce((a, b) => a + /** @type {number} */ (b), 0) / size;
		if (!best || avg < best.avg) best = { startHour: h, avg: Math.round(avg * 100) / 100 };
	}
	return best;
}

/** Sample days anchored to the real Rome calendar (stale-looking dates are worse than demo data). */
export function getSampleDays() {
	const today = romeDateKey();
	const byDay = new Map([
		[shiftDateKey(today, -1), [...SAMPLE_YESTERDAY]],
		[today, [...SAMPLE_TODAY]]
	]);
	return toDaySummaries(byDay);
}

/** Read the localStorage cache; returns null when missing/stale/corrupt. */
export function loadCached() {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed.ts !== 'number' || !Array.isArray(parsed.days)) return null;
		if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Read the localStorage cache even when expired (up to STALE_GRACE_MS).
 * Past day-ahead prices are immutable, so a stale cache stays truthful and
 * beats demo data. Returns `{ days, ts, stale: true }` or null.
 */
export function loadStaleCache() {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed.ts !== 'number' || !Array.isArray(parsed.days)) return null;
		if (Date.now() - parsed.ts > STALE_GRACE_MS) return null;
		return { days: parsed.days, ts: parsed.ts, stale: true };
	} catch {
		return null;
	}
}

/** @param {{ date: string, hourly: (number | null)[] }[]} days */
export function saveCache(days) {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), days }));
	} catch {
		// Private mode / quota — caching is best-effort only.
	}
}

/** Read a per-range trend cache. `allowStale` extends grace to STALE_GRACE_MS. */
export function loadTrendCache(
	/** @type {string} */ span,
	/** @type {boolean} */ allowStale = false
) {
	try {
		const raw = localStorage.getItem(trendCacheKey(span));
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed.ts !== 'number' || !Array.isArray(parsed.days)) return null;
		const age = Date.now() - parsed.ts;
		if (age > CACHE_TTL_MS && !(allowStale && age <= STALE_GRACE_MS)) return null;
		return { days: parsed.days, ts: parsed.ts, stale: age > CACHE_TTL_MS };
	} catch {
		return null;
	}
}

/** @param {string} span @param {{ date: string, hourly: (number | null)[] }[]} days */
export function saveTrendCache(span, days) {
	try {
		localStorage.setItem(trendCacheKey(span), JSON.stringify({ ts: Date.now(), days }));
	} catch {
		// Private mode / quota — caching is best-effort only.
	}
}

/**
 * Baked history shipped with the site (see scripts/fetch-energy-history.mjs):
 * real day summaries in the `toDaySummaries()` shape, frozen at build time.
 * Same-origin static JSON → no CORS, no proxy, no console spam. Past days
 * are immutable, so only the tail can be stale (covered by the live overlay).
 * @param {string} bakedUrl absolute app path, e.g. `asset('data/energy-history.json')`
 * @returns {Promise<{ days: ReturnType<typeof toDaySummaries>, generatedAt: string } | null>}
 */
let bakedPromise = null;
let bakedUrlSeen = '';
export function loadBakedHistory(bakedUrl) {
	if (!bakedUrl || typeof fetch !== 'function') return Promise.resolve(null);
	if (bakedPromise && bakedUrlSeen === bakedUrl) return bakedPromise;
	bakedUrlSeen = bakedUrl;
	bakedPromise = (async () => {
		try {
			const res = await fetch(bakedUrl);
			if (!res.ok) return null;
			const json = await res.json();
			if (!json || !Array.isArray(json.days) || json.days.length === 0) return null;
			return { days: json.days, generatedAt: typeof json.generatedAt === 'string' ? json.generatedAt : '' };
		} catch {
			return null;
		}
	})();
	return bakedPromise;
}

/**
 * Merge day summaries by date; the overlay wins (live over baked).
 * @param {ReturnType<typeof toDaySummaries>} base
 * @param {ReturnType<typeof toDaySummaries>} overlay
 */
export function mergeDaySummaries(base, overlay) {
	const m = new Map(base.map((d) => [d.date, d]));
	for (const d of overlay) m.set(d.date, d);
	return [...m.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Race the mirrors for one small JSON payload; losers are aborted on the
 * first success so dead mirrors stop lingering. A single round, no retry
 * storm — the baked history is the safety net, not more requests.
 * @param {string} target upstream URL (unencoded; mirrors encode it)
 * @param {(json: any) => ReturnType<typeof toDaySummaries>} parse
 * @param {number} [timeoutMs]
 * @returns {Promise<{ days: ReturnType<typeof toDaySummaries>, mirror: string }>}
 */
async function fetchViaMirrors(target, parse, timeoutMs = LIVE_TIMEOUT_MS) {
	const master = new AbortController();
	const attempts = MIRRORS.map(async (m) => {
		const ctrl = new AbortController();
		const onAbort = () => ctrl.abort();
		master.signal.addEventListener('abort', onAbort, { once: true });
		const timer = setTimeout(() => ctrl.abort(), timeoutMs);
		try {
			const res = await fetch(m.url(target), { signal: ctrl.signal, cache: 'no-store' });
			if (!res.ok) throw new Error(`${m.id}: HTTP ${res.status}`);
			const days = parse(await m.unwrap(res));
			if (!Array.isArray(days) || days.length === 0) throw new Error(`${m.id}: risposta vuota.`);
			master.abort(); // losers stop here — no hanging requests, minimal console noise
			return { days, mirror: m.id };
		} finally {
			clearTimeout(timer);
			master.signal.removeEventListener('abort', onAbort);
		}
	});
	try {
		return await Promise.any(attempts);
	} catch {
		throw new Error('Rete non disponibile.');
	}
}

/**
 * One small live request shared by every view: yesterday→tomorrow via v1
 * (compact hourly, ~6 KB — the fastest thing a flaky proxy can carry).
 * A single mirror race, losers aborted, 10s budget, zero retry storm.
 * @returns {Promise<{ days: ReturnType<typeof toDaySummaries>, mirror: string }>}
 */
async function fetchLiveRecent() {
	const today = romeDateKey();
	const target = `${V1_BASE}?bzn=${ENERGY_ZONE}&start=${shiftDateKey(today, -1)}&end=${shiftDateKey(today, 1)}`;
	return await fetchViaMirrors(target, parseV1Payload, LIVE_TIMEOUT_MS);
}

/** Parse a v1 (hourly unix_seconds + price) payload into day summaries. */
function parseV1Payload(/** @type {any} */ json) {
	return toDaySummaries(parseV1(json));
}

/** Human "data aggiornati al" label for a baked generatedAt ISO string. */
function bakedLabel(/** @type {string} */ generatedAt) {
	try {
		if (!generatedAt) return '';
		return new Date(generatedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
	} catch {
		return '';
	}
}

/** In-flight deduplication: one network trip per range even under double clicks. */
const inflight = new Map();

/**
 * The 3-day window (yesterday→tomorrow, hourly): baked history first
 * (instant, same-origin, silent), then ONE gentle live overlay for the tail
 * (today is partial in the bake, tomorrow only exists live). Bounded ~10s,
 * typical 1–3s. Falls back to baked → fresh cache → stale cache → sample,
 * in that order — demo data is now a true last resort.
 * @param {string} [bakedUrl] absolute app path of the baked history JSON
 * @returns {Promise<{ days: ReturnType<typeof toDaySummaries>, source: 'live' | 'proxy' | 'cache' | 'sample', fetchedAt: number, note?: string }>}
 */
export async function fetchPunWindow(bakedUrl = '') {
	const key = 'window-3d';
	if (inflight.has(key)) return inflight.get(key);
	const job = (async () => {
		const today = romeDateKey();
		const start = shiftDateKey(today, -1);
		const end = shiftDateKey(today, 1);
		const inWindow = (/** @type {{ date: string }} */ d) => d.date >= start && d.date <= end;

		const [baked, live] = await Promise.all([
			loadBakedHistory(bakedUrl).catch(() => null),
			fetchLiveRecent()
				.then((r) => r.days)
				.catch(() => null)
		]);
		const bakedDays = baked ? baked.days.filter(inWindow) : [];
		const merged = mergeDaySummaries(bakedDays, live ?? []);
		if (merged.length > 0) {
			saveCache(merged);
			if (live) return { days: merged, source: 'proxy', fetchedAt: Date.now() };
			return {
				days: merged,
				source: 'cache',
				fetchedAt: Date.now(),
				note: `Dati aggiornati al ${bakedLabel(baked?.generatedAt ?? '')}: la rete non ha risposto.`
			};
		}

		// No baked file (first run before bake?) and no network: caches, then sample.
		const cached = loadCached();
		if (cached) return { days: cached.days, source: 'cache', fetchedAt: cached.ts };
		const stale = loadStaleCache();
		if (stale)
			return {
				days: stale.days,
				source: 'cache',
				fetchedAt: stale.ts,
				note: 'Dati di qualche giorno fa: la rete non ha risposto.'
			};
		return {
			days: getSampleDays(),
			source: 'sample',
			fetchedAt: Date.now(),
			note: 'Rete non disponibile.'
		};
	})();
	inflight.set(key, job);
	try {
		return await job;
	} finally {
		inflight.delete(key);
	}
}

/**
 * The last `spanDays` of daily summaries (today included) for the trend
 * views (7g / 30g / 12m): baked history slice first (instant, silent —
 * zero cross-origin requests), then the shared gentle live overlay for the
 * recent tail. No chunked proxy spam, ever. Results are cached per span;
 * on total failure a stale per-span cache wins over the short-window cache,
 * which wins over deterministic demo data — the trend never paints empty.
 * @param {number} spanDays
 * @param {string} [bakedUrl] absolute app path of the baked history JSON
 * @returns {Promise<{ days: ReturnType<typeof toDaySummaries>, source: 'live' | 'proxy' | 'cache' | 'sample', fetchedAt: number, note?: string }>}
 */
export async function fetchTrendDaily(spanDays, bakedUrl = '') {
	const span = spanDays >= 300 ? '365d' : spanDays >= 20 ? '30d' : '7d';
	const key = `trend-${span}`;
	if (inflight.has(key)) return inflight.get(key);
	const job = (async () => {
		const today = romeDateKey();
		const start = shiftDateKey(today, -(spanDays - 1));
		const end = today;
		const inSpan = (/** @type {{ date: string }} */ d) => d.date >= start && d.date <= end;

		// Fresh per-span cache: skip everything entirely.
		const fresh = loadTrendCache(span);
		if (fresh) return { days: fresh.days, source: 'cache', fetchedAt: fresh.ts };

		const [baked, live] = await Promise.all([
			loadBakedHistory(bakedUrl).catch(() => null),
			fetchLiveRecent()
				.then((r) => r.days)
				.catch(() => null)
		]);
		const bakedSlice = baked ? baked.days.filter(inSpan) : [];
		const days = mergeDaySummaries(bakedSlice, (live ?? []).filter(inSpan));
		if (days.length > 0) {
			saveTrendCache(span, days);
			if (live)
				return {
					days,
					source: 'proxy',
					fetchedAt: Date.now(),
					note: bakedSlice.length > 0 ? `Storico al ${bakedLabel(baked?.generatedAt ?? '')}, ultimi giorni live.` : ''
				};
			return {
				days,
				source: 'cache',
				fetchedAt: Date.now(),
				note: `Dati aggiornati al ${bakedLabel(baked?.generatedAt ?? '')}: la rete non ha risposto.`
			};
		}

		// Fallbacks, best first: stale per-span cache → stale short cache →
		// deterministic demo trend (clearly labelled).
		const stale = loadTrendCache(span, true);
		if (stale) return { days: stale.days, source: 'cache', fetchedAt: stale.ts, note: 'Dati di qualche giorno fa: la rete non ha risposto.' };
		const staleShort = loadStaleCache();
		if (staleShort) {
			const short = staleShort.days.filter(inSpan);
			if (short.length > 0)
				return { days: short, source: 'cache', fetchedAt: staleShort.ts, note: 'Solo gli ultimi giorni disponibili in cache.' };
		}
		return { days: getDemoTrend(spanDays), source: 'sample', fetchedAt: Date.now(), note: 'Rete non disponibile.' };
	})();
	inflight.set(key, job);
	try {
		return await job;
	} finally {
		inflight.delete(key);
	}
}

/**
 * Roll daily summaries up into monthly buckets (YYYY-MM key): mean of daily
 * means, plus the month's absolute min/max and covered day count.
 * @param {ReturnType<typeof toDaySummaries>} daily
 */
export function toMonthlySummaries(daily) {
	/** @type {Map<string, { sum: number; n: number; min: number | null; max: number | null; days: number }>} */
	const acc = new Map();
	for (const d of daily) {
		const key = d.date.slice(0, 7);
		let e = acc.get(key);
		if (!e) {
			e = { sum: 0, n: 0, min: null, max: null, days: 0 };
			acc.set(key, e);
		}
		if (typeof d.avg === 'number') {
			e.sum += d.avg;
			e.n += 1;
		}
		if (typeof d.min === 'number') e.min = e.min === null ? d.min : Math.min(e.min, d.min);
		if (typeof d.max === 'number') e.max = e.max === null ? d.max : Math.max(e.max, d.max);
		e.days += 1;
	}
	return [...acc.entries()]
		.sort(([a], [b]) => (a < b ? -1 : 1))
		.map(([month, e]) => ({
			month,
			avg: e.n > 0 ? Math.round((e.sum / e.n) * 100) / 100 : null,
			min: e.min,
			max: e.max,
			days: e.days
		}));
}

/** Deterministic demo daily trend anchored to the real calendar (offline fallback). */
export function getDemoTrend(/** @type {number} */ spanDays) {
	const today = romeDateKey();
	const baseA = SAMPLE_TODAY.reduce((a, b) => a + b, 0) / SAMPLE_TODAY.length;
	const baseB = SAMPLE_YESTERDAY.reduce((a, b) => a + b, 0) / SAMPLE_YESTERDAY.length;
	const byDay = new Map();
	for (let i = spanDays - 1; i >= 0; i--) {
		const date = shiftDateKey(today, -i);
		// Gentle deterministic wave so the demo trend looks alive (±12%).
		const wobble = 1 + 0.12 * Math.sin(i * 0.7) * Math.cos(i * 0.23);
		const avg = Math.round(((i % 2 === 0 ? baseA : baseB) * wobble) * 100) / 100;
		const hourly = SAMPLE_TODAY.map((v) => Math.round(v * (avg / baseA) * 100) / 100);
		byDay.set(date, hourly);
	}
	return toDaySummaries(byDay);
}

/**
 * Format a €/MWh value for the selected unit (Italian locale).
 * @param {number | null} valueMWh
 * @param {'eur-mwh' | 'ckwh'} unit
 */
export function formatPrice(valueMWh, unit) {
	if (valueMWh === null || valueMWh === undefined || !Number.isFinite(valueMWh)) return '—';
	try {
		if (unit === 'ckwh') {
			return `${(valueMWh / 10).toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} c€/kWh`;
		}
		return `${valueMWh.toLocaleString('it-IT', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} €/MWh`;
	} catch {
		return unit === 'ckwh' ? `${(valueMWh / 10).toFixed(2)} c€/kWh` : `${valueMWh.toFixed(1)} €/MWh`;
	}
}

/**
 * Cost of consuming `kwh` at a given €/MWh price (Italian locale).
 * @param {number} kwh
 * @param {number | null} priceMWh
 */
export function costForKwh(kwh, priceMWh) {
	if (!Number.isFinite(kwh) || kwh <= 0 || priceMWh === null || !Number.isFinite(priceMWh)) return '—';
	const eur = (kwh * priceMWh) / 1000;
	try {
		return eur.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
	} catch {
		return `€ ${eur.toFixed(2)}`;
	}
}

/**
 * Human day label relative to the Rome today (Ieri / Oggi / Domani / date).
 * @param {string} dateKey
 */
export function dayLabel(dateKey) {
	const today = romeDateKey();
	if (dateKey === today) return 'Oggi';
	if (dateKey === shiftDateKey(today, -1)) return 'Ieri';
	if (dateKey === shiftDateKey(today, 1)) return 'Domani';
	try {
		return new Date(`${dateKey}T12:00:00`).toLocaleDateString('it-IT', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
	} catch {
		return dateKey;
	}
}
