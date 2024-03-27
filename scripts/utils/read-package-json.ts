import { $ } from "bun";
import path from "node:path";

export async function readPackageJson(packagePath: string): Promise<any> {
	const packageJsonPath = path.join(packagePath, "package.json");
	const { stdout: packageJsonContent } =
		await $`cat ${packageJsonPath}`.quiet();
	return JSON.parse(packageJsonContent.toString());
}
