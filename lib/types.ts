import type { Import } from "bun";

export interface TaskConfig {
	tasks: {
		[taskName: string]: {
			dependsOn: string[];
		};
	};
}

export interface GitDetails {
	baseSha: string;
	headSha: string;
}

export interface PackageInfo {
	deps: string[];
	files: FileInfo[];
	details: Package;
	path: string;
}

export interface FileInfo {
	content: string;
	path: string;
	imports: Import[];
}

export interface Task {
	flags: Record<string, string>;
	packageInfo: PackageInfo;
	scriptName: string;
}

export interface Package {
	name: string;
	version?: string;
	description?: string;
	keywords?: string[];
	homepage?: string;
	bugs?: {
		url: string;
		email?: string;
	};
	license?: string;
	author?: {
		name: string;
		email?: string;
		url?: string;
	};
	contributors?: {
		name: string;
		email?: string;
		url?: string;
	}[];
	funding?: {
		type: string;
		url: string;
	}[];
	files?: string[];
	main?: string;
	browser?: string;
	bin?: Record<string, string>;
	man?: string | string[];
	directories?: {
		lib?: string;
		bin?: string;
		man?: string;
		doc?: string;
		example?: string;
		test?: string;
	};
	repository?: {
		type: string;
		url: string;
		directory?: string;
	};
	scripts?: Record<string, string>;
	config?: Record<string, unknown>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	bundledDependencies?: string[];
	engines?: {
		node?: string;
		npm?: string;
	};
	os?: string[];
	cpu?: string[];
	private?: boolean;
	publishConfig?: {
		access?: "public" | "restricted";
		registry?: string;
		tag?: string;
	};
	workspaces?: string[];
}
