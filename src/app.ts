import Fastify from "fastify";
import { registerSvgRoutes } from "./routes/svg";

export function buildApp() {
	const app = Fastify({
		logger: process.env.NODE_ENV !== "production",
	});

	registerSvgRoutes(app);
	return app;
}