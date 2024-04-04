import type { PackageDetails, PackageInfo } from "../../types";
import { readdir } from "node:fs/promises";
import { Resolver } from "../../resolver/Resolver";

export async function getPackageInfo(
	rootPath: string,
	filtered: PackageDetails[],
): Promise<PackageInfo[]> {
	const resolver = await Resolver.create(rootPath);
	const packages = new Map<string, PackageInfo>();

	async function processPackage(packageDetails: PackageDetails) {
		const packagePath = packageDetails.path;

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
					const importPackagePath = resolver.resolveImportPath(
						importItem.path,
						filePath,
					);

					console.log(importItem, importPackagePath);

					if (importPackagePath) {
						const importPackageDetails = resolver.getPackage(importPackagePath);
						if (importPackageDetails) {
							await processPackage({
								details: importPackageDetails,
								path: importPackagePath,
							});
						}
					}
				}
			}
		}
	}

	for (const packageDetails of filtered) {
		await processPackage(packageDetails);
	}

	return Array.from(packages.values());
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
