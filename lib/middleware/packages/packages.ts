import type { CommandContext } from "../../command/types";
import type { PackageInfo } from "../../types";
import { getPackages } from "./get-packages";
import { readdir } from "node:fs/promises";

export async function packages(ctx: CommandContext) {
	const { set } = ctx;

	const packages = await getPackages(process.cwd());
	await populateFileDetails(packages);

	set("packages", packages);
}

async function populateFileDetails(packages: PackageInfo[]) {
	for (const packageInfo of packages) {
		const packagePath = packageInfo.path;

		const files = await readdir(packagePath, {
			recursive: true,
		});

		for (const file of files) {
			if (file.endsWith(".ts") || file.endsWith(".tsx")) {
				const filePath = `${packagePath}/${file}`;
				const fileInfo = await toImports(filePath);
				packageInfo.files.push(fileInfo);
			}
		}
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
