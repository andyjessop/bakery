import type { Middleware } from "./types";

export class Runner<S extends Record<string, any>> {
	middlewares: Middleware<S>[] = [];
	state: Partial<S> = {};

	constructor() {
		this.state = {};
	}

	use(middleware: Middleware<S>): void {
		this.middlewares.push(middleware);
	}

	command(name: string, flags: Record<string, string>): ReadableStream {
		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();

		(async () => {
			for (const middleware of this.middlewares) {
				await middleware({
					command: name,
					flags,
					writer,
					get: this.get.bind(this),
					set: this.set.bind(this),
				});
			}

			// We need to close the writer here so that the reader in the calling
			// function can finish reading the stream and the process can exit.
			await writer.close();
		})();

		return readable;
	}

	get<K extends keyof S>(key: K): S[K] {
		return this.state[key] as S[K];
	}

	set<K extends keyof S>(key: K, value: S[K]): void {
		this.state[key] = value;
	}
}
