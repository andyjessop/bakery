import minimist from "minimist";
import { Runner } from "../runner/Runner";
import type { State } from "./types";
import { taskConfig } from "../middleware/task-config/task-config";
import { taskPipeline } from "../middleware/task-pipeline/task-pipeline";
import { taskRunner } from "../middleware/task-runner/task-runner";
import { affectedPackages } from "../middleware/affected-packages/affected-packages";
import { allPackages } from "../middleware/all-packages/all-packages";

try {
	await main();
} catch (e) {
	console.log(e);
	process.exit(1);
}

async function main() {
	const command = process.argv[2];
	const flags = minimist(process.argv.slice(3));

	if (!flags.script) {
		console.error("Missing required flag: --script");
		process.exit(1);
	}

	const runner = new Runner<State>();

	runner.use(taskConfig);

	if (command === "affected") {
		runner.use(affectedPackages);
	} else if (command === "run") {
		const packagesToInclude = flags.packages
			? flags.packages.split(",")
			: undefined;

		runner.use(allPackages(packagesToInclude));
	}

	runner.use(taskPipeline(flags.script));
	runner.use(taskRunner);

	const stream = runner.command(command, flags);

	for await (const value of stream) {
		console.log(value);
	}
}
