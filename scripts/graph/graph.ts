import path from "node:path";
import type { PackageInfo } from "./types";

export class Graph {
	#repoPackages: PackageInfo[] = [];
	#filePackage: Map<string, string> = new Map();
	#vendorPackages: string[] = [];

	async build(
		sourceFiles: string[],
		repoPackages: PackageInfo[],
		vendorPackages: string[],
	) {
		this.#repoPackages = repoPackages;
		this.#vendorPackages = vendorPackages;

		for (const p of this.#repoPackages) {
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

	getAffectedPackages(filenames: string[]): PackageInfo[] {
		const affectedPackageNames = new Set<string>();

		// Find packages directly containing the files
		for (const filename of filenames) {
			const packageName = this.#filePackage.get(filename);
			if (packageName) {
				affectedPackageNames.add(packageName);
			}
		}

		// Find packages that depend on the affected packages recursively
		const visitedPackages = new Set<string>();
		const queue = Array.from(affectedPackageNames);

		while (queue.length > 0) {
			const packageName = queue.shift()!;
			if (visitedPackages.has(packageName)) {
				continue;
			}
			visitedPackages.add(packageName);

			for (const pkg of this.#repoPackages) {
				if (pkg.deps.includes(packageName)) {
					affectedPackageNames.add(pkg.name);
					queue.push(pkg.name);
				}
			}
		}

		// Return the affected packages as PackageInfo[]
		return this.#repoPackages.filter((pkg) =>
			affectedPackageNames.has(pkg.name),
		);
	}

	getPackages() {
		return this.#repoPackages;
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
			const directPackage = this.#repoPackages.find(
				(pkg) => pkg.name === imp.path,
			);
			if (directPackage) {
				dependencies.push(directPackage.name);
				continue;
			}

			// Check if the import path is a descendant of any package path
			const descendantPackage = this.#repoPackages.find((pkg) =>
				path.resolve(filename, imp.path).startsWith(pkg.path),
			);
			if (descendantPackage) {
				dependencies.push(descendantPackage.name);
				continue;
			}

			// Check if the import exists in the vendor packages
			if (this.#vendorPackages.includes(imp.path)) {
				dependencies.push(imp.path);
			}
		}

		return dependencies;
	}
}
