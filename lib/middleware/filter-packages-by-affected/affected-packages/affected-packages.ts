import path from "node:path";
import type { FileInfo, PackageInfo } from "../../../types";
import type { Import } from "bun";

export { getAffectedPackages };

async function getFileDependencies(
	filePath: string,
	imports: Import[],
	repoPackages: PackageInfo[],
	vendorPackages: string[],
): Promise<string[]> {
	const dependencies: string[] = [];

	for (const imp of imports) {
		// Check if the import directly matches a package name
		const directPackage = repoPackages.find(
			(pkg) => pkg.details.name === imp.path,
		);
		if (directPackage) {
			dependencies.push(directPackage.details.name);
			continue;
		}

		// Check if the import path is a descendant of any package path
		const descendantPackage = repoPackages.find((pkg) =>
			path.resolve(filePath, imp.path).startsWith(pkg.path),
		);
		if (descendantPackage) {
			dependencies.push(descendantPackage.details.name);
			continue;
		}

		// Check if the import exists in the vendor packages
		if (vendorPackages.includes(imp.path)) {
			dependencies.push(imp.path);
		}
	}

	return dependencies;
}

async function buildPackageInfo(
	sourceFiles: FileInfo[],
	repoPackagesData: PackageInfo[],
	vendorPackages: string[],
) {
	const repoPackages = [...repoPackagesData];
	const filePackage: Map<string, string> = new Map();

	for (const p of repoPackages) {
		const src = sourceFiles.filter((file) =>
			file.path.startsWith(p.path + path.sep),
		);

		const depsSet = new Set<string>();

		for (const f of src) {
			filePackage.set(f.path, p.details.name);

			p.files.push(f);

			for (const dep of await getFileDependencies(
				f.path,
				f.imports,
				repoPackages,
				vendorPackages,
			)) {
				depsSet.add(dep);
			}
		}

		p.deps = Array.from(depsSet);
	}

	return {
		repoPackages,
		filePackage,
	};
}

async function getAffectedPackages(
	sourceFiles: FileInfo[],
	repoPackagesData: PackageInfo[],
	vendorPackages: string[],
): Promise<PackageInfo[]> {
	const affectedPackageNames = new Set<string>();
	const { repoPackages, filePackage } = await buildPackageInfo(
		sourceFiles,
		repoPackagesData,
		vendorPackages,
	);

	// Find packages directly containing the files
	for (const file of sourceFiles) {
		const packageName = filePackage.get(file.path);

		if (packageName) {
			affectedPackageNames.add(packageName);
		}
	}

	// Find packages that depend on the affected packages recursively
	const visitedPackages = new Set<string>();
	const queue = Array.from(affectedPackageNames);

	while (queue.length > 0) {
		const packageName = queue.shift();
		if (!packageName) {
			continue;
		}

		if (visitedPackages.has(packageName)) {
			continue;
		}

		visitedPackages.add(packageName);

		for (const pkg of repoPackages) {
			if (pkg.deps.includes(packageName)) {
				affectedPackageNames.add(pkg.details.name);
				queue.push(pkg.details.name);
			}
		}
	}

	// Return the affected packages as PackageInfo[]
	return repoPackages.filter((pkg) =>
		affectedPackageNames.has(pkg.details.name),
	);
}
