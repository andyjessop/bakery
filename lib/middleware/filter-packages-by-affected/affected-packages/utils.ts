import { $, Glob } from "bun";
import path from "node:path";
import type { Package, PackageInfo } from "../../../types";

export async function getSourceFilesAtCommit(sha?: string): Promise<string[]> {
	const { stdout } = await $`git ls-tree -r $(git rev-parse ${
		sha || "HEAD"
	}) --name-only`.quiet();

	return stdout.toString().split("\n");
}

export async function getPackages(rootDir: string): Promise<PackageInfo[]> {
	const packages: PackageInfo[] = [];

	// Get root package details
	const { stdout: rootPackageJson } = await $`cat ${path.join(
		rootDir,
		"package.json",
	)}`.quiet();

	const rootPackageInfo = JSON.parse(rootPackageJson.toString());

	// Get workspace package details
	const workspaces = rootPackageInfo.workspaces || [];

	for (const workspace of workspaces) {
		const globInstance = new Glob(`${workspace}/package.json`);
		const packageJsonPaths = await Array.fromAsync(globInstance.scan(rootDir));

		for (const packageJsonPath of packageJsonPaths) {
			const { stdout: packageJsonContent } =
				await $`cat ${packageJsonPath}`.quiet();

			const packageInfo = JSON.parse(packageJsonContent.toString()) as Package;

			packages.push({
				deps: [],
				files: [],
				details: packageInfo,
				path: path.dirname(packageJsonPath),
			});
		}
	}

	return packages;
}
