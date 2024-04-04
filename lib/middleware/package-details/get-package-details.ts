import { $, Glob } from "bun";
import path from "node:path";
import type { PackageDetails } from "../../types";

export async function getPackageDetails(
	rootDir: string,
): Promise<PackageDetails[]> {
	const packages: PackageDetails[] = [];

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
				details: packageInfo,
				path: path.dirname(packageJsonPath),
			});
		}
	}

	return packages;
}
