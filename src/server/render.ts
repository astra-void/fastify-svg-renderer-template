import type { JSX } from "preact";
import render from "preact-render-to-string";

export function renderSvgXml(node: JSX.Element): string {
	const markup = render(node);
	return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
}
