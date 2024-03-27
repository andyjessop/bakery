export interface TaskConfig {
	tasks: {
		[taskName: string]: {
			dependsOn: string[];
		};
	};
}
