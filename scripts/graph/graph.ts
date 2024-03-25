import path from "node:path";
import type { PackageInfo } from "./types";

export class Graph {
	#packages: PackageInfo[] = [];
	#filePackage: Map<string, string> = new Map();

	async build(
		rootDir: string,
		sourceFiles: string[],
		getPackages: (rootDir: string) => Promise<PackageInfo[]>,
	) {
		this.#packages = await getPackages(rootDir);

		for (const p of this.#packages) {
			const src = sourceFiles.filter((file) => file.startsWith(p.path));
			p.files = [];
			const depsSet = new Set<string>();

			for (const f of src) {
				this.#filePackage.set(f, p.name);

				const file = Bun.file(f);
				const { type } = file;

				if (type && type.startsWith("text/")) {
					const content = await file.text();

					p.files.push({
						filename: f,
						content,
					});

					for (const dep of await this.#getFileDependencies(f, content)) {
						depsSet.add(dep);
					}
				}
			}

			p.deps = Array.from(depsSet);
		}
	}

	getAffectedPackages(filenames: string[]): string[] {
		const affectedPackages = new Set<string>();

		// Find packages directly containing the files
		for (const filename of filenames) {
			const packageName = this.#filePackage.get(filename);
			if (packageName) {
				affectedPackages.add(packageName);
			}
		}

		// Find packages that depend on the affected packages recursively
		const visitedPackages = new Set<string>();
		const queue = Array.from(affectedPackages);

		while (queue.length > 0) {
			const packageName = queue.shift()!;
			if (visitedPackages.has(packageName)) {
				continue;
			}
			visitedPackages.add(packageName);

			for (const pkg of this.#packages) {
				if (pkg.deps.includes(packageName)) {
					affectedPackages.add(pkg.name);
					queue.push(pkg.name);
				}
			}
		}

		return Array.from(affectedPackages);
	}

	getPackages() {
		return this.#packages;
	}

	async #getFileDependencies(
		filename: string,
		content: string,
	): Promise<string[]> {
		const transpiler = new Bun.Transpiler({
			loader: "tsx",
		});

		const result = transpiler.scan(content);
		const dependencies: string[] = [];

		for (const imp of result.imports) {
			// Check if the import directly matches a package name
			const directPackage = this.#packages.find((pkg) => pkg.name === imp.path);
			if (directPackage) {
				dependencies.push(directPackage.name);
				continue;
			}

			// Check if the import path is a descendant of any package path
			const descendantPackage = this.#packages.find((pkg) =>
				path.resolve(filename, imp.path).startsWith(pkg.path),
			);
			if (descendantPackage) {
				dependencies.push(descendantPackage.name);
			}
		}
		return dependencies;
	}
}
