import type { CommandContext } from "../../command/types";

export async function filterPackagesByName(ctx: CommandContext) {
	const { get, set } = ctx;

	const packages = get("packages");
	const flags = get("flags");

	const packagesToInclude = flags.packages
		? (flags.packages as string).split(",")
		: undefined;

	set(
		"packages",
		packages.filter(
			(pkg) =>
				!packagesToInclude || packagesToInclude.includes(pkg.details.name),
		),
	);
}
