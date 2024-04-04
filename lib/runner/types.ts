import type { Package } from "../types";

export interface Context<S extends Record<string, unknown>> {
	command: string;
	writer: ReturnType<WritableStream["getWriter"]>;
	get: <K extends keyof S>(key: K) => S[K];
	set: <K extends keyof S>(key: K, value: S[K]) => void;
}

// Updated Middleware type to accept a single parameter object
export type Middleware<S extends Record<string, unknown>> = (
	ctx: Context<S>,
) => Promise<void> | void;

export type TaskOutput = {
	script: string;
	package: Package;
	output: string;
	command: string;
};
