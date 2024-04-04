import { $ } from "bun";
import type { CommandContext } from "../../command/types";
import type { TaskOutput } from "../../runner/types";
import { info, success } from "../../utils/writer";
import type { Task } from "../../types";

export async function taskRunner(ctx: CommandContext) {
	const { get, set, writer } = ctx;

	const pipeline = get("taskPipeline");

	const pipelinePromises = pipeline.map(async (tasks) => {
		const promises = tasks.map(async (task) => {
			const result = await runTask(task);

			const outputs = get("taskOutputs") ?? [];
			outputs.push(result);
			set("taskOutputs", outputs);

			writer.write(info(`Running task: ${task.packageInfo.details.name}`));
			writer.write(success(`Task completed: ${task.packageInfo.details.name}`));
			writer.write(result.output);
		});

		await Promise.all(promises);

		const messages: string[] = [];

		for (const message of messages) {
			writer.write(message);
		}
	});

	await Promise.all(pipelinePromises);
}

async function runTask(task: Task): Promise<TaskOutput> {
	const { flags, packageInfo, scriptName } = task;
	const { details, path } = packageInfo;

	const flagsString = Object.entries(flags).map(
		([key, value]) => `--${key} ${value}`,
	);

	const command = `bun run --cwd ${path} ${scriptName} ${flagsString}`;
	const { stdout, stderr, exitCode } =
		await $`bun run --cwd ${path} ${scriptName} ${flagsString}`.quiet();

	if (exitCode !== 0) {
		console.error(stderr.toString());
		process.exit(exitCode);
	}

	return {
		command,
		package: details,
		output: stdout.toString(),
		script: scriptName,
	};
}
