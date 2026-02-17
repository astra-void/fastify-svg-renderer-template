import { h } from "preact";
import { defineSvgEndpoint, type RawQuery } from "../../server/endpoint";
import { qInt, qText } from "../../server/query";
import { ExampleSvg } from "../components/ExampleSvg";

export type ExampleParams = Readonly<{
	title: string;
	value: number;
	width: number;
	height: number;
}>;

export const exampleEndpoint = defineSvgEndpoint({
	kind: "example",
	cache: { sMaxAge: 60, staleWhileRevalidate: 60 },

	parse: (raw: RawQuery): ExampleParams => ({
		title: qText(raw, "title", { maxLen: 24, fallback: "Example" }),
		value: qInt(raw, "value", { min: 0, max: 9999, fallback: 404 }),
		width: qInt(raw, "w", { min: 200, max: 1200, fallback: 420 }),
		height: qInt(raw, "h", { min: 120, max: 800, fallback: 160 }),
	}),

	render: (q) =>
		h(ExampleSvg, { 
			title: q.title,
			value: q.value,
			width: q.width,
			height: q.height,
		}),

	examples: [
		"/v1/svg/example.svg?title=Hello&value=123&w=420&h=160",
	],
});
