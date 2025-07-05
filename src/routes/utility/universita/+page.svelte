<script>
    import {onMount} from 'svelte';

    let exams = $state([]);
    let currentExam = $state({
        name: '',
        cfu: '',
        grade: '',
        hasLode: false
    });

    // Stats
    let totalCfu = $derived(exams.reduce((sum, exam) => sum + parseInt(exam.cfu), 0));
    let totalLode = $derived(exams.filter(exam => exam.hasLode).length);
    let weightedSum = $derived(exams.reduce((sum, exam) => sum + (parseInt(exam.grade) * parseInt(exam.cfu)), 0));
    let currentAverage = $derived(totalCfu > 0 ? weightedSum / totalCfu : 0);
    let baseScore = $derived(currentAverage > 0 ? (currentAverage * 110) / 30 : 0);
    let lodeBonus = $derived(totalLode * 0.33);
    let currentFinalScore = $derived(baseScore);
    let currentCanBeLode = $derived(baseScore >= 110);
    let remainingCfu = $derived(Math.max(0, 180 - totalCfu));
    let maxProjectedSum = $derived(weightedSum + (remainingCfu * 30));
    let maxProjectedAverage = $derived(maxProjectedSum / 180);
    let maxProjectedBase = $derived((maxProjectedAverage * 110) / 30);

    // Calculate estimated remaining exams (assuming average 6 CFU per exam)
    let averageCfuPerExam = $derived(exams.length > 0 ? totalCfu / exams.length : 6);
    let estimatedRemainingExams = $derived(Math.round(remainingCfu / averageCfuPerExam));
    let maxPossibleLode = $derived(totalLode + estimatedRemainingExams);
    let maxFinalScore = $derived(maxProjectedBase);
    let canReach110Lode = $derived(maxProjectedBase >= 110);
    let minProjectedSum = $derived(weightedSum + (remainingCfu * 18));
    let minProjectedAverage = $derived(minProjectedSum / 180);
    let minProjectedBase = $derived((minProjectedAverage * 110) / 30);
    let minFinalScore = $derived(minProjectedBase);
    let minCanReach110Lode = $derived(minProjectedBase >= 110);

    // Form validation
    let isFormValid = $derived(
        currentExam.name.trim() !== '' &&
        currentExam.cfu !== '' &&
        parseInt(currentExam.cfu) > 0 &&
        currentExam.grade !== '' &&
        parseInt(currentExam.grade) >= 18 &&
        parseInt(currentExam.grade) <= 30
    );

    // Load from localStorage on mount
    onMount(() => {
        const savedExams = localStorage.getItem('university-exams');
        if (savedExams) {
            try {
                exams = JSON.parse(savedExams);
            } catch (e) {
                console.error('Error loading saved exams:', e);
            }
        }
    });

    // Save to localStorage
    $effect(() => {
        localStorage.setItem('university-exams', JSON.stringify(exams));
    });

    /**
     * Adds a new exam to the list
     * @param event
     */
    function addExam(event) {
        event?.preventDefault();
        if (!isFormValid) return;

        const newExam = {
            id: Date.now(),
            name: currentExam.name.trim(),
            cfu: parseInt(currentExam.cfu),
            grade: parseInt(currentExam.grade),
            hasLode: currentExam.hasLode && parseInt(currentExam.grade) === 30
        };

        exams = [...exams, newExam];

        // Reset form
        currentExam = {
            name: '',
            cfu: '',
            grade: '',
            hasLode: false
        };
    }

    /**
     * Removes an exam by ID
     * @param examId
     */
    function removeExam(examId) {
        exams = exams.filter(exam => exam.id !== examId);
    }

    /**
     * Clears all exams from the list
     */
    function clearAllExams() {
        if (confirm('Sei sicuro di voler cancellare tutti gli esami?')) {
            exams = [];
        }
    }

    /**
     * Handles key press events for form submission
     * @param event
     */
    function handleKeyPress(event) {
        if (event.key === 'Enter' && isFormValid) {
            addExam();
        }
    }

    /**
     * Formats the score for display
     * @param score
     * @param canBeLode - whether this score can actually achieve "e lode"
     */
    function formatScore(score, canBeLode = false) {
        if (score >= 110 && canBeLode) return '110 e lode';
        if (score >= 110) return '110';
        return Math.round(score * 100) / 100;
    }
