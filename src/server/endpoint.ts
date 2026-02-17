import type { JSX } from "preact";

export type RawQueryValue = string | string[] | undefined;
export type RawQuery = Readonly<Record<string, RawQueryValue>>;

export type SvgCachePolicy = Readonly<{
	sMaxAge: number;
	staleWhileRevalidate: number;
}>;

export type SvgRenderContext = Readonly<{
	kind: string;
	seed: number;
	now: Date;
	rawQuery: RawQuery;
}>;

export type SvgEndpoint<K extends string, Q> = Readonly<{
	kind: K;
	cache: SvgCachePolicy;
	parse: (raw: RawQuery) => Q;
	render: (q: Q, ctx: SvgRenderContext) => JSX.Element;
	examples?: readonly string[];
}>;

export function defineSvgEndpoint<const K extends string, Q>(
	spec: SvgEndpoint<K, Q>,
): SvgEndpoint<K, Q> {
	return spec;
}
