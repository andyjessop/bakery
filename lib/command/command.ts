import { Runner } from "../runner/Runner";
import type { State } from "./types";
import { taskConfig } from "../middleware/task-config/task-config";
import { taskRunner } from "../middleware/task-runner/task-runner";
import { gitDetails } from "../middleware/git-details/git-details";
import { filterPackagesByName } from "../middleware/filter-packages-by-name/filter-packages-by-name";
import { packageDetails } from "../middleware/package-details/package-details";
import { flags } from "../middleware/flags/flags";
import { taskPipeline } from "../middleware/task-pipeline/task-pipeline";
import { packageInfo } from "../middleware/package-info/package-info";

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

	// First get all package details...
	runner.use(packageDetails);

	// ...then filter by packages named in --packages flag
	runner.use(filterPackagesByName);

	runner.use(packageInfo);

	runner.use(taskPipeline);
	runner.use(taskRunner);

	const stream = runner.command(command);

	for await (const value of stream) {
		console.log(value);
	}
}
