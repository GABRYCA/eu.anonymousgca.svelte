<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { scrollAnimation } from '$lib/actions/scrollAnimation.js';
	import {
		fetchPunWindow,
		loadCached,
		saveCache,
		getSampleDays,
		cheapestWindow,
		formatPrice,
		costForKwh,
		dayLabel,
		romeDateKey,
		romeHour
	} from '$lib/energy/pun.js';

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
	let kwh = $state(1);
	/** @type {'avg'|'min'|'max'|'now'} */
	let basis = $state('avg');
	let autoRefresh = $state(true);

	const nowKey = romeDateKey();
	const nowHour = romeHour();

	// ── Derived ────────────────────────────────────────────────────────
	const selected = $derived(days.find((d) => d.date === selectedDate) ?? days[days.length - 1] ?? null);
	const hourly = $derived(selected?.hourly ?? []);
	const validCount = $derived(hourly.filter((v) => typeof v === 'number').length);
	const isToday = $derived(selected?.date === nowKey);
	const cheap3h = $derived(selected ? cheapestWindow(selected.hourly, 3) : null);

	const basisPrice = $derived.by(() => {
		if (!selected) return null;
		if (basis === 'min') return selected.min;
		if (basis === 'max') return selected.max;
		if (basis === 'now') return isToday ? (hourly[nowHour] ?? selected.avg) : selected.avg;
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
		const vals = hourly.map((v) => (typeof v === 'number' ? (unit === 'ckwh' ? v / 10 : v) : null));
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
		const x = (/** @type {number} */ i) => padL + (i / 23) * innerW;
		const y = (/** @type {number} */ v) => padT + (1 - (v - lo) / (hi - lo)) * innerH;
		const pts = vals.map((v, i) => ({ i, v, x: x(i), y: v === null ? null : y(v) }));
		const line = pts
			.filter((p) => p.y !== null)
			.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${/** @type {number} */ (p.y).toFixed(1)}`)
			.join(' ');
		const first = pts.find((p) => p.y !== null);
		const last = [...pts].reverse().find((p) => p.y !== null);
		const area =
			line && first && last
				? `${line} L${last.x.toFixed(1)},${(padT + innerH).toFixed(1)} L${first.x.toFixed(1)},${(padT + innerH).toFixed(1)} Z`
				: '';
		const ticks = [0, 1, 2, 3].map((k) => {
			const v = lo + ((hi - lo) * k) / 3;
			return { v, y: y(v) };
		});
		return { W, H, padL, padR, padT, padB, innerW, innerH, pts, line, area, ticks, lo, hi };
	});

	const hovered = $derived(hoverIndex !== null && chart ? (chart.pts[hoverIndex] ?? null) : null);

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
			const res = await fetchPunWindow();
			days = res.days;
			source = res.source;
			fetchedAt = res.fetchedAt;
			note = res.note ?? '';
			if (!selectedDate || !days.some((d) => d.date === selectedDate)) {
				selectedDate = days.some((d) => d.date === nowKey) ? nowKey : (days[days.length - 1]?.date ?? null);
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
			selectedDate = days.some((d) => d.date === nowKey) ? nowKey : (days[days.length - 1]?.date ?? null);
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
				if (autoRefresh && document.visibilityState === 'visible') load();
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
		const px = ((event.clientX - rect.left) / rect.width) * chart.W;
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
</script>

<div class="energy-page">
	<div class="container-xxl mt-4 mt-md-5">
		<section class="page-hero text-center mb-4 mb-md-5" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
			<h1 class="energy-title page-hero__title mb-3">Energia · Costo</h1>
			<p class="page-hero__lead mx-auto">
				Costo orario "day-ahead" della componente elettrica in Italia, tramite (MGP).
			</p>
			<div class="hero-badges">
				<span class="source-badge {sourceMeta.cls}" role="status">
					<span class="source-badge__dot" aria-hidden="true"></span>
					{sourceMeta.label}
				</span>
				{#if selected}
					<span class="hero-price text-mono">
						{formatPrice(isToday ? (hourly[nowHour] ?? selected.avg) : selected.avg, unit)}
					</span>
					<span class="hero-price-sub"
						>{isToday ? 'ora in corso ·' : ''} media {dayLabel(selected.date).toLowerCase()}</span
					>
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
				<div class="head-controls">
					<div class="unit-toggle" role="group" aria-label="Unità di misura">
						<button
							type="button"
							class:active={unit === 'eur-mwh'}
							aria-pressed={unit === 'eur-mwh'}
							onclick={() => (unit = 'eur-mwh')}>€/MWh</button
						>
						<button
							type="button"
							class:active={unit === 'ckwh'}
							aria-pressed={unit === 'ckwh'}
							onclick={() => (unit = 'ckwh')}>c€/kWh</button
						>
					</div>
					<button type="button" class="btn-refresh" onclick={() => load(true)} disabled={refreshing} aria-live="polite">
						<i class="fas fa-rotate" aria-hidden="true"></i>
						{refreshing ? 'Aggiorno…' : 'Aggiorna'}
					</button>
				</div>
			</div>

			<div class="card-body">
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
									x={(chart.padL + (h / 23) * chart.innerW).toFixed(1)}
									y={chart.H - 10}
									text-anchor="middle"
									class="tick"
								>
									{String(h).padStart(2, '0')}
								</text>
							{/each}

							{#if chart.area}<path d={chart.area} fill="url(#punArea)"></path>{/if}
							{#if chart.line}<path d={chart.line} class="line" fill="none"></path>{/if}

							{#if cheap3h}
								<rect
									x={(chart.padL + (cheap3h.startHour / 23) * chart.innerW).toFixed(1)}
									y={chart.padT}
									width={((3 / 23) * chart.innerW).toFixed(1)}
									height={chart.innerH}
									class="cheap-band"
								></rect>
							{/if}

							{#if isToday}
								<line
									x1={(chart.padL + (nowHour / 23) * chart.innerW).toFixed(1)}
									x2={(chart.padL + (nowHour / 23) * chart.innerW).toFixed(1)}
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
								style:left="{(hovered.x / chart.W) * 100}%"
								style:top="{(/** @type {number} */ (hovered.y / chart.H) * 100)}%"
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
								Ultimo aggiornamento {updatedLabel} · in attesa della rete.
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
			</div>
		</section>

		<!-- Stats -->
		{#if selected}
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
							<select id="basisSelect" class="form-select form-control-custom mb-3" bind:value={basis}>
								<option value="avg">Media del giorno</option>
								<option value="min">Ora più economica</option>
								<option value="max">Ora più cara</option>
								<option value="now">Ora corrente</option>
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
								<i class="fas fa-table-list me-2 text-accent"></i>Prezzi per ora · {dayLabel(selected.date)}
							</h2>
						</div>
						<div class="card-body p-0">
							<div class="table-responsive">
								<table class="table table-dark energy-table mb-0">
									<thead>
										<tr>
											<th scope="col">Ora</th>
											<th scope="col" class="text-end">Prezzo</th>
											<th scope="col"><span class="visually-hidden">Livello</span></th>
										</tr>
									</thead>
									<tbody>
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
														<span class="bar" style:width={`${Math.max(4, (price / selected.max) * 100).toFixed(1)}%`}
														></span>
													{/if}
												</td>
											</tr>
										{/each}
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
