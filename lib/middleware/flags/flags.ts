import minimist from "minimist";
import type { CommandContext } from "../../command/types";

export async function flags(ctx: CommandContext) {
	const { set } = ctx;

	const flags = minimist(process.argv.slice(3));

	if (!flags.script) {
		console.error("Missing required flag: --script");
		process.exit(1);
	}

	set("flags", flags);
}
