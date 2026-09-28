/**
 * Instant, offline freshness guard for the baked energy history.
 *
 * Runs on every `bun run build` (including Cloudflare Pages): reads the
 * committed static/data/energy-history.json and warns when it is missing,
 * empty or older than STALE_AFTER_DAYS, reminding the author to refresh it
 * locally with `bun run data:energy` and commit the result.
 *
 * Deliberately network-free (milliseconds) and exit-0-always: it must never
 * slow down or fail a deploy build.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BAKED = join(ROOT, 'static', 'data', 'energy-history.json');
const STALE_AFTER_DAYS = 14;

try {
	const json = JSON.parse(await readFile(BAKED, 'utf8'));
	const days = Array.isArray(json.days) ? json.days : [];
	const last = days.length > 0 ? days[days.length - 1].date : null;
	const generatedAt = typeof json.generatedAt === 'string' ? json.generatedAt : '';
	const ageDays = generatedAt ? (Date.now() - new Date(generatedAt).getTime()) / 86400000 : Infinity;
	if (days.length === 0 || !last) {
		console.warn(
			'[energy-history] baked file is missing or empty — run `bun run data:energy` locally and commit static/data/energy-history.json.'
		);
	} else if (ageDays > STALE_AFTER_DAYS) {
		console.warn(
			`[energy-history] baked history ends at ${last} (baked ${generatedAt.slice(0, 10)}): refresh locally with \`bun run data:energy\` and commit the result.`
		);
	} else {
		console.log(`[energy-history] baked history ok: ${days.length} days through ${last}.`);
	}
} catch {
	console.warn(
		'[energy-history] no baked file found — run `bun run data:energy` locally and commit static/data/energy-history.json.'
	);
}
