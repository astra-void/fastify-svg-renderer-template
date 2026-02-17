import type { FastifyInstance } from "fastify";
import type { RawQuery } from "../server/endpoint";
import { endpoints } from "../svg/endpoints";
import { asRawQuery, resolveSeed } from "../server/query";
import { renderSvgXml } from "../server/render";
import { sendSvg, setCors } from "../server/replySvg";

export function registerSvgRoutes(app: FastifyInstance) {
	app.options("/*", async (_req, reply) => {
		setCors(reply);
		return reply.code(204).send();
	});

	app.get("/healthz", async (_req, reply) => reply.code(200).send("ok"));

	app.get("/v1/manifest.json", async (_req, reply) => {
		return reply.code(200).send({
			endpoints: endpoints.map((e) => ({
				kind: e.kind,
				cache: e.cache,
				examples: e.examples ?? [],
			})),
		});
	});

	for (const e of endpoints) {
		app.get<{ Querystring: RawQuery }>(`/v1/svg/${e.kind}.svg`, async (req, reply) => {
			const raw = asRawQuery(req.query);
			const seed = resolveSeed(e.kind, raw);
			const parsed = e.parse(raw);
			const xml = renderSvgXml(
				e.render(parsed, { kind: e.kind, seed, now: new Date(), rawQuery: raw }),
			);
			return sendSvg(req, reply, xml, e.cache);
		});
	}
}
