import { $ } from "bun";

export async function getAffectedVendorPackages(
	baseSha: string,
	headSha?: string,
): Promise<string[]> {
	const lockfileDiffFile = Bun.file(
		new URL("./lockfile-diff.sh", import.meta.url) as unknown as string,
	);

	const { stdout } = headSha
		? await $`${lockfileDiffFile} ${baseSha} ${headSha}`.quiet()
		: await $`${lockfileDiffFile} ${baseSha}`.quiet();

	const modifiedPackages = stdout.toString().trim().split("\n");

	return [...new Set(modifiedPackages)].sort();
}
