import { readFile, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import type { PackageJson } from "../types";
import { Glob } from "bun";

export class Resolver {
	private readonly rootPath: string;
	private readonly packagesByPath: Map<string, PackageJson>;
	private readonly packagesByName: Map<string, string>;

	private constructor(rootPath: string) {
		this.rootPath = rootPath;
		this.packagesByPath = new Map();
		this.packagesByName = new Map();
	}

	public static async create(rootPath: string): Promise<Resolver> {
		const resolver = new Resolver(rootPath);
		await resolver.buildPackageDetails();
		return resolver;
	}

	private async buildPackageDetails(): Promise<void> {
		const rootPackageJsonPath = join(this.rootPath, "package.json");
		const rootPackageJson = await this.readPackageJson(rootPackageJsonPath);

		const workspaces = rootPackageJson.workspaces || [];
		const packagePaths: string[] = [];

		for (const workspace of workspaces) {
			const globInstance = new Glob(`${workspace}/package.json`);
			const packageJsonPaths = await Array.fromAsync(
				globInstance.scan(this.rootPath),
			);

			for (const packageJsonPath of packageJsonPaths) {
				try {
					const packageJsonStat = await stat(packageJsonPath);
					if (packageJsonStat.isFile()) {
						packagePaths.push(packageJsonPath);
					}
				} catch (error) {
					// Ignore if package.json doesn't exist
				}
			}
		}

		for (const packagePath of packagePaths) {
			const packageJson = await this.readPackageJson(packagePath);
			const directoryPath = dirname(join(this.rootPath, packagePath));
			this.packagesByPath.set(directoryPath, packageJson);
			this.packagesByName.set(packageJson.name, packagePath);
		}
	}

	private async readPackageJson(packageJsonPath: string): Promise<PackageJson> {
		const content = await readFile(packageJsonPath, "utf8");
		return JSON.parse(content);
	}

	public getPackage(packagePath: string): PackageJson | undefined {
		return this.packagesByPath.get(packagePath);
	}

	public getPackagePath(packageName: string): string | undefined {
		return this.packagesByName.get(packageName);
	}

	public resolveImportPath(
		importPath: string,
		importingFilePath: string,
	): string | undefined {
		if (importPath.startsWith(".")) {
			const importingPackagePath = this.getPackagePathFromFilePath(
				join(dirname(importingFilePath), importPath),
			);

			return importingPackagePath;
		}

		const packagePath = this.getPackagePathFromFilePath(importingFilePath);
		if (!packagePath) {
			return undefined;
		}

		const importingPackage = this.getPackage(packagePath);
		if (!importingPackage) {
			return undefined;
		}

		const packagePathFromRoot = this.getPackagePath(importingPackage.name);
		if (!packagePathFromRoot) {
			return undefined;
		}
	}

	private getPackagePathFromFilePath(filePath: string): string | undefined {
		const relativePath = relative(this.rootPath, filePath);
		const segments = relativePath.split(/[\\/]/);

		for (let i = segments.length; i > 0; i--) {
			const packagePath = join(this.rootPath, ...segments.slice(0, i));
			if (this.packagesByPath.has(packagePath)) {
				return packagePath;
			}
		}

		return undefined;
	}
}
