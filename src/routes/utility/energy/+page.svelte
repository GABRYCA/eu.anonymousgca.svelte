<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import { asset } from '$app/paths';
	import { scrollAnimation } from '#lib/actions/scrollAnimation.js';
	import {
		fetchPunWindow,
		fetchTrendDaily,
		loadCached,
		loadTrendCache,
		getSampleDays,
		cheapestWindow,
		toMonthlySummaries,
		formatPrice,
		costForKwh,
		dayLabel,
		romeDateKey,
		romeHour,
		RANGE_DAYS
	} from '#lib/energy/pun.js';

	// ── State ──────────────────────────────────────────────────────────
	/** @type {{ date: string, hourly: (number|null)[], avg: number|null, min: number|null, max: number|null, minHour: number, maxHour: number }[]} */
	let days = $state([]);
	/** @type {'loading'|'live'|'proxy'|'cache'|'sample'} */
	let source = $state('loading');
	let fetchedAt = $state(0);
	let note = $state('');
	let refreshing = $state(false);
	let selectedDate = $state(null);
	/** @type {'eur-mwh'|'ckwh'} */
	let unit = $state('eur-mwh');
	/** @type {number|null} */
	let hoverIndex = $state(null);
	/** @type {number|null} */
	let trendHover = $state(null);
	let kwh = $state(1);
	/** @type {'avg'|'min'|'max'|'now'} */
	let basis = $state('avg');
	let autoRefresh = $state(true);
	// ── Trend ranges (7g / 30g / 12m): daily summaries, monthly rollup ──
	/** @type {'3g'|'7g'|'30g'|'12m'} */
	let range = $state('3g');
	/** @type {{ date: string, hourly: (number|null)[], avg: number|null, min: number|null, max: number|null, minHour: number, maxHour: number }[]} */
	let trend = $state([]);
	/** @type {string|null} */
	let trendSpan = $state(null);
	/** @type {'loading'|'live'|'proxy'|'cache'|'sample'} */
	let trendSource = $state('loading');
	let trendFetchedAt = $state(0);
	let trendNote = $state('');
	let trendLoading = $state(false);

	const isTrend = $derived(range !== '3g');
	/** Needed cache span for the active range. */
	const needSpan = $derived(range === '12m' ? '365d' : range === '30g' ? '30d' : '7d');
	const needDays = $derived(RANGE_DAYS[range] ?? 0);
	const monthly = $derived(range === '12m' ? toMonthlySummaries(trend) : []);

	const nowKey = romeDateKey();
	const nowHour = romeHour();
	/** Same-origin baked history (scripts/fetch-energy-history.mjs): real data, zero CORS/proxy. */
	const bakedUrl = asset('data/energy-history.json');

	// ── Derived ────────────────────────────────────────────────────────
	const selected = $derived(days.find((d) => d.date === selectedDate) ?? days[days.length - 1] ?? null);
	const hourly = $derived(selected?.hourly ?? []);
	const validCount = $derived(hourly.filter((v) => typeof v === 'number').length);
	const isToday = $derived(selected?.date === nowKey);
	const cheap3h = $derived(selected ? cheapestWindow(selected.hourly, 3) : null);

	const basisPrice = $derived.by(() => {
		if (isTrend) {
			if (!periodStats) return null;
			if (basis === 'min') return periodStats.minVal;
			if (basis === 'max') return periodStats.maxVal;
			return periodStats.avg;
		}
		if (!selected) return null;
		if (basis === 'min') return selected.min;
		if (basis === 'max') return selected.max;
		if (basis === 'now') return isToday ? hourly[nowHour] ?? selected.avg : selected.avg;
		return selected.avg;
	});

	/** Chart geometry: fixed viewBox, values scaled per selected unit. */
	const chart = $derived.by(() => {
		const W = 720;
		const H = 260;
		const padL = 52;
		const padR = 14;
		const padT = 14;
		const padB = 30;
		const vals = hourly.map((v) => typeof v === 'number' ? unit === 'ckwh' ? v / 10 : v : null);
		const nums = vals.filter((v) => typeof v === 'number');
		if (nums.length === 0) return null;
		let lo = Math.min(...nums);
		let hi = Math.max(...nums);
		if (hi - lo < 1e-9) {
			lo -= 1;
			hi += 1;
		}
		const spanPad = (hi - lo) * 0.12;
		lo -= spanPad;
		hi += spanPad;
		const innerW = W - padL - padR;
		const innerH = H - padT - padB;
		const x = (/** @type {number} */ i) => padL + i / 23 * innerW;
		const y = (/** @type {number} */ v) => padT + (1 - (v - lo) / (hi - lo)) * innerH;
		const pts = vals.map((v, i) => ({ i, v, x: x(i), y: v === null ? null : y(v) }));
		const line = pts.filter((p) => p.y !== null).map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${/** @type {number} */ (p.y.toFixed(1))}`).join(' ');
		const first = pts.find((p) => p.y !== null);
		const last = [...pts].reverse().find((p) => p.y !== null);
		const area =
			line && first && last
				? `${line} L${last.x.toFixed(1)},${(padT + innerH).toFixed(1)} L${first.x.toFixed(1)},${(padT + innerH).toFixed(1)} Z`
				: '';
		const ticks = [0, 1, 2, 3].map((k) => {
			const v = lo + (hi - lo) * k / 3;
			return { v, y: y(v) };
		});
		return { W, H, padL, padR, padT, padB, innerW, innerH, pts, line, area, ticks, lo, hi };
	});

	const hovered = $derived(hoverIndex !== null && chart ? chart.pts[hoverIndex] ?? null : null);

	// ── Trend derived (period stats + variable-length chart) ─────────────
	const periodStats = $derived.by(() => {
		if (!isTrend || trend.length === 0) return null;
		if (range === '12m') {
			const valid = monthly.filter((m) => typeof m.avg === 'number');
			if (valid.length === 0) return null;

			const avgs = valid.map((m /** @type {number} */) => m.avg);
			const avg = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length * 100) / 100;
			const minM = valid.reduce((a, b /** @type {number} */) => a.avg <= /** @type {number} */ (b.avg) ? a : b);
			const maxM = valid.reduce((a, b /** @type {number} */) => a.avg >= /** @type {number} */ (b.avg) ? a : b);

			return {
				avg,
				minLabel: monthLabel(minM.month),
				minVal: minM.avg,
				maxLabel: monthLabel(maxM.month),
				maxVal: maxM.avg,
				count: valid.length,
				countLabel: `${valid.length} mesi`
			};
		}
		const valid = trend.filter((d) => typeof d.avg === 'number');
		if (valid.length === 0) return null;

		const avgs = valid.map((d /** @type {number} */) => d.avg);
		const avg = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length * 100) / 100;
		const minD = valid.reduce((a, b /** @type {number} */) => a.avg <= /** @type {number} */ (b.avg) ? a : b);
		const maxD = valid.reduce((a, b /** @type {number} */) => a.avg >= /** @type {number} */ (b.avg) ? a : b);

		return {
			avg,
			minLabel: dayLabel(minD.date),
			minVal: minD.avg,
			maxLabel: dayLabel(maxD.date),
			maxVal: maxD.avg,
			count: valid.length,
			countLabel: `${valid.length} giorni`
		};
	});

	/** Trend chart geometry: one point per day (7g/30g) or per month (12m). */
	const trendChart = $derived.by(() => {
		const W = 720;
		const H = 260;
		const padL = 52;
		const padR = 14;
		const padT = 14;
		const padB = 30;
		const raw = range === '12m' ? monthly.map((m) => m.avg) : trend.map((d) => d.avg);
		if (raw.length === 0) return null;
		const vals = raw.map((v) => typeof v === 'number' ? unit === 'ckwh' ? v / 10 : v : null);
		const nums = vals.filter((v) => typeof v === 'number');
		if (nums.length === 0) return null;
		let lo = Math.min(...nums);
		let hi = Math.max(...nums);
		if (hi - lo < 1e-9) {
			lo -= 1;
			hi += 1;
		}
		const spanPad = (hi - lo) * 0.12;
		lo -= spanPad;
		hi += spanPad;
		const innerW = W - padL - padR;
		const innerH = H - padT - padB;
		const n = vals.length;
		const x = (/** @type {number} */ i) => n === 1 ? padL + innerW / 2 : padL + i / (n - 1) * innerW;
		const y = (/** @type {number} */ v) => padT + (1 - (v - lo) / (hi - lo)) * innerH;
		const pts = vals.map((v, i) => ({ i, v, x: x(i), y: v === null ? null : y(v) }));
		const line = pts.filter((p) => p.y !== null).map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${/** @type {number} */ (p.y.toFixed(1))}`).join(' ');
		const first = pts.find((p) => p.y !== null);
		const last = [...pts].reverse().find((p) => p.y !== null);
		const area =
			line && first && last
				? `${line} L${last.x.toFixed(1)},${(padT + innerH).toFixed(1)} L${first.x.toFixed(1)},${(padT + innerH).toFixed(1)} Z`
				: '';
		const ticks = [0, 1, 2, 3].map((k) => {
			const v = lo + (hi - lo) * k / 3;
			return { v, y: y(v) };
		});
		const labels =
			range === '12m'
				? monthly.map((m) => monthLabel(m.month))
				: trend.map((d) => d.date.slice(5));
		return { W, H, padL, padR, padT, padB, innerW, innerH, pts, line, area, ticks, lo, hi, labels };
	});

	const trendHovered = $derived(trendHover !== null && trendChart ? trendChart.pts[trendHover] ?? null : null);

	const trendUpdatedLabel = $derived.by(() => {
		if (!trendFetchedAt) return '';
		try {
			return new Date(trendFetchedAt).toLocaleString('it-IT', {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return '';
		}
	});

	const sourceMeta = $derived(
		source === 'live'
			? { label: 'Live · zona Nord', cls: 'is-live' }
			: source === 'proxy'
				? { label: 'Live · zona Nord', cls: 'is-proxy' }
				: source === 'cache'
					? { label: 'Cache', cls: 'is-cache' }
					: source === 'sample'
						? { label: 'Dati dimostrativi', cls: 'is-sample' }
						: { label: 'Caricamento…', cls: 'is-loading' }
	);

	const trendSourceMeta = $derived(
		trendSource === 'live'
			? { label: 'Live · zona Nord', cls: 'is-live' }
			: trendSource === 'proxy'
				? { label: 'Live · zona Nord', cls: 'is-proxy' }
				: trendSource === 'cache'
					? { label: 'Cache', cls: 'is-cache' }
					: trendSource === 'sample'
						? { label: 'Dati dimostrativi', cls: 'is-sample' }
						: { label: 'Caricamento…', cls: 'is-loading' }
	);
	const heroSourceMeta = $derived(isTrend ? trendSourceMeta : sourceMeta);

	const updatedLabel = $derived.by(() => {
		if (!fetchedAt) return '';
		try {
			return new Date(fetchedAt).toLocaleString('it-IT', {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return '';
		}
	});

	// ── Data loading (browser only; page prerenders a skeleton) ─────────
	/** @param {boolean} [manual] */
	async function load(manual = false) {
		if (!browser || refreshing) return;
		refreshing = true;
		if (manual) {
			hoverIndex = null;
		}
		try {
			const res = await fetchPunWindow(bakedUrl);
			days = res.days;
			source = res.source;
			fetchedAt = res.fetchedAt;
			note = res.note ?? '';
			if (!selectedDate || !days.some((d) => d.date === selectedDate)) {
				selectedDate = days.some((d) => d.date === nowKey) ? nowKey : days[days.length - 1]?.date ?? null;
			}
		} catch (e) {
			days = getSampleDays();
			source = 'sample';
			fetchedAt = Date.now();
			note = e instanceof Error ? e.message : 'Errore di rete.';
			selectedDate ??= days[days.length - 1]?.date ?? null;
		} finally {
			refreshing = false;
		}
	}

	/** Load the daily trend for the active range (cache-first, then network). */
	async function loadTrend() {
		if (!browser || trendLoading || range === '3g') return;
		const span = needSpan;
		const spanDays = needDays;
		trendLoading = true;
		if (trendSpan !== span) trendHover = null;
		try {
			const res = await fetchTrendDaily(spanDays, bakedUrl);
			// The user may have switched range mid-flight — only paint if fresh.
			if (needSpan !== span) return;
			trend = res.days;
			trendSpan = span;
			trendSource = res.source;
			trendFetchedAt = res.fetchedAt;
			trendNote = res.note ?? '';
		} catch {
			// fetchTrendDaily is total-failure-safe by contract; this is a
			// last-resort guard so the UI can never stick in "loading".
			if (needSpan !== span) return;
			trendSource = 'sample';
			trendFetchedAt = Date.now();
			trendNote = 'Errore imprevisto.';
		} finally {
			trendLoading = false;
		}
	}

	/** @param {'3g'|'7g'|'30g'|'12m'} r */
	function selectRange(r) {
		if (r === range) return;
		// No persistence on purpose: every visit starts on the shortest
		// range (3g); longer spans are one tap away.
		range = r;
		if (r === '3g') {
			if (days.length === 0) load();
			return;
		}
		// Instant paint from the per-span cache when available, then revalidate.
		const span = needSpan;
		if (trendSpan !== span) {
			const cached = loadTrendCache(span);
			if (cached) {
				trend = cached.days;
				trendSpan = span;
				trendSource = 'cache';
				trendFetchedAt = cached.ts;
				trendNote = '';
			} else {
				trend = [];
				trendSpan = null;
				trendSource = 'loading';
				trendFetchedAt = 0;
				trendNote = '';
			}
		}
		loadTrend();
	}

	onMount(() => {
		try {
			unit = localStorage.getItem('pun-unit') === 'ckwh' ? 'ckwh' : 'eur-mwh';
		} catch {
			// ignore
		}
		// Instant paint from cache/sample, then revalidate live.
		const cached = loadCached();
		if (cached) {
			days = cached.days;
			source = 'cache';
			fetchedAt = cached.ts;
			selectedDate = days.some((d) => d.date === nowKey) ? nowKey : days[days.length - 1]?.date ?? null;
		} else {
			days = getSampleDays();
			source = 'sample';
			fetchedAt = Date.now();
			selectedDate = days[days.length - 1]?.date ?? null;
		}
		load();
		if (!browser) return;
		const timer = window.setInterval(
			() => {
				if (!autoRefresh || document.visibilityState !== 'visible') return;
				if (range === '3g') load();
				else loadTrend();
			},
			15 * 60 * 1000
		);
		return () => window.clearInterval(timer);
	});

	// Persist the unit preference (effects never run on the server).
	$effect(() => {
		try {
			localStorage.setItem('pun-unit', unit);
		} catch {
			// ignore
		}
	});

	// ── Chart interaction ──────────────────────────────────────────────
	/** @param {PointerEvent} event */
	function handlePointer(event) {
		if (!chart) return;
		const svg = /** @type {SVGElement} */ (event.currentTarget);
		const rect = svg.getBoundingClientRect();
		if (rect.width <= 0) return;
		const px = (event.clientX - rect.left) / rect.width * chart.W;
		const frac = (px - chart.padL) / chart.innerW;
		hoverIndex = Math.max(0, Math.min(23, Math.round(frac * 23)));
	}

	function clearHover() {
		hoverIndex = null;
	}

	/** @param {KeyboardEvent} event */
	function handleKeys(event) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const base = hoverIndex ?? (isToday ? nowHour : 12);
		hoverIndex = event.key === 'ArrowLeft' ? Math.max(0, base - 1) : Math.min(23, base + 1);
	}

	/** Short axis label for the selected unit. @param {number} v */
	function axisFmt(v) {
		try {
			return unit === 'ckwh'
				? v.toLocaleString('it-IT', { maximumFractionDigits: 1 })
				: Math.round(v).toLocaleString('it-IT');
		} catch {
			return unit === 'ckwh' ? v.toFixed(1) : String(Math.round(v));
		}
	}

	/** @param {number} h */
	function hourRange(h) {
		return `${String(h).padStart(2, '0')}:00–${String((h + 1) % 24).padStart(2, '0')}:00`;
	}

	/** @param {string} ym YYYY-MM → "gen 26" style Italian label. */
	function monthLabel(ym) {
		try {
			return new Date(`${ym}-15T12:00:00`).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
		} catch {
			return ym;
		}
	}

	/** @param {PointerEvent} event */
	function handleTrendPointer(event) {
		if (!trendChart) return;
		const svg = /** @type {SVGElement} */ (event.currentTarget);
		const rect = svg.getBoundingClientRect();
		if (rect.width <= 0) return;
		const px = (event.clientX - rect.left) / rect.width * trendChart.W;
		const n = trendChart.pts.length;
		if (n <= 1) {
			trendHover = 0;
			return;
		}
		const frac = (px - trendChart.padL) / trendChart.innerW;
		trendHover = Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
	}

	function clearTrendHover() {
		trendHover = null;
	}

	/** @param {KeyboardEvent} event */
	function handleTrendKeys(event) {
		if (!trendChart) return;
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const n = trendChart.pts.length;
		const base = trendHover ?? Math.floor(n / 2);
		trendHover = event.key === 'ArrowLeft' ? Math.max(0, base - 1) : Math.min(n - 1, base + 1);
	}

	/** Trend tooltip title for point i (date or month + coverage). */
	function trendTipTitle(/** @type {number} */ i) {
		if (range === '12m') {
			const m = monthly[i];
			if (!m) return '';
			return `${monthLabel(m.month)} · ${m.days} gg`;
		}
		const d = trend[i];
		if (!d) return '';
		return `${dayLabel(d.date)} ${d.date.slice(5)}`;
	}

	/** Trend tooltip value for point i (daily/monthly mean in the active unit). */
	function trendTipValue(/** @type {number} */ i) {
		const v = range === '12m' ? monthly[i]?.avg ?? null : trend[i]?.avg ?? null;
		return typeof v === 'number' ? formatPrice(v, unit) : '—';
	}
</script>

<div class="energy-page">
	<div class="container-xxl mt-4 mt-md-5">
		<section class="page-hero text-center mb-4 mb-md-5" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
			<h1 class="energy-title page-hero__title mb-3">Energia · Costo</h1>
			<p class="page-hero__lead mx-auto">
				Costo orario "day-ahead" della componente elettrica in Italia, tramite (MGP).
			</p>
			<div class="hero-badges">
				<span class="source-badge {heroSourceMeta.cls}" role="status">
					<span class="source-badge__dot" aria-hidden="true"></span>
					{heroSourceMeta.label}
				</span>
				{#if isTrend && periodStats}
					<span class="hero-price text-mono">{formatPrice(periodStats.avg, unit)}</span>

					<span class="hero-price-sub">
						media {range === '12m'
							? 'ultimi 12 mesi'
							: range === '30g' ? 'ultimi 30 giorni' : 'ultimi 7 giorni'}
					</span>
				{:else if selected}
					<span class="hero-price text-mono">{formatPrice(isToday ? hourly[nowHour] ?? selected.avg : selected.avg, unit)}</span>
					<span class="hero-price-sub">{isToday ? 'ora in corso ·' : ''} media {dayLabel(selected.date).toLowerCase()}</span>
				{/if}
			</div>
		</section>

		<!-- Chart card -->
		<section
			class="card energy-card mb-4"
			use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}
			aria-label="Grafico prezzi orari"
		>
			<div class="card-header energy-card__head">
				{#if range === '3g'}
					<div class="day-tabs" role="tablist" aria-label="Giorno">
						{#each days as d (d.date)}
							<button
								type="button"
								role="tab"
								aria-selected={d.date === selected?.date}
								class="day-tab"
								class:active={d.date === selected?.date}
								onclick={() => {
									selectedDate = d.date;
									hoverIndex = null;
								}}
							>
								{dayLabel(d.date)}
								<small class="text-mono">{d.date.slice(5)}</small>
							</button>
						{/each}
						{#if days.length === 0}
							<span class="day-tab" aria-hidden="true">…</span>
						{/if}
					</div>
				{:else}
					<div class="trend-summary" aria-live="polite">
						<strong>
							{range === '7g' ? 'Ultimi 7 giorni' : range === '30g' ? 'Ultimi 30 giorni' : 'Ultimi 12 mesi'}
						</strong>
						<small class="text-mono">
							{range === '12m' ? 'medie mensili' : 'medie giornaliere'} · zona Nord
						</small>
					</div>
				{/if}
				<div class="head-controls">
					<div class="range-toggle" role="group" aria-label="Intervallo di tempo">
						<button type="button" class:active={range === '3g'} aria-pressed={range === '3g'} onclick={() => selectRange('3g')}>3 gg</button>
						<button type="button" class:active={range === '7g'} aria-pressed={range === '7g'} onclick={() => selectRange('7g')}>7 gg</button>
						<button type="button" class:active={range === '30g'} aria-pressed={range === '30g'} onclick={() => selectRange('30g')}>30 gg</button>
						<button type="button" class:active={range === '12m'} aria-pressed={range === '12m'} onclick={() => selectRange('12m')}>12 mesi</button>
					</div>
					<div class="unit-toggle" role="group" aria-label="Unità di misura">
						<button
							type="button"
							class:active={unit === 'eur-mwh'}
							aria-pressed={unit === 'eur-mwh'}
							onclick={() => unit = 'eur-mwh'}
						>€/MWh</button>
						<button
							type="button"
							class:active={unit === 'ckwh'}
							aria-pressed={unit === 'ckwh'}
							onclick={() => unit = 'ckwh'}
						>c€/kWh</button>
					</div>
					{#if range === '3g'}
						<button type="button" class="btn-refresh" onclick={() => load(true)} disabled={refreshing} aria-live="polite">
							<i class="fas fa-rotate" aria-hidden="true"></i>
							{refreshing ? 'Aggiorno…' : 'Aggiorna'}
						</button>
					{:else}
						<button type="button" class="btn-refresh" onclick={() => loadTrend()} disabled={trendLoading} aria-live="polite">
							<i class="fas fa-rotate" aria-hidden="true"></i>
							{trendLoading ? 'Aggiorno…' : 'Aggiorna'}
						</button>
					{/if}
				</div>
			</div>

			<div class="card-body">
				{#if range === '3g'}
					{#if !selected || !chart}
						<div class="chart-skeleton" aria-label="Caricamento grafico">
							<div class="chart-skeleton__bar"></div>
							<p class="mb-0">Caricamento prezzi…</p>
						</div>
					{:else}
						<div
							class="chart-wrap"
							tabindex="0"
							role="slider"
							aria-label="Prezzi orari del {selected.date}. Usa le frecce sinistra e destra per esplorare le ore."
							aria-valuemin={0}
							aria-valuemax={23}
							aria-valuenow={hoverIndex ?? (isToday ? nowHour : 12)}
							aria-valuetext={hoverIndex !== null && typeof hourly[hoverIndex] === 'number'
								? `${hourRange(hoverIndex)}: ${formatPrice(/** @type {number} */ (hourly[hoverIndex]), unit)}`
								: 'Nessuna ora selezionata'}
							onpointermove={handlePointer}
							onpointerleave={clearHover}
							onkeydown={handleKeys}
						>
						<svg viewBox="0 0 {chart.W} {chart.H}" class="chart" aria-hidden="true" focusable="false">
								<defs>
									<linearGradient id="punArea" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stop-color="#4c8dff" stop-opacity="0.45"></stop>
									<stop offset="100%" stop-color="#4c8dff" stop-opacity="0.02"></stop>
									</linearGradient>
								</defs>

								{#each chart.ticks as t, k (k)}
								<line x1={chart.padL} x2={chart.W - chart.padR} y1={t.y} y2={t.y} class="grid"></line>
								<text x={chart.padL - 8} y={t.y + 4} text-anchor="end" class="tick">{axisFmt(t.v)}</text>
								{/each}
								{#each [0, 6, 12, 18, 23] as h (h)}
									<text
										x={(chart.padL + h / 23 * chart.innerW).toFixed(1)}
										y={chart.H - 10}
										text-anchor="middle"
										class="tick"
								>
									{String(h).padStart(2, '0')}
								</text>
								{/each}

								{#if chart.area}
									<path d={chart.area} fill="url(#punArea)"></path>
								{/if}

								{#if chart.line}
									<path d={chart.line} class="line" fill="none"></path>
								{/if}

								{#if cheap3h}
									<rect
										x={(chart.padL + cheap3h.startHour / 23 * chart.innerW).toFixed(1)}
										y={chart.padT}
										width={(3 / 23 * chart.innerW).toFixed(1)}
										height={chart.innerH}
										class="cheap-band"
									></rect>
								{/if}

								{#if isToday}
									<line
										x1={(chart.padL + nowHour / 23 * chart.innerW).toFixed(1)}
										x2={(chart.padL + nowHour / 23 * chart.innerW).toFixed(1)}
										y1={chart.padT}
										y2={chart.padT + chart.innerH}
										class="now-line"
									></line>
								{/if}

								{#each chart.pts as p (p.i)}
									{#if p.v !== null}
										<circle
											cx={p.x}
											cy={p.y}
										r={p.i === hoverIndex ? 5 : p.i === selected.maxHour ? 4 : p.i === selected.minHour ? 4 : 0.1}
											class="dot"
											class:dot--max={p.i === selected.maxHour}
											class:dot--min={p.i === selected.minHour}
											class:dot--hover={p.i === hoverIndex}
										></circle>
									{/if}
								{/each}

								{#if hovered && hovered.y !== null}
								<line x1={hovered.x} x2={hovered.x} y1={chart.padT} y2={chart.padT + chart.innerH} class="hover-line"
									></line>
								{/if}
							</svg>

							{#if hovered && hovered.v !== null && typeof hourly[hovered.i] === 'number'}
								<div
									class="chart-tip"
									style:left="{hovered.x / chart.W * 100}%"
									style:top="{/** @type {number} */ (hovered.y / chart.H * 100)}%"
									role="status"
								>
									<strong>{hourRange(hovered.i)}</strong>
									<span class="text-mono">{formatPrice(/** @type {number} */ (hourly[hovered.i]), unit)}</span>
								</div>
							{/if}
						</div>

						<div class="chart-meta" aria-live="polite">
							<span>
								{#if source === 'sample'}
									Dati dimostrativi: la rete non ha risposto{#if note}
									({note}){/if}. Riprova con “Aggiorna”.
								{:else if source === 'cache'}
									Ultimo aggiornamento {updatedLabel}{#if note}
										· {note}
									{:else}
										· in attesa della rete.
									{/if}
								{:else}
									Aggiornato {updatedLabel} · zona Nord, prezzi day-ahead.
								{/if}
							</span>
							<label class="auto-refresh">
								<input type="checkbox" bind:checked={autoRefresh} />
								Dati Live (15 min)
							</label>
						</div>
					{/if}
				{:else}
					{#if trendLoading && trend.length === 0}
						<div class="chart-skeleton" aria-label="Caricamento storico">
							<div class="chart-skeleton__bar"></div>
							<p class="mb-0">
								{range === '12m' ? 'Caricamento ultimi 12 mesi… (può richiedere qualche secondo)' : 'Caricamento storico…'}
							</p>
						</div>
					{:else if !trendChart}
						<div class="chart-skeleton" aria-label="Storico non disponibile">
							<p class="mb-0">Storico non disponibile: premi “Aggiorna” per riprovare.</p>
						</div>
					{:else}
						<div
							class="chart-wrap"
							tabindex="0"
							role="slider"
							aria-label={range === '12m'
								? 'Medie mensili degli ultimi 12 mesi. Usa le frecce per esplorare i mesi.'
								: `Medie giornaliere degli ultimi ${trend.length} giorni. Usa le frecce per esplorare i giorni.`}
							aria-valuemin={0}
							aria-valuemax={trendChart.pts.length - 1}
							aria-valuenow={trendHover ?? Math.floor(trendChart.pts.length / 2)}
							aria-valuetext={trendHover !== null ? `${trendTipTitle(trendHover)}: ${trendTipValue(trendHover)}` : 'Nessun punto selezionato'}
							onpointermove={handleTrendPointer}
							onpointerleave={clearTrendHover}
							onkeydown={handleTrendKeys}
						>
							<svg viewBox="0 0 {trendChart.W} {trendChart.H}" class="chart" aria-hidden="true" focusable="false">
								<defs>
									<linearGradient id="punTrendArea" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="#4c8dff" stop-opacity="0.45"></stop>
										<stop offset="100%" stop-color="#4c8dff" stop-opacity="0.02"></stop>
									</linearGradient>
								</defs>

								{#each trendChart.ticks as t, k (k)}
									<line x1={trendChart.padL} x2={trendChart.W - trendChart.padR} y1={t.y} y2={t.y} class="grid"></line>
									<text x={trendChart.padL - 8} y={t.y + 4} text-anchor="end" class="tick">{axisFmt(t.v)}</text>
								{/each}
								{#each trendChart.labels as lab, i (i)}
									{#if trendChart.labels.length <= 8 || i === 0 || i === trendChart.labels.length - 1 || i === Math.floor((trendChart.labels.length - 1) / 2)}
										<text x={trendChart.pts[i].x.toFixed(1)} y={trendChart.H - 10} text-anchor="middle" class="tick">
											{lab}
										</text>
									{/if}
								{/each}

								{#if trendChart.area}
									<path d={trendChart.area} fill="url(#punTrendArea)"></path>
								{/if}

								{#if trendChart.line}
									<path d={trendChart.line} class="line" fill="none"></path>
								{/if}

								{#each trendChart.pts as p (p.i)}
									{#if p.v !== null}
										<circle
											cx={p.x}
											cy={p.y}
											r={p.i === trendHover ? 5 : trendChart.pts.length > 40 ? 1.5 : 2.5}
											class="dot"
											class:dot--hover={p.i === trendHover}
										></circle>
									{/if}
								{/each}

								{#if trendHovered && trendHovered.y !== null}
									<line x1={trendHovered.x} x2={trendHovered.x} y1={trendChart.padT} y2={trendChart.padT + trendChart.innerH} class="hover-line"></line>
								{/if}
							</svg>

							{#if trendHovered && trendHovered.v !== null && trendHover !== null}
								<div
									class="chart-tip"
									style:left="{trendHovered.x / trendChart.W * 100}%"
									style:top="{/** @type {number} */ (trendHovered.y / trendChart.H * 100)}%"
									role="status"
								>
									<strong>{trendTipTitle(/** @type {number} */ (trendHover))}</strong>
									<span class="text-mono">{trendTipValue(/** @type {number} */ (trendHover))}</span>
									{#if range === '12m'}
										{@const tm = monthly[/** @type {number} */ (trendHover)]}
										{#if tm}<small>min {formatPrice(tm.min, unit)} · max {formatPrice(tm.max, unit)}</small>{/if}
									{:else}
										{@const td = trend[/** @type {number} */ (trendHover)]}
										{#if td}<small>min {formatPrice(td.min, unit)} · max {formatPrice(td.max, unit)}</small>{/if}
									{/if}
								</div>
							{/if}
						</div>

						<div class="chart-meta" aria-live="polite">
							<span>
								{#if trendSource === 'sample'}
									Dati dimostrativi: la rete non ha risposto{#if trendNote} ({trendNote}){/if}. Riprova con “Aggiorna”.
								{:else if trendSource === 'cache'}
									Ultimo aggiornamento {trendUpdatedLabel}{#if trendNote} · {trendNote}{:else} · in attesa della rete.{/if}
								{:else}
									Aggiornato {trendUpdatedLabel} · {range === '12m' ? 'medie mensili' : 'medie giornaliere'}, zona Nord.
								{/if}
							</span>
							<label class="auto-refresh">
								<input type="checkbox" bind:checked={autoRefresh} />
								Dati Live (15 min)
							</label>
						</div>
					{/if}
				{/if}
			</div>
		</section>

		<!-- Stats -->
		{#if range === '3g' && selected || isTrend && periodStats}
			{#if range === '3g' && selected}
				<div class="row gy-3 mb-4" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
							<div class="stat-value text-mono">{formatPrice(selected.avg, unit)}</div>
							<div class="stat-label">Media 24h</div>
							<small class="text-muted">{formatPrice(selected.avg, unit === 'ckwh' ? 'eur-mwh' : 'ckwh')}</small>
						</div>
					</div>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
							<div class="stat-value text-mono stat-min">{formatPrice(selected.min, unit)}</div>
							<div class="stat-label">Minimo · {hourRange(selected.minHour)}</div>
							<small class="text-muted">ora più economica</small>
						</div>
					</div>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
							<div class="stat-value text-mono stat-max">{formatPrice(selected.max, unit)}</div>
							<div class="stat-label">Massimo · {hourRange(selected.maxHour)}</div>
							<small class="text-muted">ora più cara</small>
						</div>
					</div>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
						<div class="stat-value text-mono">
							{cheap3h ? hourRange(cheap3h.startHour) : '—'}
						</div>
							<div class="stat-label">Fascia 3h più economica</div>
							<small class="text-muted">{cheap3h ? formatPrice(cheap3h.avg, unit) + ' medi' : ''}</small>
						</div>
					</div>
				</div>
			{:else if periodStats}
				<div class="row gy-3 mb-4" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
							<div class="stat-value text-mono">{formatPrice(periodStats.avg, unit)}</div>
							<div class="stat-label">{range === '12m' ? 'Media 12 mesi' : 'Media periodo'}</div>
							<small class="text-muted">{formatPrice(periodStats.avg, unit === 'ckwh' ? 'eur-mwh' : 'ckwh')}</small>
						</div>
					</div>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
							<div class="stat-value text-mono stat-min">{formatPrice(periodStats.minVal, unit)}</div>
							<div class="stat-label">{range === '12m' ? 'Mese' : 'Giorno'} più economico</div>
							<small class="text-muted">{periodStats.minLabel}</small>
						</div>
					</div>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
							<div class="stat-value text-mono stat-max">{formatPrice(periodStats.maxVal, unit)}</div>
							<div class="stat-label">{range === '12m' ? 'Mese' : 'Giorno'} più caro</div>
							<small class="text-muted">{periodStats.maxLabel}</small>
						</div>
					</div>
					<div class="col-6 col-lg-3">
						<div class="stat-card text-center h-100">
							<div class="stat-value text-mono">{periodStats.countLabel}</div>
							<div class="stat-label">Copertura</div>
							<small class="text-muted">{range === '12m' ? 'medie mensili' : 'medie giornaliere'}</small>
						</div>
					</div>
				</div>
			{/if}

			<!-- Estimator + table -->
			<div class="row gy-4 mb-4">
				<div class="col-12 col-lg-4" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
					<div class="card energy-card h-100">
						<div class="card-header energy-card__head">
							<h2 class="h5 mb-0"><i class="fas fa-plug-circle-bolt me-2 text-accent"></i>Quanto mi costa?</h2>
						</div>
						<div class="card-body">
							<label class="form-label fw-bold" for="kwhInput">Consumo (kWh)</label>
							<input
								id="kwhInput"
								type="number"
								min="0.1"
								max="100"
								step="0.1"
								class="form-control form-control-custom mb-3"
								bind:value={kwh}
							/>
							<label class="form-label fw-bold" for="basisSelect">Tariffa di riferimento</label>

							<select
								id="basisSelect"
								class="form-select form-control-custom mb-3"
								bind:value={basis}
							>
								<option value="avg">
									{isTrend
										? range === '12m' ? 'Media 12 mesi' : 'Media periodo'
										: 'Media del giorno'}
								</option>

								<option value="min">
									{isTrend
										? range === '12m' ? 'Mese più economico' : 'Giorno più economico'
										: 'Ora più economica'}
								</option>

								<option value="max">
									{isTrend
										? range === '12m' ? 'Mese più caro' : 'Giorno più caro'
										: 'Ora più cara'}
								</option>

								{#if !isTrend}
									<option value="now">Ora corrente</option>
								{/if}
							</select>
							<div class="estimate-box text-center">
								<div class="estimate-value text-mono">{costForKwh(kwh, basisPrice)}</div>
								<small class="text-muted">a {formatPrice(basisPrice, unit)}</small>
							</div>
							<p class="mb-0 mt-3 small text-muted">
								Stima della sola materia energia (senza oneri, IVA e quota fissa): utile per confrontare fasce orarie,
								non è la bolletta.
							</p>
						</div>
					</div>
				</div>

				<div class="col-12 col-lg-8" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
					<div class="card energy-card h-100">
						<div class="card-header energy-card__head">
							<h2 class="h5 mb-0">
								{#if range === '3g'}
									<i class="fas fa-table-list me-2 text-accent"></i>Prezzi per ora · {selected ? dayLabel(selected.date) : ''}
								{:else if range === '12m'}
									<i class="fas fa-table-list me-2 text-accent"></i>Medie mensili · ultimi 12 mesi
								{:else}
									<i class="fas fa-table-list me-2 text-accent"></i>Medie giornaliere · {range === '30g' ? 'ultimi 30 giorni' : 'ultimi 7 giorni'}
								{/if}
							</h2>
						</div>
						<div class="card-body p-0">
							<div class="table-responsive">
								<table class="table table-dark energy-table mb-0">
									<thead>
										<tr>
											<th scope="col">{range === '3g' ? 'Ora' : range === '12m' ? 'Mese' : 'Giorno'}</th>
											<th scope="col" class="text-end">{range === '3g' ? 'Prezzo' : 'Media'}</th>
											<th scope="col"><span class="visually-hidden">Livello</span></th>
										</tr>
									</thead>
									<tbody>
										{#if range === '3g' && selected}
											{#each hourly as price, h (h)}
												<tr
													class:row-now={isToday && h === nowHour}
													class:row-min={h === selected.minHour}
													class:row-max={h === selected.maxHour}
													class:row-cheap={cheap3h && h >= cheap3h.startHour && h < cheap3h.startHour + 3}
												>
													<th scope="row" class="text-mono">{hourRange(h)}</th>
													<td class="text-end text-mono">
														{formatPrice(price, unit)}
														{#if isToday && h === nowHour}<span class="badge-now">ora</span>{/if}
														{#if h === selected.minHour}<span class="badge-min">min</span>{/if}
														{#if h === selected.maxHour}<span class="badge-max">max</span>{/if}
													</td>
													<td class="bar-cell">
														{#if typeof price === 'number' && typeof selected.max === 'number' && selected.max > 0}
															<span
																class="bar"
																style:width={`${Math.max(4, price / selected.max * 100).toFixed(1)}%`}
															></span>
														{/if}
													</td>
												</tr>
											{/each}
										{:else if range === '12m'}
											{#each monthly as m (m.month)}
												<tr
													class:row-min={periodStats && m.avg === periodStats.minVal}
													class:row-max={periodStats && m.avg === periodStats.maxVal}
												>
													<th scope="row" class="text-mono">{monthLabel(m.month)}</th>
													<td class="text-end text-mono">
														{formatPrice(m.avg, unit)}
														{#if periodStats && m.avg === periodStats.minVal}<span class="badge-min">min</span>{/if}
														{#if periodStats && m.avg === periodStats.maxVal}<span class="badge-max">max</span>{/if}
														{#if typeof m.min === 'number' && typeof m.max === 'number'}
															<small class="d-block text-muted">{formatPrice(m.min, unit)} – {formatPrice(m.max, unit)}</small>
														{/if}
													</td>
													<td class="bar-cell">
														{#if typeof m.avg === 'number' && periodStats && typeof periodStats.maxVal === 'number' && periodStats.maxVal > 0}
															<span
																class="bar"
																style:width={`${Math.max(4, m.avg / periodStats.maxVal * 100).toFixed(1)}%`}
															></span>
														{/if}
													</td>
												</tr>
											{/each}
										{:else}
											{#each trend as d (d.date)}
												<tr
													class:row-min={periodStats && d.avg === periodStats.minVal}
													class:row-max={periodStats && d.avg === periodStats.maxVal}
												>
													<th scope="row" class="text-mono">{dayLabel(d.date)} <small class="text-muted">{d.date.slice(5)}</small></th>
													<td class="text-end text-mono">
														{formatPrice(d.avg, unit)}
														{#if periodStats && d.avg === periodStats.minVal}<span class="badge-min">min</span>{/if}
														{#if periodStats && d.avg === periodStats.maxVal}<span class="badge-max">max</span>{/if}
														{#if typeof d.min === 'number' && typeof d.max === 'number'}
															<small class="d-block text-muted">{formatPrice(d.min, unit)} – {formatPrice(d.max, unit)}</small>
														{/if}
													</td>
													<td class="bar-cell">
														{#if typeof d.avg === 'number' && periodStats && typeof periodStats.maxVal === 'number' && periodStats.maxVal > 0}
															<span
																class="bar"
																style:width={`${Math.max(4, d.avg / periodStats.maxVal * 100).toFixed(1)}%`}
															></span>
														{/if}
													</td>
												</tr>
											{/each}
										{/if}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<div class="row">
			<div class="col-12">
				<div class="disclaimer-section text-center" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
					<small class="text-muted disclaimer-text">
						<i class="fas fa-circle-info me-1"></i>
						Valori a scopo informativo (materia energia, IVA e oneri esclusi), non costituiscono la bolletta. Fonte dati:
						GME – Gestore dei Mercati Energetici (mercatoelettrico.org) · prezzi zona Nord via energy-charts.info / Fraunhofer
						ISE (CC BY 4.0, dati Bundesnetzagentur | SMARD.de).
						{validCount < 24 && selected
							? ` Per ${dayLabel(selected.date).toLowerCase()} sono disponibili ${validCount}/24 ore.`
							: ''}
					</small>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.energy-page {
		overflow-x: hidden;
		overflow-x: clip;
	}

	.energy-title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 800;
		color: var(--ink);
	}

	.hero-badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.6rem 1rem;
		margin-top: 1.25rem;
	}

	.source-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.8rem;
		border-radius: var(--radius-card);
		border: 1px solid var(--line);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.source-badge__dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: var(--ink-faint);
	}

	.source-badge.is-live {
		border-color: rgba(46, 204, 113, 0.55);
		color: var(--success);
	}
	.source-badge.is-live .source-badge__dot {
		background: var(--success);
	}
	.source-badge.is-proxy {
		border-color: var(--azure-line);
		color: var(--azure-bright);
	}
	.source-badge.is-proxy .source-badge__dot {
		background: var(--azure);
	}
	.source-badge.is-cache {
		border-color: var(--gold-line);
		color: var(--gold);
	}
	.source-badge.is-cache .source-badge__dot {
		background: var(--gold);
	}

	.hero-price {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--ink);
	}

	.hero-price-sub {
		font-size: 0.85rem;
		color: var(--ink-soft);
	}

	.energy-card {
		background: var(--surface);
		border: 1px solid var(--azure-line);
		border-radius: var(--radius-card);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	}

	.energy-card__head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		background: var(--azure-soft);
		border-bottom: 1px solid var(--azure-line);
		padding: 0.9rem 1rem;
	}

	.energy-card__head h2 {
		color: var(--ink);
	}

	.text-accent {
		color: var(--azure) !important;
	}

	.day-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.day-tab {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		background: transparent;
		color: var(--ink-soft);
		font-weight: 700;
		font-size: 0.85rem;
		line-height: 1.2;
		transition:
			border-color 0.2s ease,
			color 0.2s ease,
			background-color 0.2s ease;
	}

	.day-tab small {
		font-size: 0.68rem;
		font-weight: 500;
		color: var(--ink-faint);
	}

	.day-tab:hover {
		border-color: var(--azure-line);
		color: var(--ink);
	}

	.day-tab.active {
		background: var(--azure);
		border-color: var(--azure);
		color: #000;
	}

	.day-tab.active small {
		color: rgba(0, 0, 0, 0.65);
	}

	.head-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.unit-toggle {
		display: inline-flex;
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		overflow: hidden;
	}

	.unit-toggle button {
		border: 0;
		background: transparent;
		color: var(--ink-soft);
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.45rem 0.75rem;
	}

	.unit-toggle button.active {
		background: var(--azure-soft);
		color: var(--azure-bright);
	}

	.range-toggle {
		display: inline-flex;
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		overflow: hidden;
	}

	.range-toggle button {
		border: 0;
		background: transparent;
		color: var(--ink-soft);
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.45rem 0.7rem;
	}

	.range-toggle button + button {
		border-left: 1px solid var(--line);
	}

	.range-toggle button.active {
		background: var(--azure);
		color: #000;
	}

	.trend-summary {
		display: flex;
		flex-direction: column;
		line-height: 1.3;
		color: var(--ink);
		font-size: 0.95rem;
	}

	.trend-summary small {
		color: var(--ink-faint);
		font-size: 0.72rem;
	}

	.btn-refresh {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		background: transparent;
		color: var(--ink);
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.45rem 0.8rem;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
	}

	.btn-refresh:hover:not(:disabled) {
		border-color: var(--gold);
		background: var(--gold-soft);
	}

	.btn-refresh:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.chart-wrap {
		position: relative;
	}

	.chart {
		display: block;
		width: 100%;
		height: auto;
		touch-action: pan-y;
	}

	.chart:focus-visible,
	.chart-wrap:focus-visible {
		outline: 2px solid var(--azure);
		outline-offset: 4px;
	}

	.chart .grid {
		stroke: var(--line);
		stroke-width: 1;
	}

	.chart .tick {
		fill: var(--ink-faint);
		font-size: 11px;
		font-family: var(--font-mono);
	}

	.chart .line {
		stroke: var(--azure);
		stroke-width: 2.5;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.chart .cheap-band {
		fill: rgba(46, 204, 113, 0.1);
	}

	.chart .now-line {
		stroke: var(--gold);
		stroke-width: 1.5;
		stroke-dasharray: 5 4;
	}

	.chart .hover-line {
		stroke: var(--ink-soft);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}

	.chart .dot {
		fill: var(--azure);
	}

	.chart .dot--max {
		fill: var(--gold);
	}

	.chart .dot--min {
		fill: var(--success);
	}

	.chart .dot--hover {
		fill: #fff;
		stroke: var(--azure);
		stroke-width: 2;
	}

	.chart-tip {
		position: absolute;
		transform: translate(-50%, -115%);
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--azure-line);
		border-radius: var(--radius-card);
		background: rgba(4, 6, 10, 0.95);
		font-size: 0.8rem;
		white-space: nowrap;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		z-index: 2;
	}

	.chart-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-top: 0.75rem;
		font-size: 0.85rem;
		color: var(--ink-soft);
	}

	.auto-refresh {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		cursor: pointer;
	}

	.chart-skeleton {
		padding: 2.5rem 1rem;
		text-align: center;
		color: var(--ink-soft);
	}

	.chart-skeleton__bar {
		height: 0.6rem;
		border-radius: var(--radius-card);
		background: var(--azure-soft);
		margin-bottom: 1rem;
	}

	.stat-card {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		padding: 1rem;
		transition:
			border-color 0.25s ease,
			transform 0.25s var(--ease-out-expo);
	}

	.stat-card:hover {
		border-color: var(--azure-line);
		transform: translateY(-2px);
	}

	.stat-value {
		font-size: 1.35rem;
		font-weight: 800;
		color: var(--ink);
	}

	.stat-min {
		color: var(--success);
	}

	.stat-max {
		color: var(--gold);
	}

	.stat-label {
		font-size: 0.85rem;
		color: var(--azure);
		font-weight: 600;
		margin-top: 0.25rem;
	}

	.form-control-custom {
		background-color: var(--surface-2) !important;
		border: 1px solid var(--line) !important;
		color: var(--ink) !important;
	}

	.form-control-custom:focus {
		background-color: var(--surface-ink) !important;
		border-color: var(--azure) !important;
		box-shadow: 0 0 0 0.2rem var(--azure-soft) !important;
		color: var(--ink) !important;
	}

	.estimate-box {
		border: 1px solid var(--gold-line);
		background: var(--gold-soft);
		border-radius: var(--radius-card);
		padding: 1rem;
	}

	.estimate-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--gold);
	}

	.energy-table {
		--bs-table-bg: transparent;
	}

	.energy-table th,
	.energy-table td {
		padding: 0.55rem 0.75rem;
		border-bottom: 1px solid var(--line);
		vertical-align: middle;
	}

	.energy-table thead th {
		background: var(--surface-2);
		color: var(--ink-soft);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.energy-table tbody tr:hover {
		background: var(--azure-soft);
	}

	.energy-table .row-now {
		background: rgba(255, 204, 0, 0.07);
	}

	.energy-table .row-cheap td:first-child,
	.energy-table .row-cheap th:first-child {
		box-shadow: inset 3px 0 0 var(--success);
	}

	.badge-now,
	.badge-min,
	.badge-max {
		display: inline-block;
		margin-left: 0.5rem;
		padding: 0.1rem 0.45rem;
		border-radius: var(--radius-card);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.badge-now {
		background: var(--gold);
		color: #000;
	}

	.badge-min {
		background: var(--success);
		color: #000;
	}

	.badge-max {
		background: transparent;
		border: 1px solid var(--gold-line);
		color: var(--gold);
	}

	.bar-cell {
		width: 32%;
		min-width: 5rem;
	}

	.bar {
		display: block;
		height: 0.45rem;
		border-radius: var(--radius-card);
		background: var(--azure);
	}

	.row-max .bar {
		background: var(--gold);
	}

	.row-min .bar {
		background: var(--success);
	}

	.disclaimer-section {
		padding-bottom: 1rem;
	}

	.disclaimer-text {
		line-height: 1.7;
	}

	/*.energy-card a {
		color: var(--azure-bright);
	}*/

	@media (max-width: 575.98px) {
		.stat-value {
			font-size: 1.1rem;
		}

		.estimate-value {
			font-size: 1.6rem;
		}

		.energy-card__head {
			flex-direction: column;
			align-items: stretch;
		}

		.head-controls {
			justify-content: space-between;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stat-card,
		.day-tab,
		.btn-refresh {
			transition: none;
		}

		.stat-card:hover {
			transform: none;
		}
	}
</style>
