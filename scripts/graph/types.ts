export interface PackageInfo {
	deps: string[];
	files: FileInfo[];
	name: string;
	path: string;
}

export interface FileInfo {
	filename: string;
	content: string;
}

export interface Task {
	flags: Record<string, string>;
	packageInfo: PackageInfo;
	scriptName: string;
}
