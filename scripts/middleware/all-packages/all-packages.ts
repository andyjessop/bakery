import type { CommandContext } from "../../command/types";
import { getPackages } from "../../utils/get-packages";

export function allPackages(packagesToInclude?: string[]) {
	return async function allPackages(ctx: CommandContext) {
		const { set } = ctx;

		const packages = await getPackages(process.cwd());

		set(
			"packages",
			packages.filter(
				(pkg) => !packagesToInclude || packagesToInclude.includes(pkg.name),
			),
		);
	};
}
