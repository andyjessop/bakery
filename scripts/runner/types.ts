export interface Context<S extends Record<string, any>> {
	command: string;
	flags: Record<string, string>;
	writer: ReturnType<WritableStream["getWriter"]>;
	get: <K extends keyof S>(key: K) => S[K];
	set: <K extends keyof S>(key: K, value: S[K]) => void;
}

// Updated Middleware type to accept a single parameter object
export type Middleware<S extends Record<string, any>> = (
	ctx: Context<S>,
) => Promise<void> | void;

export type TaskOutput = {
	script: string;
	package: string;
	output: string;
	command: string;
};
