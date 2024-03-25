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
