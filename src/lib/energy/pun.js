/**
 * Client-side PUN / day-ahead price helpers for the /utility/energy page.
 *
 * Context: the site is fully static (`adapter-static`, prerendered, no server),
 * so everything here runs in the browser. The official GME endpoints
 * (mercatoelettrico.org, api.mercatoelettrico.org) expose no CORS headers and
 * the official API needs credentials, so live prices come from the no-key
 * Fraunhofer ISE Energy-Charts API (bidding zone IT-North, CC BY 4.0) reached
 * through public CORS proxies, with a localStorage cache and a bundled
 * sample shape as further fallbacks.
 *
 * True PUN (the national purchase-weighted average) is NOT available on any
 * no-key API — the page labels the series honestly as "Zona Nord (proxy PUN)".
 */

export const ENERGY_ZONE = 'IT-North';
export const CACHE_KEY = 'pun-cache-v1';
/** Keep cached days for 6h — respects the ~2 req/min Energy-Charts limit. */
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const V2_BASE = 'https://api.energy-charts.info/v2/price';
const V1_BASE = 'https://api.energy-charts.info/price';
/**
 * Public CORS proxies (no key, dev-grade reliability — hence two of them).
 * Direct browser calls to api.energy-charts.info are answered with
 * `Access-Control-Allow-Origin: https://www.api.energy-charts.info`
 * (verified Sep 2026), so the proxy goes first and direct is the fallback
 * in case upstream ever opens CORS.
 */
const PROXIES = ['https://api.allorigins.win/raw?url=', 'https://api.codetabs.com/v1/proxy?quest='];

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

/** @param {{ date: string, hourly: (number | null)[] }[]} days */
export function saveCache(days) {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), days }));
	} catch {
		// Private mode / quota — caching is best-effort only.
	}
}

async function fetchJson(/** @type {string} */ url, /** @type {number} */ timeoutMs = 12000) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: ctrl.signal });
		if (res.status === 429) {
			const retryAfter = res.headers.get('retry-after');
			throw new Error(`Limite di richieste (429)${retryAfter ? ` — riprova tra ${retryAfter}s` : ''}.`);
		}
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}

/** Per-attempt network budget — keeps a manual refresh bounded. */
const ATTEMPT_TIMEOUT_MS = 8000;

/**
 * Race one round of candidate URLs; the first non-empty success wins.
 * `Promise.any` settles as soon as one attempt fulfils and only rejects
 * (AggregateError) when every attempt failed — so a refresh can never
 * hang longer than a single attempt timeout per round.
 * @param {string[]} urls
 * @param {(json: any) => ReturnType<typeof toDaySummaries>} parse
 * @returns {Promise<{ days: ReturnType<typeof toDaySummaries>, url: string }>}
 */
async function raceRound(urls, parse) {
	const attempts = urls.map(async (url) => {
		const days = parse(await fetchJson(url, ATTEMPT_TIMEOUT_MS));
		if (days.length === 0) throw new Error('Risposta vuota.');
		return { days, url };
	});
	return await Promise.any(attempts);
}

/**
 * Fetch a multi-day window in two bounded rounds (worst case ~16s, typical
 * 1–3s): v2 through both proxies first (best shape, fastest mirror wins),
 * then v1 through both proxies plus direct v2/v1 (direct is CORS-blocked
 * upstream today, kept in case that ever opens). Falls back to the 6h
 * localStorage cache and finally to the bundled sample — the page always
 * paints something.
 * @returns {Promise<{ days: ReturnType<typeof toDaySummaries>, source: 'live' | 'proxy' | 'cache' | 'sample', fetchedAt: number, note?: string }>}
 */
export async function fetchPunWindow() {
	const today = romeDateKey();
	const start = shiftDateKey(today, -1);
	const end = shiftDateKey(today, 1);
	const range = `bzn=${ENERGY_ZONE}&start=${start}&end=${end}`;
	const v2 = `${V2_BASE}?${range}`;
	const v1 = `${V1_BASE}?${range}`;
	const via = (/** @type {string} */ target) => PROXIES.map((p) => `${p}${encodeURIComponent(target)}`);

	const parse = (/** @type {any} */ json) =>
		toDaySummaries(Array.isArray(json?.data) ? aggregate15toHourly(json.data) : parseV1(json));

	for (const urls of [[...via(v2)], [...via(v1), v2, v1]]) {
		try {
			const { days, url } = await raceRound(urls, parse);
			saveCache(days);
			return {
				days,
				source: PROXIES.some((p) => url.startsWith(p)) ? 'proxy' : 'live',
				fetchedAt: Date.now()
			};
		} catch {
			// Whole round failed — try the next round.
		}
	}

	// Stale cache, then bundled sample — always paint something, in Italian.
	const cached = loadCached();
	if (cached) return { days: cached.days, source: 'cache', fetchedAt: cached.ts };
	return {
		days: getSampleDays(),
		source: 'sample',
		fetchedAt: Date.now(),
		note: 'Rete non disponibile.'
	};
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
