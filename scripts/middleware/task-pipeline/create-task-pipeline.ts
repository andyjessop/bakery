import type { TaskConfig } from "../../../types/types";
import type { PackageInfo, Task } from "../../graph/types";
import { readPackageJson } from "../../utils/read-package-json";

export async function createTaskPipeline(
	scriptName: string,
	affectedPackages: PackageInfo[],
	taskConfig: TaskConfig,
	flags: Record<string, string>,
): Promise<Task[][]> {
	const taskLevels: Task[][] = [];
	const visitedPackages = new Set<string>();

	async function addTasksForPackage(packageInfo: PackageInfo, level: number) {
		if (visitedPackages.has(packageInfo.name)) {
			return;
		}
		visitedPackages.add(packageInfo.name);

		const packageJson = await readPackageJson(packageInfo.path);

		if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
			return;
		}

		const dependencies = taskConfig.tasks[scriptName]?.dependsOn || [];
		for (const dependency of dependencies) {
			const dependencyPackage = affectedPackages.find(
				(pkg) => pkg.name === dependency,
			);
			if (dependencyPackage) {
				await addTasksForPackage(dependencyPackage, level + 1);
			}
		}

		if (!taskLevels[level]) {
			taskLevels[level] = [];
		}
		taskLevels[level].push({ flags, packageInfo, scriptName });
	}

	for (const packageInfo of affectedPackages) {
		await addTasksForPackage(packageInfo, taskLevels.length);
	}

	return taskLevels;
}
