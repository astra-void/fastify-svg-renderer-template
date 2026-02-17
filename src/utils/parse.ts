import { clampInt } from "./clamp";

export interface ReceiptItem {
	name: string;
	qty: number;
	price: number;
}

export type ParseReceiptItemsOptions = {
	itemSeparator?: RegExp;
	fieldSeparator?: RegExp;
	maxItems?: number;
	allowJson?: boolean;
};

function safeDecodeAll(text: string): string {
	const spaced = text.replace(/\+/g, " ");
	if (!text.includes("%") && !text.includes("+")) return text;
	try {
		return decodeURIComponent(spaced);
	} catch {
		return spaced;
	}
}

function stripOuterQuotes(s: string): string {
	const t = s.trim();
	if (
		(t.startsWith('"') && t.endsWith('"')) ||
		(t.startsWith("'") && t.endsWith("'"))
	) {
		return t.slice(1, -1).trim();
	}
	return t;
}

function readIntToken(
	v: unknown,
	min: number,
	max: number,
	fallback: number,
): number {
	if (v === undefined || v === null) return fallback;

	const s = String(v).trim();

	const normalized = s.replace(/[,_\s]/g, "");

	const m = normalized.match(/[+-]?\d+/);
	if (!m) return fallback;

	return clampInt(m[0], min, max, fallback);
}

function isOnlySeparators(text: string): boolean {
	// item/field 구분자와 공백만 있는지 체크(대충)
	return /^[\s|/,\n;\r\t]+$/.test(text);
}

function coerceItemLike(x: unknown): ReceiptItem | null {
	if (!x || typeof x !== "object") return null;

	const obj = x as Record<string, unknown>;
	const name = typeof obj.name === "string" ? obj.name.trim() : "";
	if (!name) return null;

	const qty = readIntToken(obj.qty ?? 1, 1, 9999, 1);
	const price = readIntToken(obj.price ?? 0, -1_000_000_000, 1_000_000_000, 0);

	return { name, qty, price };
}

export function parseReceiptItems(
	input: unknown,
	opts: ParseReceiptItemsOptions = {},
): ReceiptItem[] {
	const {
		itemSeparator = /[|/\n]+/,
		fieldSeparator = /[,;]+/,
		maxItems = 200,
		allowJson = true,
	} = opts;

	if (input == null) return [];

	if (Array.isArray(input)) {
		return input
			.map(coerceItemLike)
			.filter((x): x is ReceiptItem => x !== null)
			.slice(0, maxItems);
	}

	let text = safeDecodeAll(String(input)).trim();
	if (!text) return [];
	if (isOnlySeparators(text)) return [];

	if (allowJson) {
		const first = text[0];
		if (first === "[" || first === "{") {
			try {
				const parsed = JSON.parse(text);

				if (Array.isArray(parsed)) {
					const arr = parsed
						.map(coerceItemLike)
						.filter((x): x is ReceiptItem => x !== null);
					if (arr.length) return arr.slice(0, maxItems);
				} else {
					const maybeItems = parsed?.items;
					if (Array.isArray(maybeItems)) {
						const arr = maybeItems
							.map(coerceItemLike)
							.filter((x): x is ReceiptItem => x !== null);
						if (arr.length) return arr.slice(0, maxItems);
					}
				}
			} catch {}
		}
	}
	text = stripOuterQuotes(text);
	if (text.startsWith("[") && text.endsWith("]")) {
		text = text.slice(1, -1).trim();
	}
	if (!text || isOnlySeparators(text)) return [];

	const rawItems = text
		.split(itemSeparator)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	const items: ReceiptItem[] = [];

	for (const raw of rawItems) {
		if (items.length >= maxItems) break;

		const parts = raw
			.split(fieldSeparator)
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		if (!parts.length) continue;

		let nameParts = parts;
		let qty = 1;
		let price = 0;

		if (parts.length >= 3) {
			const maybeQty = readIntToken(parts[parts.length - 2], 1, 9999, NaN);
			const maybePrice = readIntToken(
				parts[parts.length - 1],
				-1_000_000_000,
				1_000_000_000,
				NaN,
			);

			const qtyOk = Number.isFinite(maybeQty);
			const priceOk = Number.isFinite(maybePrice);

			if (qtyOk && priceOk) {
				qty = maybeQty;
				price = maybePrice;
				nameParts = parts.slice(0, -2);
			} else {
				const maybePrice2 = readIntToken(
					parts[parts.length - 1],
					-1_000_000_000,
					1_000_000_000,
					NaN,
				);
				if (Number.isFinite(maybePrice2)) {
					price = maybePrice2;
					nameParts = parts.slice(0, -1);
				}
			}
		} else if (parts.length === 2) {
			price = readIntToken(parts[1], -1_000_000_000, 1_000_000_000, 0);
			nameParts = [parts[0]];
		}

		const name = stripOuterQuotes(nameParts.join(", ")).trim();
		if (!name) continue;

		items.push({ name, qty, price });
	}

	if (items.length === 0) {
		const fallbackName = stripOuterQuotes(text).trim();
		if (fallbackName && !isOnlySeparators(fallbackName)) {
			return [{ name: fallbackName, qty: 1, price: 0 }];
		}
	}

	return items;
}
