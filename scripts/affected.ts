import { $, ShellPromise } from "bun";
import { Graph } from "./graph/graph";
import { readPackageJson } from "./utils/read-package-json";
import { getPackages } from "./graph/utils";

async function main() {
	const scriptName = process.argv.slice(3).join(" ");

	if (!scriptName) {
		console.error("Please provide a script name using the --script flag.");
		process.exit(1);
	}

	const graph = new Graph();
	const modifiedFiles = await getModifiedFiles();
	await graph.build(process.cwd(), modifiedFiles, getPackages);
	const affectedPackages = graph.getAffectedPackages(modifiedFiles);

	for (const packageName of affectedPackages) {
		const packagePath = graph
			.getPackages()
			.find((pkg) => pkg.name === packageName)?.path;

		const commands = [] as ShellPromise[];

		if (packagePath) {
			const packageJson = await readPackageJson(packagePath);
			if (packageJson.scripts && packageJson.scripts[scriptName]) {
				console.log(
					`Running script "${scriptName}" for package ${packageName}`,
				);
				commands.push($`bun run --cwd ${packagePath} ${scriptName}`);
			} else {
				console.log(
					`Skipping package ${packageName} as it does not have the script "${scriptName}".`,
				);
			}
		}

		await Promise.all(commands);
	}
}

try {
	await main();
} catch (e) {
	console.log(e);
	process.exit(1);
}

export async function getModifiedFiles(): Promise<string[]> {
	// Execute Git command to get modified files
	const { stdout: modifiedFiles } =
		await $`git diff --name-only --diff-filter=M HEAD`.quiet();

	// Execute Git command to get deleted files
	const { stdout: deletedFiles } =
		await $`git diff --name-only --diff-filter=D HEAD`.quiet();

	// Execute Git command to get untracked files
	const { stdout: untrackedFiles } =
		await $`git ls-files --others --exclude-standard`.quiet();

	// Execute Git command to get not staged files
	const { stdout: notStagedFiles } = await $`git diff --name-only`.quiet();

	// Split the output into arrays of file paths
	const modifiedFilePaths = modifiedFiles.toString().trim().split("\n");
	const deletedFilePaths = deletedFiles.toString().trim().split("\n");
	const untrackedFilePaths = untrackedFiles.toString().trim().split("\n");
	const notStagedFilePaths = notStagedFiles.toString().trim().split("\n");

	// Combine all file paths into a single array
	const allFilePaths = [
		...modifiedFilePaths,
		...deletedFilePaths,
		...untrackedFilePaths,
		...notStagedFilePaths,
	];

	// Remove duplicate file paths
	const uniqueFilePaths = [...new Set(allFilePaths)];

	// Filter out non-text files
	const textFiles = uniqueFilePaths.filter((filename) => {
		const file = Bun.file(filename);
		const { type } = file;
		return type && type.startsWith("text/");
	});

	return textFiles;
}