</script>

<svelte:head>
    <title>Simulatore Laurea Università - AnonymousGCA</title>
    <meta name="description"
          content="Simula i tuoi voti universitari e calcola la media ponderata e il voto di laurea finale. Supporta CFU e lode.">
</svelte:head>

<div class="university-page">
    <div class="container-xxl mt-4 mt-md-5">
        <div class="row justify-content-center">
            <div class="col-12">
                <div class="text-center mb-5" data-aos="fade-up">
                    <h1 class="university-title mb-3">
                        <i class="fas fa-graduation-cap me-3"></i>
                        Simulatore Laurea Università
                    </h1>
                    <p class="text-muted lead">
                        Calcolatore e simulatore media ponderata + voto di laurea finale
                    </p>
                </div>

                <!-- Instructions Section -->
                <div class="col-12 mb-4" data-aos="fade-up">
                    <div class="card border-custom bg-dark bg-opacity-75">
                        <div class="card-header bg-transparent border-bottom border-custom">
                            <h5 class="mb-0">
                                <i class="fas fa-info-circle me-2 text-accent"></i>
                                Come Funziona
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row gy-3">
                                <div class="col-12 col-md-6">
                                    <div class="info-section">
                                        <h6 class="text-accent mb-2">
                                            <i class="fas fa-calculator me-2"></i>
                                            Media Ponderata (Italia)
                                        </h6>
                                        <p class="mb-0 text-light opacity-75">
                                            Calcoliamo la <strong>media ponderata</strong> secondo il sistema
                                            universitario italiano, nello specifico quello dell'Università degli Studi
                                            dell'Insubria.
                                        </p>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6">
                                    <div class="info-section">
                                        <h6 class="text-accent mb-2">
                                            <i class="fas fa-crown me-2"></i>
                                            Lode
                                        </h6>
                                        <p class="mb-0 text-light opacity-75">
                                            La nostra "lode"
                                            vale come un normale <strong>30 </strong>, ma aggiunge <strong>0.33 punti bonus</strong>
                                            al voto finale (ogni singola lode aggiunge 0.33 punti indipendentemente dal peso dell'esame a livello di CFU).
                                        </p>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="info-section">
                                        <h6 class="text-accent mb-2">
                                            <i class="fas fa-graduation-cap me-2"></i>
                                            Altri dettagli
                                        </h6>
                                        <p class="mb-2 text-light opacity-75">
                                            Alcuni dettagli (componenti dei calcoli):
                                        </p>
                                        <ul class="text-light opacity-75 mb-0 ps-3">
                                            <li><strong>Base:</strong> (Media Ponderata × 110) ÷ 30</li>
                                            <li><strong>Bonus Lodi:</strong> Numero di lodi × 0.33 punti</li>
                                            <li><strong>Massimo:</strong> 110 e lode (se base ≥ 110)</li>
                                            <li><strong>CFU Totali:</strong> 180 CFU</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row gy-4">
            <!-- Form -->
            <div class="col-12 col-lg-6" data-aos="fade-right">
                <div class="card border-custom bg-dark bg-opacity-75 h-100">
                    <div class="card-header bg-transparent border-bottom border-custom">
                        <h4 class="mb-0">
                            <i class="fas fa-plus-circle me-2 text-accent"></i>
                            Aggiungi Esame
                        </h4>
                    </div>
                    <div class="card-body">
                        <form onsubmit={addExam}>
                            <div class="mb-3">
                                <label for="examName" class="form-label fw-bold">
                                    <i class="fas fa-book me-2"></i>Esame
                                </label>
                                <input
                                        type="text"
                                        class="form-control form-control-custom"
                                        id="examName" bind:value={currentExam.name}
                                        onkeypress={handleKeyPress}
                                        placeholder="es. Matematica I"
                                        required
                                >
                            </div>

                            <div class="row">
                                <div class="col-6">
                                    <label for="examCfu" class="form-label fw-bold">
                                        <i class="fas fa-weight-hanging me-2"></i>CFU
                                    </label>
                                    <input
                                            type="number"
                                            class="form-control form-control-custom"
                                            id="examCfu" bind:value={currentExam.cfu}
                                            onkeypress={handleKeyPress}
                                            min="1"
                                            max="30"
                                            placeholder="6"
                                            required
                                    >
                                </div>
                                <div class="col-6">
                                    <label for="examGrade" class="form-label fw-bold">
                                        <i class="fas fa-star me-2"></i>Voto
                                    </label>
                                    <input
                                            type="number"
                                            class="form-control form-control-custom"
                                            id="examGrade" bind:value={currentExam.grade}
                                            onkeypress={handleKeyPress}
                                            min="18"
                                            max="30"
                                            placeholder="30"
                                            required
                                    >
                                </div>
                            </div>

                            <div class="mb-4 mt-3">
                                <div class="form-check">
                                    <input
                                            class="form-check-input"
                                            type="checkbox"
                                            id="examLode"
                                            bind:checked={currentExam.hasLode}
                                            disabled={parseInt(currentExam.grade) !== 30}
                                    >
                                    <label class="form-check-label fw-bold" for="examLode">
                                        <i class="fas fa-crown me-2 text-warning"></i>
                                        Con Lode (solo per voto 30)
                                    </label>
                                </div>
                            </div>

                            <div class="d-grid">
                                <button
                                        type="submit"
                                        class="btn btn-custom btn-lg"
                                        disabled={!isFormValid}
                                >
                                    <i class="fas fa-plus me-2"></i>
                                    Aggiungi Esame
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Statistics -->
            <div class="col-12 col-lg-6" data-aos="fade-left">
                <div class="card border-custom bg-dark bg-opacity-75 h-100">
                    <div class="card-header bg-transparent border-bottom border-custom">
                        <h4 class="mb-0">
                            <i class="fas fa-chart-line me-2 text-accent"></i>
                            Statistiche
                        </h4>
                    </div>
                    <div class="card-body">
                        <div class="row gy-3">
                            <div class="col-6">
                                <div class="stat-card text-center">
                                    <div class="stat-value">{totalCfu}</div>
                                    <div class="stat-label">CFU Acquisiti</div>
                                    <small class="text-muted">su 180 totali</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-card text-center">
                                    <div class="stat-value">{exams.length}</div>
                                    <div class="stat-label">Esami</div>
                                    <small class="text-muted">sostenuti</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-card text-center">
                                    <div class="stat-value text-accent">{currentAverage.toFixed(2)}</div>
                                    <div class="stat-label">Media Ponderata</div>
                                    <small class="text-muted">su 30</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-card text-center">
                                    <div class="stat-value text-warning">{totalLode}</div>
                                    <div class="stat-label">Lodi</div>
                                    <small class="text-muted">+{lodeBonus.toFixed(2)} bonus</small>
                                </div>
                            </div>
                        </div>
                        {#if totalCfu > 0}
                            <div class="mt-4 pt-4 border-top border-custom rounded-3">
                                <h5 class="projection-title mb-4 ms-3">
                                    <i class="fas fa-trophy me-2"></i>
                                    Proiezioni Voto di Laurea
                                </h5>

                                <div class="projection-section rounded-0">
                                    <div class="current-score-card mb-4">
                                        <div class="score-header">
                                            <i class="fas fa-chart-line me-2"></i>
                                            <span class="score-label">Voto Attuale</span>
                                        </div>
                                        <div class="score-value current-score">
                                            {formatScore(currentFinalScore, currentCanBeLode)}<span
                                                class="score-max">/110</span>
                                        </div>
                                        <div class="score-details">
                                            <small class="text-light opacity-75">
                                                Basato su {totalCfu} CFU completati
                                                {#if totalLode > 0}
                                                    <br>Hai {totalLode} lod{totalLode === 1 ? 'e' : 'i'}
                                                    (+{lodeBonus.toFixed(2)} punti)
                                                {/if}
                                            </small>
                                        </div>
                                    </div>

                                    {#if remainingCfu > 0}
                                        <div class="scenarios-grid">
                                            <div class="scenario-card best-scenario">
                                                <div class="scenario-header">
                                                    <i class="fas fa-arrow-trend-up me-2"></i>
                                                    <span class="scenario-label">Scenario Migliore</span>
                                                </div>
                                                <div class="scenario-score best-score">
                                                    {formatScore(maxFinalScore, canReach110Lode)}<span class="score-max">/110</span>
                                                </div>
                                                <div class="scenario-details">
                                                    <small>
                                                        Tutti 30 nei restanti ~{estimatedRemainingExams} esami
                                                        <br>Potenziali lodi: {maxPossibleLode}
                                                        (+{(maxPossibleLode * 0.33).toFixed(2)} punti extra)
                                                    </small>
                                                </div>
                                            </div>
                                            <div class="scenario-card worst-scenario">
                                                <div class="scenario-header">
                                                    <i class="fas fa-arrow-trend-down me-2"></i>
                                                    <span class="scenario-label">Scenario Peggiore</span>
                                                </div>
                                                <div class="scenario-score worst-score">
                                                    {formatScore(minFinalScore, minCanReach110Lode)}<span class="score-max">/110</span>
                                                </div>
                                                <div class="scenario-details">
                                                    <small>
                                                        Tutti 18 nei restanti ~{estimatedRemainingExams} esami
                                                        {#if totalLode > 0}
                                                            <br>Con le tue {totalLode} lod{totalLode === 1 ? 'e' : 'i'}
                                                            attuali
                                                        {/if}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- Exams -->
        {#if exams.length > 0}
            <div class="row mt-4">
                <div class="col-12" data-aos="fade-up">
                    <div class="card border-custom bg-dark bg-opacity-75">
                        <div class="card-header bg-transparent border-bottom border-custom d-flex justify-content-between align-items-center">
                            <h4 class="mb-0">
                                <i class="fas fa-list me-2 text-accent"></i>
                                I Tuoi Esami ({exams.length})
                            </h4>
                            <button
                                    class="btn btn-outline-danger btn-sm"
                                    onclick={clearAllExams}
                            >
                                <i class="fas fa-trash me-2"></i>
                                Cancella Tutti
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive p-2">
                                <table class="table table-dark table-hover mb-0 exams-table">
                                    <thead class="table-header">
                                    <tr>
                                        <th scope="col" class="exam-name-col">
                                            <i class="fas fa-book me-2"></i>Esame
                                        </th>
                                        <th scope="col" class="text-center cfu-col">
                                            <i class="fas fa-weight-hanging me-2"></i>CFU
                                        </th>
                                        <th scope="col" class="text-center grade-col">
                                            <i class="fas fa-star me-2"></i>Voto
                                        </th>
                                        <th scope="col" class="text-center lode-col">
                                            <i class="fas fa-crown me-2"></i>Lode
                                        </th>
                                        <th scope="col" class="text-center weight-col">
                                            <i class="fas fa-calculator me-2"></i>Peso
                                        </th>
                                        <th scope="col" class="text-center actions-col">
                                            <i class="fas fa-cog me-2"></i>Azioni
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {#each exams as exam (exam.id)}
                                        <tr class="exam-row">
                                            <td class="exam-name fw-bold">{exam.name}</td>
                                            <td class="text-center">
                                                <span class="cfu-badge">{exam.cfu}</span>
                                            </td>
                                            <td class="text-center">
                                                <span class="grade-badge grade-{exam.grade >= 27 ? 'excellent' : exam.grade >= 24 ? 'good' : 'passing'}">
                                                    {exam.grade}
                                                </span>
                                            </td>
                                            <td class="text-center lode-cell">
                                                {#if exam.hasLode}
                                                    <i class="fas fa-crown lode-icon"></i>
                                                {:else}
                                                    <span class="no-lode">-</span>
                                                {/if}
                                            </td>
                                            <td class="text-center weight-cell">
                                                <span class="weight-value">{exam.grade * exam.cfu}</span>
                                            </td>
                                            <td class="text-center">
                                                <button
                                                        class="btn btn-delete"
                                                        onclick={() => removeExam(exam.id)}
                                                        aria-label="Rimuovi esame"
                                                >
                                                    <i class="fas fa-trash"></i>
                                                </button>
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

        <!-- Disclaimer -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="disclaimer-section text-center" data-aos="fade-up">
                    <small class="text-muted disclaimer-text">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        I calcoli e le proiezioni mostrate sono puramente indicativi e possono contenere errori.
                        Non si assumono responsabilità per eventuali inesattezze o differenze rispetto ai calcoli ufficiali
                        dell'ateneo.
                        Nessun genere di informazione sui dati inseriti viene salvata o condivisa, lo strumento funziona
                        totalmente sul dispositivo dell'utente finale.
                    </small>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .bg-dark {
        background-color: hsla(285, 100%, 10%, 0.40) !important;
    }
</style>