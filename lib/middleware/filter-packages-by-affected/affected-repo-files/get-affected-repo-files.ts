import { $ } from "bun";

export async function getAffectedRepoFiles(
	baseSha: string,
	headSha: string,
): Promise<string[]> {
	const repoDiffFile = Bun.file(
		new URL("./repo-diff.sh", import.meta.url) as unknown as string,
	);

	const { stdout } = await $`${repoDiffFile} ${baseSha} ${headSha}`.quiet();

	const allFilePaths = stdout.toString().trim().split("\n");
	const uniqueFilePaths = [...new Set(allFilePaths)];

	const textFiles = uniqueFilePaths.filter((filename) => {
		const file = Bun.file(filename);
		const { type } = file;
		return type ? type.startsWith("text/") : false;
	});

	return textFiles;
}
