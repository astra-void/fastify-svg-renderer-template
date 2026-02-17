import crypto from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { SvgCachePolicy } from "./endpoint";

function etagOf(content: string): string {
	return crypto.createHash("sha1").update(content).digest("hex");
}

function normalizeIfNoneMatch(v: unknown): string {
	if (!v) return "";
	const raw = Array.isArray(v) ? v[0] : v;
	return String(raw).replace(/^W\//, "").replaceAll('"', "");
}

function cacheControl(cache: SvgCachePolicy): string {
	return `public, max-age=0, s-maxage=${cache.sMaxAge}, stale-while-revalidate=${cache.staleWhileRevalidate}`;
}

export function setCors(reply: FastifyReply) {
	reply
		.header("Access-Control-Allow-Origin", "*")
		.header("Access-Control-Allow-Methods", "GET,OPTIONS")
		.header("Access-Control-Allow-Headers", "content-type, if-none-match");
}

export function sendSvg(
	req: FastifyRequest,
	reply: FastifyReply,
	svgXml: string,
	cache: SvgCachePolicy,
) {
	const etag = etagOf(svgXml);
	const inm = normalizeIfNoneMatch(req.headers["if-none-match"]);
	const cc = cacheControl(cache);

	setCors(reply);

	if (inm && inm === etag) {
		return reply
			.code(304)
			.header("ETag", `"${etag}"`)
			.header("Cache-Control", cc)
			.send();
	}

	return reply
		.type("image/svg+xml; charset=utf-8")
		.header("X-Content-Type-Options", "nosniff")
		.header("Cache-Control", cc)
		.header("ETag", `"${etag}"`)
		.send(svgXml);
}
