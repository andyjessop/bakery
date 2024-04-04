import type {
	GitDetails,
	PackageDetails,
	PackageInfo,
	Task,
	TaskConfig,
} from "../types";
import type { Context, TaskOutput } from "../runner/types";

export type State = {
	flags: Record<string, string>;
	gitDetails: GitDetails;
	allPackagesDetails: PackageDetails[];
	filteredPackagesDetails: PackageDetails[];
	filteredPackagesInfo: PackageInfo[];
	taskConfig: TaskConfig;
	taskOutputs: TaskOutput[];
	taskPipeline: Task[][];
};

export type CommandContext = Context<State>;
