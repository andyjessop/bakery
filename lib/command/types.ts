import type { GitDetails, PackageInfo, Task, TaskConfig } from "../types";
import type { Context, TaskOutput } from "../runner/types";

export type State = {
	flags: Record<string, string>;
	gitDetails: GitDetails;
	packages: PackageInfo[];
	taskConfig: TaskConfig;
	taskOutputs: TaskOutput[];
	taskPipeline: Task[][];
};

export type CommandContext = Context<State>;
