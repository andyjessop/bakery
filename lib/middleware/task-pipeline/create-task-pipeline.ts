import type { PackageInfo, Task, TaskConfig } from "../../types";

export function createTaskPipeline(
	scriptName: string,
	affectedPackages: PackageInfo[],
	taskConfig: TaskConfig,
	flags: Record<string, string>,
): Task[][] {
	const taskLevels: Task[][] = [];
	const visitedPackages = new Set<string>();

	function addTasksForPackage(packageInfo: PackageInfo, level: number) {
		if (visitedPackages.has(packageInfo.details.name)) {
			return;
		}
		visitedPackages.add(packageInfo.details.name);

		if (!packageInfo.details.scripts?.[scriptName]) {
			return;
		}

		const dependencies = taskConfig.tasks[scriptName]?.dependsOn || [];
		for (const dependency of dependencies) {
			const dependencyPackage = affectedPackages.find(
				(pkg) => pkg.details.name === dependency,
			);
			if (dependencyPackage) {
				addTasksForPackage(dependencyPackage, level + 1);
			}
		}

		if (!taskLevels[level]) {
			taskLevels[level] = [];
		}
		taskLevels[level].push({ flags, packageInfo, scriptName });
	}

	for (const packageInfo of affectedPackages) {
		addTasksForPackage(packageInfo, taskLevels.length);
	}

	return taskLevels;
}
