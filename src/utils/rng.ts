const UINT32_MAX = 0x100000000;

export function hashToSeed(input: string): number {
	let hash = 2166136261;

	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}

export function createRng(seed: number): () => number {
	let state = seed >>> 0 || 1;

	return () => {
		state = Math.imul(state ^ (state >>> 15), 1 | state);
		state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
		return ((state ^ (state >>> 14)) >>> 0) / UINT32_MAX;
	};
}

export function randRange(rng: () => number, min: number, max: number): number {
	return min + (max - min) * rng();
}
