/**
 * Neon Grove — localStorage save helpers.
 * Safe to import during SSR (all access guarded).
 */

export const SAVE_KEY = 'neon-grove-save-v1';
export const SAVE_VERSION = 1;

/** @returns {boolean} */
export function storageAvailable() {
	try {
		return typeof localStorage !== 'undefined';
	} catch {
		return false;
	}
}

/**
 * Read and validate a save. Returns null when missing/invalid.
 * Never throws.
 */
export function readSave() {
	if (!storageAvailable()) return null;
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || typeof data !== 'object' || data.version !== SAVE_VERSION) return null;
		if (typeof data.levelIndex !== 'number' || data.levelIndex < 0 || data.levelIndex > 2)
			return null;
		return data;
	} catch {
		return null;
	}
}

/**
 * @param {Record<string, unknown>} data
 * @returns {boolean} true when persisted
 */
export function writeSave(data) {
	if (!storageAvailable()) return false;
	try {
		localStorage.setItem(
			SAVE_KEY,
			JSON.stringify({ ...data, version: SAVE_VERSION, timestamp: Date.now() })
		);
		return true;
	} catch {
		return false;
	}
}

export function clearSave() {
	if (!storageAvailable()) return;
	try {
		localStorage.removeItem(SAVE_KEY);
	} catch {
		/* ignore */
	}
}
