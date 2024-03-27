import type { CommandContext } from "../../command/types";
import { getAffectedPackages } from "./get-affected-packages";

export async function affectedPackages(ctx: CommandContext) {
	const { flags, set } = ctx;

	const base = flags.base || process.env.BM_BASE || "main";
	const head = flags.head || process.env.BM_HEAD || "HEAD";

	set("packages", await getAffectedPackages(base, head));
}
