import type { CommandContext } from "../../command/types";
import { createTaskPipeline } from "./create-task-pipeline";

export function taskPipeline(scriptName: string) {
	return async function pipeline(ctx: CommandContext) {
		const { flags, get, set } = ctx;

		const pipeline = await createTaskPipeline(
			scriptName,
			get("packages"),
			get("taskConfig"),
			flags,
		);

		set("taskPipeline", pipeline);
	};
}
