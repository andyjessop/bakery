import type { CommandContext } from "../../command/types";
import { createTaskPipeline } from "./create-task-pipeline";

export async function taskPipeline(ctx: CommandContext) {
	const { get, set } = ctx;
	const flags = get("flags");

	const { script } = flags;

	const pipeline = createTaskPipeline(
		script,
		get("filteredPackagesInfo"),
		get("taskConfig"),
		flags,
	);

	set("taskPipeline", pipeline);
}
