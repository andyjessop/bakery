import { $, Glob } from "bun";
import type { PackageInfo } from "../graph/types";
import path from "node:path";

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

			const packageInfo = JSON.parse(packageJsonContent.toString());

			packages.push({
				deps: [],
				files: [],
				name: packageInfo.name,
				path: path.dirname(packageJsonPath),
			});
		}
	}

	return packages;
}
