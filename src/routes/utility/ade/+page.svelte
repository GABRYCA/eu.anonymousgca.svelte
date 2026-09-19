<script>
	import { scrollAnimation } from '$lib/actions/scrollAnimation.js';

	const unitPowers = {
		Byte: 0,
		KB: 10,
		MB: 20,
		GB: 30
	};

	let numberInput = $state(2);
	let unitSelect = $state('Byte');
	let bitInput = $state(0);
	let exponentInput = $state(0);
	let memoryInput = $state(0);
	let memoryScale = $state('Byte');
	let wordInput = $state(0);
	let bitsPerWordInput = $state(32);
	let cacheInput = $state(0);
	let cacheScale = $state('Byte');
	let binaryInput = $state('');
	let decimalInput = $state('');

	let bitsResult = $state(null);
	let bitsToBytesResult = $state(null);
	let powerResult = $state(null);
	let memoryResult = $state(null);
	let blockResult = $state(null);
	let cacheResult = $state(null);
	let binaryResult = $state(null);
	let decimalResult = $state(null);

	/**
	 * Log2 of a power of two, or null when the value is not usable.
	 * @param {number} value
	 */
	function powerOfTwoExponent(value) {
		if (!Number.isInteger(value) || value <= 0) return null;
		return (value & (value - 1)) === 0 ? Math.log2(value) : null;
	}

	/**
	 * Bits needed to address `count` units (smallest 2^p >= count).
	 * @param {number} count
	 */
	function addressingBits(count) {
		let power = 0;
		while (Math.pow(2, power) < count) power++;
		return count === 1 ? power + 1 : power;
	}

	function handleSubmit(e) {
		e.preventDefault();
		const exponent = powerOfTwoExponent(Number(numberInput));
		if (exponent === null) {
			bitsResult = { error: 'Inserire una potenza di 2 (valori possibili: 2, 4, 8, 16, 32, 64, 128, 256, 512)' };
			return;
		}
		const totalPower = exponent + unitPowers[unitSelect];
		bitsResult = {
			totalPower,
			needed: totalPower === 1 ? 'Serve' : 'Servono',
			unit: totalPower === 1 ? 'Bit' : 'Bits'
		};
	}

	function handleBitSubmit(e) {
		e.preventDefault();
		const bits = Number(bitInput);
		if (!Number.isInteger(bits) || bits <= 0) {
			bitsToBytesResult = { error: 'Inserire un numero di bit positivo' };
			return;
		}
		if (bits % 8 !== 0) {
			bitsToBytesResult = { error: 'Inserire un multiplo di 8' };
			return;
		}
		const bytes = bits / 8;
		const power = addressingBits(bytes);
		bitsToBytesResult = {
			bytes,
			power,
			needed: power === 1 ? 'Basta' : 'Bastano',
			unit: power === 1 ? 'Bit' : 'Bits'
		};
	}

	function handlePowerSubmit(e) {
		e.preventDefault();
		const exponent = Number(exponentInput);
		if (!Number.isInteger(exponent) || exponent < 0) {
			powerResult = { error: 'Inserire un valore intero maggiore o uguale a 0' };
			return;
		}
		powerResult = { value: Math.pow(2, exponent) };
	}

	function handleMemorySubmit(e) {
		e.preventDefault();
		const exponent = powerOfTwoExponent(Number(memoryInput));
		if (exponent === null) {
			memoryResult = { error: 'Inserire una potenza di 2 (valori possibili: 2, 4, 8, 16, 32, 64, 128, 256, 512)' };
			return;
		}
		const totalPower = exponent + unitPowers[memoryScale];
		memoryResult = {
			totalPower,
			needed: totalPower === 1 ? 'Serve' : 'Servono',
			unit: totalPower === 1 ? 'Bit' : 'Bits'
		};
	}

	function handleBlockSubmit(e) {
		e.preventDefault();
		const words = Number(wordInput);
		const bitsPerWord = Number(bitsPerWordInput);
		if (!Number.isInteger(words) || words <= 0) {
			blockResult = { error: 'Inserire un numero di parole positivo' };
			return;
		}
		if (!Number.isInteger(bitsPerWord) || bitsPerWord <= 0 || bitsPerWord % 8 !== 0) {
			blockResult = { error: 'Il numero di bit per parola deve essere un multiplo di 8' };
			return;
		}
		const wordBits = addressingBits(words);
		const offsetBits = addressingBits(bitsPerWord / 8);
		const totalPower = wordBits + offsetBits;
		blockResult = {
			totalPower,
			wordBits,
			offsetBits,
			needed: totalPower === 1 ? 'Basta' : 'Bastano',
			unit: totalPower === 1 ? 'Bit' : 'Bits'
		};
	}

	function handleCacheSubmit(e) {
		e.preventDefault();
		const exponent = powerOfTwoExponent(Number(cacheInput));
		if (exponent === null) {
			cacheResult = { error: 'Inserire una potenza di 2 (valori possibili: 2, 4, 8, 16, 32, 64, 128, 256, 512)' };
			return;
		}
		const totalPower = exponent + unitPowers[cacheScale];
		cacheResult = {
			totalPower,
			needed: totalPower === 1 ? 'Serve' : 'Servono',
			unit: totalPower === 1 ? 'Bit' : 'Bits'
		};
	}

	function binaryToDecimal(e) {
		e.preventDefault();
		const value = binaryInput.trim();
		if (!/^[01]+$/.test(value)) {
			binaryResult = { error: 'Inserire un numero binario valido (solo 0 e 1)' };
			return;
		}
		binaryResult = { value: BigInt(`0b${value}`).toString(10) };
	}

	function decimalToBinary(e) {
		e.preventDefault();
		const value = decimalInput.trim();
		if (!/^\d+$/.test(value)) {
			decimalResult = { error: 'Inserire un numero decimale valido (solo cifre)' };
			return;
		}
		decimalResult = { value: BigInt(value).toString(2) };
	}
