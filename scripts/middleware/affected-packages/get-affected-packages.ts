import { $ } from "bun";
import { getAffectedRepoFiles } from "./affected-repo-files/get-affected-repo-files";
import { getAffectedVendorPackages } from "./affected-vendor-packages/get-affected-vendor-packages";
import { Graph } from "../../graph/graph";
import { getPackages } from "../../graph/utils";

export async function getAffectedPackages(
	baseBranchOrSha: string,
	headBranchOrSha: string,
) {
	const graph = new Graph();

	const { stdout: baseShaStdOut } =
		await $`git rev-parse ${baseBranchOrSha}`.quiet();
	const baseSha = baseShaStdOut.toString().trim();

	const { stdout: headShaStdOut } =
		await $`git rev-parse ${headBranchOrSha}`.quiet();
	const headSha = headShaStdOut.toString().trim();

	const modifiedFiles = await getAffectedRepoFiles(baseSha, headSha);
	const vendorPackages = await getAffectedVendorPackages(baseSha, headSha);

	const repoPackages = await getPackages(process.cwd());

	await graph.build(modifiedFiles, repoPackages, vendorPackages);
	return graph.getAffectedPackages(modifiedFiles);
}
