import { exampleEndpoint } from "./example";

export const endpoints = [exampleEndpoint] as const;
export type SvgKind = (typeof endpoints)[number]["kind"];
