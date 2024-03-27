import type { TaskConfig } from "../../types/types";
import type { PackageInfo, Task } from "../graph/types";
import type { Context, TaskOutput } from "../runner/types";

export type State = {
	flags: Record<string, string>;
	packages: PackageInfo[];
	taskConfig: TaskConfig;
	taskOutputs: TaskOutput[];
	taskPipeline: Task[][];
};

export type CommandContext = Context<State>;
