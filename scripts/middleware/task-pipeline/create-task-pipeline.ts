import type { TaskConfig } from "../../../types/types";
import type { PackageInfo, Task } from "../../graph/types";

export function createTaskPipeline(
	scriptName: string,
	affectedPackages: PackageInfo[],
	taskConfig: TaskConfig,
): Task[][] {
	const taskLevels: Task[][] = [];
	const visitedPackages = new Set<string>();

	function addTasksForPackage(packageInfo: PackageInfo, level: number) {
		if (visitedPackages.has(packageInfo.name)) {
			return;
		}
		visitedPackages.add(packageInfo.name);

		const dependencies = taskConfig.tasks[scriptName]?.dependsOn || [];
		for (const dependency of dependencies) {
			const dependencyPackage = affectedPackages.find(
				(pkg) => pkg.name === dependency,
			);
			if (dependencyPackage) {
				addTasksForPackage(dependencyPackage, level + 1);
			}
		}

		if (!taskLevels[level]) {
			taskLevels[level] = [];
		}
		taskLevels[level].push({ packageInfo, scriptName });
	}

	for (const packageInfo of affectedPackages) {
		addTasksForPackage(packageInfo, taskLevels.length);
	}

	return taskLevels;
}
