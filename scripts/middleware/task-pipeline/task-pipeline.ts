import type { CommandContext } from "../../command/types";
import { createTaskPipeline } from "./create-task-pipeline";

export function taskPipeline(scriptName: string) {
	return async function pipeline(ctx: CommandContext) {
		const { get, set } = ctx;

		const pipeline = createTaskPipeline(
			scriptName,
			get("packages"),
			get("taskConfig"),
		);

		set("taskPipeline", pipeline);
	};
}
