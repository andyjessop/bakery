import type { Import } from "bun";
import type { PackageDetails, PackageInfo } from "../../types";
import { readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

export async function getPackageInfo(
	all: PackageDetails[],
	filtered: PackageDetails[],
): Promise<PackageInfo[]> {
	const packages = new Map<string, PackageInfo>();
	const packagesByPath = new Map<string, PackageDetails>(
		all.map((p) => [p.path, p]),
	);
	const packagesByName = new Map<string, PackageDetails>(
		all.map((p) => [p.details.name, p]),
	);

	async function processPackage(packageDetails: PackageDetails) {
		const packagePath = packageDetails.path; // path relative to cwd (root of the project)

		if (!packages.has(packagePath)) {
			packages.set(packagePath, {
				...packageDetails,
				files: [],
			});
		}

		const packageInfo = packages.get(packagePath)!;

		const files = await readdir(packagePath, {
			recursive: true,
		});

		for (const file of files) {
			if (file.endsWith(".ts") || file.endsWith(".tsx")) {
				const filePath = `${packagePath}/${file}`;
				const fileInfo = await toImports(filePath);
				packageInfo.files.push(fileInfo);

				for (const importItem of fileInfo.imports) {
					const importPackagePath = getPackagePathFromImport(
						importItem,
						filePath,
					);

					if (importPackagePath && packagesByPath.has(importPackagePath)) {
						const importPackageDetails = packagesByPath.get(importPackagePath)!;
						await processPackage(importPackageDetails);
					}
				}
			}
		}
	}

	for (const packageDetails of filtered) {
		await processPackage(packageDetails);
	}

	return Array.from(packages.values());

	function getPackagePathFromImport(
		importItem: Import,
		importingFilePath: string,
	): string | undefined {
		const importedPath = importItem.path;
		const importingDir = dirname(importingFilePath);

		// Resolve the imported path relative to the importing file
		const resolvedPath = join(importingDir, importedPath);

		// Find the package that matches the resolved path
		for (const [packagePath, packageDetails] of packagesByPath.entries()) {
			const relativePathToPackage = relative(packagePath, resolvedPath);

			// Check if the resolved path is within the package directory
			if (
				!relativePathToPackage.startsWith("..") &&
				!relativePathToPackage.startsWith(".")
			) {
				return packagePath;
			}
		}

		return undefined;
	}
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
