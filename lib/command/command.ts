import { Runner } from "../runner/Runner";
import type { State } from "./types";
import { taskConfig } from "../middleware/task-config/task-config";
import { taskRunner } from "../middleware/task-runner/task-runner";
import { gitDetails } from "../middleware/git-details/git-details";
import { filterPackagesByName } from "../middleware/filter-packages-by-name/filter-packages-by-name";
import { packages } from "../middleware/packages/packages";
import { filterPackagesByAffected } from "../middleware/filter-packages-by-affected/filter-packages-by-affected";
import { flags } from "../middleware/flags/flags";
import { taskPipeline } from "../middleware/task-pipeline/task-pipeline";

try {
	await main();
} catch (e) {
	console.log(e);
	process.exit(1);
}

async function main() {
	const command = process.argv[2];

	const runner = new Runner<State>();

	runner.use(flags);
	runner.use(taskConfig);
	runner.use(gitDetails);

	// First get all packages...
	runner.use(packages);

	// ...then filter out non-affected packages
	if (command === "affected") {
		runner.use(filterPackagesByAffected);
	}

	// ...then filter by packages named in --packages flag
	runner.use(filterPackagesByName);

	runner.use(taskPipeline);
	runner.use(taskRunner);

	const stream = runner.command(command);

	for await (const value of stream) {
		console.log(value);
	}
}
