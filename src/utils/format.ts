export function formatCash(v: number | string | undefined) {
	if (v == null || v === "") return "0";

	if (typeof v === "number") return v.toLocaleString("ko-KR");

	const s = String(v).trim();
	const cleaned = s.replace(/,/g, "");

	const m = cleaned.match(/^([+-]?)(\d+)(\.\d+)?$/);
	if (!m) return s;

	const sign = m[1];
	const intPart = m[2].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	const fracPart = m[3] ?? "";

	return `${sign}${intPart}${fracPart}`;
}
