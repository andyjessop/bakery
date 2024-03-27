import { $ } from "bun";
import { readPackageJson } from "../../utils/read-package-json";
import type { Task } from "../../graph/types";
import type { CommandContext } from "../../command/types";
import { error, info, success, warning } from "../../utils/writer";

export async function taskRunner(ctx: CommandContext) {
	const { get, writer } = ctx;

	const pipeline = get("taskPipeline");

	const pipelinePromises = pipeline.map(async (tasks) => {
		const promises = tasks.map(runTask);
		const results = await Promise.all(promises);

		const messages: string[] = [];

		for (const result of results) {
			if (result) {
				for (const message of result) {
					switch (message.type) {
						case "info":
							messages.push(info(message.content));
							break;
						case "error":
							messages.push(error(message.content));
							break;
						case "success":
							messages.push(success(message.content));
							break;
						case "warning":
							messages.push(warning(message.content));
							break;
						default:
							messages.push(message.content);
							break;
					}
				}
			}
		}

		for (const message of messages) {
			writer.write(message);
		}
	});

	await Promise.all(pipelinePromises);
}

async function runTask(
	task: Task,
): Promise<{ type: string; content: string }[] | void> {
	const { packageInfo, scriptName } = task;
	const { name, path } = packageInfo;

	if (path) {
		const packageJson = await readPackageJson(path);
		if (packageJson.scripts && packageJson.scripts[scriptName]) {
			const output = await $`bun run --cwd ${path} ${scriptName}`.quiet();
			return [
				{
					type: "info",
					content: `Running script "${scriptName}" for package ${name}`,
				},
				{
					type: "normal",
					content: output.stdout.toString(),
				},
			];
		} else {
			return;
		}
	}

	return;
}
