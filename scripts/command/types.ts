import type { TaskConfig } from "../../types/types";
import type { PackageInfo, Task } from "../graph/types";
import type { Logger } from "../logger";
import type { Context } from "../runner/types";

export type State = {
	flags: Record<string, string>;
	logger: Logger;
	packages: PackageInfo[];
	taskConfig: TaskConfig;
	taskPipeline: Task[][];
};

export type CommandContext = Context<State>;