</script>

<div class="ade-page">
	<div class="container-xxl mt-4 mt-md-5 mb-4 mb-md-5">
		<section class="page-hero mb-4 mb-md-5" use:scrollAnimation={{ animation: 'ink-up', duration: 600 }}>
			<h1 class="ade-title page-hero__title">Architettura degli Elaboratori</h1>
			<p class="page-hero__lead">
				Calcolatori per ADE: bit per la memoria e per la cache, conversione bit↔byte, potenze di 2, indirizzamenti di
				memoria e conversioni binario/decimale.
			</p>
		</section>

		<div class="row g-3 g-md-4">
			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h2 class="calc-card__title"><i class="fas fa-calculator" aria-hidden="true"></i> Bit Memoria/Cache</h2>
					</header>
					<div class="calc-card__body">
						<form onsubmit={handleSubmit}>
							<div class="row g-2 mb-3">
								<div class="col-md-9 col-12">
									<label for="numberInput" class="form-label">
										Potenza di 2 (2, 4, 8...): <strong class="text-warning-gca">x</strong> per il calcolo log<sub>2</sub
										><strong class="text-warning-gca">x</strong>
									</label>
									<input
										bind:value={numberInput}
										type="number"
										class="form-control calc-input"
										id="numberInput"
										min="0"
										max="1024"
										step="2"
										required
									/>
								</div>
								<div class="col-md-3 col-12">
									<label for="unitSelect" class="form-label">Unità</label>
									<select bind:value={unitSelect} class="form-select calc-input" id="unitSelect">
										<option>Byte</option>
										<option>KB</option>
										<option>MB</option>
										<option>GB</option>
									</select>
								</div>
							</div>
							<button type="submit" class="calc-btn"><i class="fas fa-check" aria-hidden="true"></i> Calcola</button>
						</form>
						{#if bitsResult}
							{#if bitsResult.error}
								<p class="calc-result calc-result--error">{bitsResult.error}</p>
							{:else}
								<p class="calc-result">
									2<sup class="text-warning-gca">{bitsResult.totalPower}</sup>
									<span class="calc-result__note">({bitsResult.needed} {bitsResult.totalPower} {bitsResult.unit})</span>
								</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350, delay: 60 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h2 class="calc-card__title">
							<i class="fas fa-right-left" aria-hidden="true"></i> Convertitore Bit a Byte
						</h2>
					</header>
					<div class="calc-card__body">
						<form onsubmit={handleBitSubmit}>
							<div class="mb-3">
								<label for="bitInput" class="form-label">
									Numero di Bit (multiplo di 8, solitamente 16, 32, 64...)
								</label>
								<input
									bind:value={bitInput}
									type="number"
									class="form-control calc-input"
									id="bitInput"
									min="0"
									step="8"
									required
								/>
							</div>
							<button type="submit" class="calc-btn"><i class="fas fa-check" aria-hidden="true"></i> Converti</button>
						</form>
						{#if bitsToBytesResult}
							{#if bitsToBytesResult.error}
								<p class="calc-result calc-result--error">{bitsToBytesResult.error}</p>
							{:else}
								<p class="calc-result">
									{bitsToBytesResult.bytes} Byte — 2<sup class="text-warning-gca">{bitsToBytesResult.power}</sup>
									<span class="calc-result__note"
										>({bitsToBytesResult.needed} {bitsToBytesResult.power} {bitsToBytesResult.unit})</span
									>
								</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="row g-3 g-md-4 mt-1">
			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h2 class="calc-card__title"><i class="fas fa-superscript" aria-hidden="true"></i> Potenza di 2</h2>
					</header>
					<div class="calc-card__body">
						<form onsubmit={handlePowerSubmit}>
							<div class="row justify-content-start g-1 mb-3">
								<div class="col-12">
									<label for="exponentInput" class="form-label"
										>Esponente di 2, ossia <strong class="text-warning-gca">x</strong> di 2<sup class="text-warning-gca"
											>x</sup
										></label
									>
								</div>
								<div class="col-auto align-self-center">
									<span class="calc-power-base">2</span>
								</div>
								<div class="col-auto">
									<input
										bind:value={exponentInput}
										type="number"
										class="form-control calc-input"
										id="exponentInput"
										min="0"
										max="99"
										required
									/>
								</div>
							</div>
							<button type="submit" class="calc-btn"><i class="fas fa-check" aria-hidden="true"></i> Calcola</button>
						</form>
						{#if powerResult}
							{#if powerResult.error}
								<p class="calc-result calc-result--error">{powerResult.error}</p>
							{:else}
								<p class="calc-result">2<sup class="text-warning-gca">{exponentInput}</sup> = {powerResult.value}</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350, delay: 60 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h2 class="calc-card__title"><i class="fas fa-memory" aria-hidden="true"></i> Memoria Totale</h2>
					</header>
					<div class="calc-card__body">
						<form onsubmit={handleMemorySubmit}>
							<div class="row g-2 mb-3">
								<div class="col-md-9 col-12">
									<label for="memoryInput" class="form-label">Quantità di memoria (potenza di 2)</label>
									<input
										bind:value={memoryInput}
										type="number"
										class="form-control calc-input"
										id="memoryInput"
										min="0"
										max="1024"
										step="2"
										required
									/>
								</div>
								<div class="col-md-3 col-12">
									<label for="memoryScale" class="form-label">Scala</label>
									<select bind:value={memoryScale} class="form-select calc-input" id="memoryScale">
										<option>Byte</option>
										<option>KB</option>
										<option>MB</option>
										<option>GB</option>
									</select>
								</div>
							</div>
							<button type="submit" class="calc-btn"><i class="fas fa-check" aria-hidden="true"></i> Calcola</button>
						</form>
						{#if memoryResult}
							{#if memoryResult.error}
								<p class="calc-result calc-result--error">{memoryResult.error}</p>
							{:else}
								<p class="calc-result">
									2<sup class="text-warning-gca">{memoryResult.totalPower}</sup>
									<span class="calc-result__note"
										>({memoryResult.needed} {memoryResult.totalPower} {memoryResult.unit})</span
									>
								</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="row g-3 g-md-4 mt-1">
			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h2 class="calc-card__title">
							<i class="fas fa-layer-group" aria-hidden="true"></i> Dimensione Blocco/<span class="text-info-gca"
								>offset</span
							>
						</h2>
					</header>
					<div class="calc-card__body">
						<form onsubmit={handleBlockSubmit}>
							<div class="row g-2 mb-3">
								<div class="col-md-6 col-12">
									<label for="wordInput" class="form-label">Numero di parole</label>
									<input
										bind:value={wordInput}
										type="number"
										class="form-control calc-input"
										id="wordInput"
										min="1"
										max="1024"
										step="1"
										required
									/>
								</div>
								<div class="col-md-6 col-12">
									<label for="bitsPerWordInput" class="form-label">Bit per parola</label>
									<input
										bind:value={bitsPerWordInput}
										type="number"
										class="form-control calc-input"
										id="bitsPerWordInput"
										min="8"
										max="1024"
										step="8"
										required
									/>
								</div>
							</div>
							<button type="submit" class="calc-btn"><i class="fas fa-check" aria-hidden="true"></i> Calcola</button>
						</form>
						{#if blockResult}
							{#if blockResult.error}
								<p class="calc-result calc-result--error">{blockResult.error}</p>
							{:else}
								<p class="calc-result">
									2<sup class="text-warning-gca">{blockResult.totalPower}</sup>
									<span class="calc-result__note"
										>({blockResult.needed}
										{blockResult.totalPower}
										{blockResult.unit} — parole: 2<sup>{blockResult.wordBits}</sup>, offset: 2<sup
											>{blockResult.offsetBits}</sup
										>)</span
									>
								</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350, delay: 60 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h2 class="calc-card__title">
							<i class="fas fa-microchip" aria-hidden="true"></i> Dimensione Memoria Cache
						</h2>
					</header>
					<div class="calc-card__body">
						<form onsubmit={handleCacheSubmit}>
							<div class="row g-2 mb-3">
								<div class="col-md-9 col-12">
									<label for="cacheInput" class="form-label">Dimensione della cache (potenza di 2)</label>
									<input
										bind:value={cacheInput}
										type="number"
										class="form-control calc-input"
										id="cacheInput"
										min="0"
										max="1024"
										step="2"
										required
									/>
								</div>
								<div class="col-md-3 col-12">
									<label for="cacheScale" class="form-label">Scala</label>
									<select bind:value={cacheScale} class="form-select calc-input" id="cacheScale">
										<option>Byte</option>
										<option>KB</option>
										<option>MB</option>
										<option>GB</option>
									</select>
								</div>
							</div>
							<button type="submit" class="calc-btn"><i class="fas fa-check" aria-hidden="true"></i> Calcola</button>
						</form>
						{#if cacheResult}
							{#if cacheResult.error}
								<p class="calc-result calc-result--error">{cacheResult.error}</p>
							{:else}
								<p class="calc-result">
									2<sup class="text-warning-gca">{cacheResult.totalPower}</sup>
									<span class="calc-result__note"
										>({cacheResult.needed} {cacheResult.totalPower} {cacheResult.unit})</span
									>
								</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="section-heading mt-5" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
			<h2 id="binary-heading" class="section-heading__title">Calcolatori binari</h2>
			<p class="section-heading__sub">Conversioni istantanee tra binario e decimale</p>
		</div>

		<div class="row g-3 g-md-4">
			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h3 class="calc-card__title"><i class="fas fa-calculator" aria-hidden="true"></i> Binario → Decimale</h3>
					</header>
					<div class="calc-card__body">
						<form onsubmit={binaryToDecimal}>
							<div class="input-group mb-3">
								<input
									bind:value={binaryInput}
									type="text"
									inputmode="numeric"
									class="form-control calc-input"
									placeholder="Inserire numero binario"
									aria-label="Numero binario"
								/>
								<button class="calc-btn calc-btn--compact" type="submit" aria-label="Converti in decimale">
									<i class="fas fa-arrow-right" aria-hidden="true"></i>
								</button>
							</div>
						</form>
						{#if binaryResult}
							{#if binaryResult.error}
								<p class="calc-result calc-result--error">{binaryResult.error}</p>
							{:else}
								<p class="calc-result">Decimale: <span class="text-mono">{binaryResult.value}</span></p>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-6" use:scrollAnimation={{ animation: 'fade-up', duration: 350, delay: 60 }}>
				<div class="calc-card">
					<header class="calc-card__header">
						<h3 class="calc-card__title"><i class="fas fa-calculator" aria-hidden="true"></i> Decimale → Binario</h3>
					</header>
					<div class="calc-card__body">
						<form onsubmit={decimalToBinary}>
							<div class="input-group mb-3">
								<input
									bind:value={decimalInput}
									type="text"
									inputmode="numeric"
									class="form-control calc-input"
									placeholder="Inserire numero decimale"
									aria-label="Numero decimale"
								/>
								<button class="calc-btn calc-btn--compact" type="submit" aria-label="Converti in binario">
									<i class="fas fa-arrow-right" aria-hidden="true"></i>
								</button>
							</div>
						</form>
						{#if decimalResult}
							{#if decimalResult.error}
								<p class="calc-result calc-result--error">{decimalResult.error}</p>
							{:else}
								<p class="calc-result">Binario: <span class="text-mono">{decimalResult.value}</span></p>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<p class="ade-note mt-4 mb-0 text-center" use:scrollAnimation={{ animation: 'fade-up', duration: 350 }}>
			<i class="fas fa-circle-info me-1" aria-hidden="true"></i>
			I calcoli sono pensati per gli esercizi di Architettura degli Elaboratori (Insubria) e restano solo sul tuo dispositivo.
		</p>
	</div>
</div>

<style>
	.ade-title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 800;
	}

	.calc-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		background: var(--surface);
		overflow: hidden;
		transition:
			border-color 0.25s ease,
			transform 0.3s var(--ease-out-expo);
	}

	.calc-card:hover {
		border-color: var(--azure-line);
		transform: translateY(-2px);
	}

	.calc-card__header {
		padding: 0.85rem 1.1rem;
		background: var(--azure-soft);
		border-bottom: 1px solid var(--azure-line);
	}

	.calc-card__title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--ink);
	}

	.calc-card__title i {
		color: var(--azure);
		margin-right: 0.5rem;
	}

	.calc-card__body {
		flex: 1;
		padding: 1.1rem;
	}

	.calc-input {
		background-color: var(--surface-2);
		border: 1px solid var(--line);
		color: var(--ink);
		border-radius: var(--radius-card);
		transition:
			border-color 0.25s ease,
			box-shadow 0.25s ease,
			background-color 0.25s ease;
	}

	.calc-input:focus {
		background-color: var(--surface-ink);
		border-color: var(--azure);
		box-shadow: 0 0 0 0.2rem var(--azure-soft);
		color: var(--ink);
	}

	.calc-input::placeholder {
		color: var(--ink-faint);
	}

	.calc-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 2.75rem;
		padding: 0.6rem 1rem;
		background: var(--azure);
		border: 1px solid var(--azure);
		border-radius: var(--radius-card);
		color: #000;
		font-weight: 700;
		transition:
			background-color 0.25s ease,
			border-color 0.25s ease,
			transform 0.25s var(--ease-out-expo);
	}

	.calc-btn:hover,
	.calc-btn:focus-visible {
		background: var(--gold);
		border-color: var(--gold);
		color: #000;
		transform: translateY(-2px);
	}

	.calc-btn:focus-visible {
		outline: 2px solid var(--azure);
		outline-offset: 2px;
	}

	.calc-btn--compact {
		width: auto;
		min-width: 3rem;
		border-radius: 0 var(--radius-card) var(--radius-card) 0;
	}

	.calc-result {
		margin: 1rem 0 0;
		padding: 0.8rem 1rem;
		border: 1px solid var(--azure-line);
		border-radius: var(--radius-card);
		background: var(--azure-soft);
		color: var(--ink);
		font-size: 1.35rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.calc-result__note {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--ink-soft);
	}

	.calc-result--error {
		border-color: rgba(255, 107, 107, 0.5);
		background: rgba(255, 107, 107, 0.08);
		color: var(--danger);
		font-size: 0.95rem;
		font-weight: 500;
	}

	.calc-power-base {
		font-size: 1.9rem;
		font-weight: 800;
		line-height: 1;
		color: var(--ink);
	}

	:global(.ade-page .text-warning-gca) {
		color: var(--gold);
	}

	:global(.ade-page .text-info-gca) {
		color: var(--azure);
	}

	.section-heading {
		margin-bottom: 1.15rem;
	}

	.section-heading__title {
		margin: 0 0 0.3rem;
		font-size: clamp(1.35rem, 2.4vw, 1.75rem);
		font-weight: 700;
		color: var(--ink);
		text-wrap: balance;
	}

	.section-heading__sub {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.98rem;
	}

	.ade-note {
		color: var(--ink-faint);
		font-size: 0.88rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.calc-card {
			transition: none;
		}

		.calc-card:hover {
			transform: none;
		}
	}
</style>
