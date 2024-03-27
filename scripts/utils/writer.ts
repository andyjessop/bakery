export function success(message: string): string {
	return `\x1b[32m[success] ${message}\x1b[0m`;
}

export function info(message: string): string {
	return `\x1b[36m[info] ${message}\x1b[0m`;
}

export function warning(message: string): string {
	return `\x1b[33m[warning] ${message}\x1b[0m`;
}

export function error(message: string): string {
	return `\x1b[31m[error] ${message}\x1b[0m`;
}
