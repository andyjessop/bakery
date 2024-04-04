import * as path from "node:path";
import type { TaskConfig } from "../../types";

export async function readBakeryJson(): Promise<TaskConfig> {
	let currentDir = process.cwd();

	while (true) {
		const configPath = path.join(currentDir, "bakery.json");
		const file = Bun.file(configPath);

		if (!file.size) {
			const parentDir = path.dirname(currentDir);
			if (parentDir === currentDir) {
				throw new Error("bakery.json not found in any parent directory.");
			}
			currentDir = parentDir;
			continue;
		}

		const configContent = await file.text();
		return JSON.parse(configContent);
	}
}
