import { $, Glob } from "bun";
import path from "node:path";
import type { PackageInfo } from "../../types";

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
				details: packageInfo,
				files: [],
				path: path.dirname(packageJsonPath),
			});
		}
	}

	return packages;
}

async function toImports(path: string) {
	const content = await getFileContent(path);

	const transpiler = new Bun.Transpiler({
		loader: "tsx",
	});

	const result = transpiler.scan(content);

	return {
		content,
		path,
		imports: result.imports,
	};
}

async function getFileContent(path: string) {
	const file = Bun.file(path);
	return file.text();
}
