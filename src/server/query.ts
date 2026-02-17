import type { RawQuery, RawQueryValue } from "./endpoint";
import { clampInt, hashToSeed } from "../utils";

export function asRawQuery(q: unknown): RawQuery {
	if (!q || typeof q !== "object") return {};
	return q as Record<string, RawQueryValue>;
}

export function first(v: RawQueryValue): string {
	if (Array.isArray(v)) return String(v[0] ?? "");
	return String(v ?? "");
}

function safeDecode(s: string): string {
	const spaced = s.replace(/\+/g, " ");
	if (!spaced.includes("%")) return spaced;
	try {
		return decodeURIComponent(spaced);
	} catch {
		return spaced;
	}
}

export function qText(
	raw: RawQuery,
	key: string,
	opts: Readonly<{
		maxLen: number;
		fallback: string;
		decode?: boolean;
		underscoreToSpace?: boolean;
	}>,
): string {
	let s = first(raw[key]).trim();
	if (opts.decode ?? true) s = safeDecode(s);
	if (opts.underscoreToSpace ?? true) s = s.replace(/_/g, " ");
	s = s.trim();

	if (!s) return opts.fallback;
	return s.length > opts.maxLen ? s.slice(0, opts.maxLen) : s;
}

export function qInt(
	raw: RawQuery,
	key: string,
	opts: Readonly<{ min: number; max: number; fallback: number }>,
): number {
	return clampInt(raw[key], opts.min, opts.max, opts.fallback);
}

function serialize(v: RawQueryValue): string {
	if (Array.isArray(v)) return v.map((x) => String(x ?? "")).join(",");
	return String(v ?? "");
}

export function resolveSeed(kind: string, raw: RawQuery): number {
	const seedRaw = first(raw.seed).trim();

	if (seedRaw) {
		if (/^[+-]?\d+$/.test(seedRaw)) {
			const n = Number.parseInt(seedRaw, 10);
			if (Number.isFinite(n)) return n >>> 0;
		}
		return hashToSeed(seedRaw);
	}

	const serialized = Object.entries(raw)
		.filter(([k]) => k !== "seed")
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${serialize(v)}`)
		.join("&");

	return hashToSeed(`${kind}?${serialized}`);
}
