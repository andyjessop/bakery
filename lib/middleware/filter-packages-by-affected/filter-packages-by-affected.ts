import type { CommandContext } from "../../command/types";
import { getAffectedPackages } from "./affected-packages/affected-packages";
import { getAffectedRepoFiles } from "./affected-repo-files/get-affected-repo-files";
import { getAffectedVendorPackages } from "./affected-vendor-packages/get-affected-vendor-packages";

export async function filterPackagesByAffected(ctx: CommandContext) {
	const { get, set } = ctx;

	const { baseSha, headSha } = get("gitDetails");
	const repoPackages = get("packages");

	const modifiedFilePromises = (
		await getAffectedRepoFiles(baseSha, headSha)
	).map(toImports);

	const modifiedFiles = await Promise.all(modifiedFilePromises);
	const vendorPackages = await getAffectedVendorPackages(baseSha, headSha);

	const affectedPackages = await getAffectedPackages(
		modifiedFiles,
		repoPackages,
		vendorPackages,
	);

	set("packages", affectedPackages);
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
