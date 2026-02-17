export function clampInt(
	v: unknown,
	min: number,
	max: number,
	fallback: number,
) {
	const n = Number.parseInt(String(v ?? ""), 10);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, n));
}

export function clamp100(v: unknown, fallback: number) {
	return clampInt(v, 0, 100, fallback);
}
