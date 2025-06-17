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

<div class="container-xxl mt-4 mt-md-5">
    <div class="row justify-content-center">
        <div class="col-12">
            <div class="text-center mb-5" data-aos="fade-up">
                <h1 class="university-title mb-3">
                    <i class="fas fa-graduation-cap me-3"></i>
                    Simulatore Laurea Università
                </h1>
                <p class="text-muted lead">
                    Calcola la tua media ponderata e simula il voto di laurea finale
                </p>
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
                                <i class="fas fa-book me-2"></i>Nome Esame
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
</div>

<style>
    .university-title {
        background: linear-gradient(45deg, #d34cff, #ff2b2b);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: lights 3s ease-in-out infinite;
        font-size: 2.5rem;
        font-weight: bold;
    }

    .text-accent {
        color: #d34cff !important;
    }

    .border-custom {
        border: 1px solid rgba(211, 76, 255, 0.3) !important;
    }

    .form-control-custom {
        background-color: rgba(31, 0, 46, 0.8) !important;
        border: 1px solid rgba(211, 76, 255, 0.3) !important;
        color: #fff !important;
        transition: all 0.3s ease;
    }

    .form-control-custom:focus {
        background-color: rgba(31, 0, 46, 0.9) !important;
        border-color: #d34cff !important;
        box-shadow: 0 0 0 0.2rem rgba(211, 76, 255, 0.25) !important;
        color: #fff !important;
    }

    .form-control-custom::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }

    .btn-custom {
        background: linear-gradient(45deg, #d34cff, #ff2b2b);
        border: none;
        color: white;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(211, 76, 255, 0.3);
    }

    .btn-custom:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(211, 76, 255, 0.4);
        filter: brightness(1.1);
    }

    .btn-custom:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .stat-card {
        background: rgba(31, 0, 46, 0.6);
        border: 1px solid rgba(211, 76, 255, 0.2);
        border-radius: 12px;
        padding: 1rem;
        transition: all 0.3s ease;
    }

    .stat-card:hover {
        border-color: rgba(211, 76, 255, 0.5);
        box-shadow: 0 4px 15px rgba(211, 76, 255, 0.2);
    }

    .stat-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #fff;
    }

    .stat-label {
        font-size: 0.9rem;
        color: #d34cff;
        font-weight: 600;
        margin-top: 0.25rem;
    }

    .projection-title {
        color: #d34cff;
        font-weight: bold;
        font-size: 1.25rem;
        text-shadow: 0 0 10px rgba(211, 76, 255, 0.3);
    }

    .projection-section {
        padding: 1.5rem;
        background: rgba(31, 0, 46, 0.3);
        border-radius: 15px;
        border: 1px solid rgba(211, 76, 255, 0.2);
    }

    .current-score-card {
        background: linear-gradient(135deg, rgba(211, 76, 255, 0.1), rgba(255, 43, 43, 0.1));
        border: 2px solid rgba(211, 76, 255, 0.4);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .current-score-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shimmer 3s infinite;
    }

    .score-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        color: #d34cff;
        font-weight: 600;
    }

    .score-label {
        font-size: 1.1rem;
    }

    .score-value {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .current-score {
        color: #fff;
        text-shadow: 0 0 15px rgba(211, 76, 255, 0.8);
    }

    .score-max {
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.7);
    }

    .score-details {
        margin-top: 0.5rem;
    }

    .scenarios-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }

    .scenario-card {
        background: rgba(31, 0, 46, 0.5);
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        transition: all 0.3s ease;
        position: relative;
    }

    .best-scenario {
        border: 2px solid rgba(34, 197, 94, 0.5);
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(31, 0, 46, 0.5));
    }

    .best-scenario:hover {
        border-color: rgba(34, 197, 94, 0.8);
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.2);
        transform: translateY(-2px);
    }

    .worst-scenario {
        border: 2px solid rgba(239, 68, 68, 0.5);
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(31, 0, 46, 0.5));
    }

    .worst-scenario:hover {
        border-color: rgba(239, 68, 68, 0.8);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
        transform: translateY(-2px);
    }

    .scenario-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        font-weight: 600;
    }

    .best-scenario .scenario-header {
        color: #22c55e;
    }

    .worst-scenario .scenario-header {
        color: #ef4444;
    }

    .scenario-score {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .best-score {
        color: #22c55e;
        text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
    }

    .worst-score {
        color: #ef4444;
        text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }

    .scenario-details {
        margin-top: 0.5rem;
        color: rgba(255, 255, 255, 0.7);
    }

    .exams-table {
        --bs-table-bg: transparent;
        border-collapse: separate;
        border-spacing: 0;
    }

    .table-header th {
        background: linear-gradient(135deg, rgba(211, 76, 255, 0.2), rgba(255, 43, 43, 0.2));
        border: none;
        padding: 1rem 0.75rem;
        font-weight: 600;
        text-shadow: 0 0 8px rgba(211, 76, 255, 0.5);
        position: relative;
    }

    .table-header th::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #d34cff, #ff2b2b);
    }

    .exam-name-col {
        border-top-left-radius: 12px;
    }

    .actions-col {
        border-top-right-radius: 12px;
    }

    .exam-row {
        transition: all 0.3s ease;
        background: rgba(31, 0, 46, 0.3);
    }

    .exam-row:hover {
        background: rgba(211, 76, 255, 0.1) !important;
        transform: scale(1.01);
    }

    .exam-row td {
        border: none;
        padding: 1rem 0.75rem;
        vertical-align: middle;
    }

    .exam-name {
        color: #fff;
        font-size: 1rem;
    }

    .cfu-badge {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        border: 1px solid rgba(59, 130, 246, 0.5);
    }

    .grade-badge {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-weight: bold;
        font-size: 0.9rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        border: 1px solid;
    }

    .grade-excellent {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        border-color: rgba(34, 197, 94, 0.5);
        box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
    }

    .grade-good {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        border-color: rgba(245, 158, 11, 0.5);
        box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
    }

    .grade-passing {
        background: linear-gradient(135deg, #6b7280, #4b5563);
        color: white;
        border-color: rgba(107, 114, 128, 0.5);
        box-shadow: 0 4px 10px rgba(107, 114, 128, 0.3);
    }

    .lode-cell {
        padding: 1rem !important;
    }

    .lode-icon {
        color: #fbbf24;
        font-size: 1.2rem;
        filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
        animation: pulse-gold 2s infinite;
    }

    .no-lode {
        color: rgba(255, 255, 255, 0.3);
        font-size: 1.1rem;
    }

    .weight-cell {
        font-family: 'Courier New', monospace;
    }

    .weight-value {
        background: rgba(211, 76, 255, 0.2);
        color: #d34cff;
        padding: 0.4rem 0.6rem;
        border-radius: 6px;
        font-weight: 600;
        border: 1px solid rgba(211, 76, 255, 0.3);
    }

    .btn-delete {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
    }

    .btn-delete:hover {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
    }

    @keyframes shimmer {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    @keyframes pulse-gold {
        0%, 100% {
            filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
            transform: scale(1);
        }
        50% {
            filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.9));
            transform: scale(1.1);
        }
    }

    @media (max-width: 768px) {
        .scenarios-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .scenario-score,
        .score-value {
            font-size: 1.8rem;
        }

        .projection-section {
            padding: 1rem;
        }

        .current-score-card {
            padding: 1rem;
        }

        .exams-table {
            font-size: 0.875rem;
        }

        .table-header th {
            padding: 0.75rem 0.5rem;
        }

        .exam-row td {
            padding: 0.75rem 0.5rem;
        }
    }

    .exam-row {
        transition: all 0.3s ease;
    }

    .exam-row:hover {
        background-color: rgba(211, 76, 255, 0.1) !important;
    }

    .table-dark {
        --bs-table-bg: transparent;
    }

    .form-check-input:checked {
        background-color: #d34cff;
        border-color: #d34cff;
    }

    .form-check-input:focus {
        box-shadow: 0 0 0 0.25rem rgba(211, 76, 255, 0.25);
    }

    @keyframes lights {
        0% {
            color: hsl(230, 40%, 80%);
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.2),
            0 0 0.125em hsla(320, 100%, 60%, 0.3),
            -1em -0.125em 0.5em hsla(40, 100%, 60%, 0),
            1em 0.125em 0.5em hsla(200, 100%, 60%, 0);
        }
        30% {
            color: hsl(230, 80%, 90%);
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 60%, 0.5),
            -0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2),
            0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4);
        }
        40% {
            color: hsl(230, 100%, 95%);
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 90%, 0.5),
            -0.25em -0.125em 0.125em hsla(40, 100%, 60%, 0.2),
            0.25em 0.125em 0.125em hsla(200, 100%, 60%, 0.4);
        }
        70% {
            color: hsl(230, 80%, 90%);
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.5),
            0 0 0.125em hsla(320, 100%, 60%, 0.5),
            0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2),
            -0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4);
        }
        100% {
            color: hsl(230, 40%, 80%);
            text-shadow: 0 0 1em hsla(320, 100%, 50%, 0.2),
            0 0 0.125em hsla(320, 100%, 60%, 0.3),
            1em -0.125em 0.5em hsla(40, 100%, 60%, 0),
            -1em 0.125em 0.5em hsla(200, 100%, 60%, 0);
        }
    }

    @media (max-width: 768px) {
        .university-title {
            font-size: 2rem;
        }

        .stat-value {
            font-size: 1.5rem;
        }

        .table-responsive {
            font-size: 0.875rem;
        }
    }
</style>
