import type { CommandContext } from "../../command/types";
import { $ } from "bun";

export async function gitDetails(ctx: CommandContext) {
	const { get, set } = ctx;

	const flags = get("flags");

	const base = flags.base || process.env.BM_BASE || "main";
	const head = flags.head || process.env.BM_HEAD || "HEAD";

	const { stdout: baseShaStdOut } = await $`git rev-parse ${base}`.quiet();
	const baseSha = baseShaStdOut.toString().trim();

	const { stdout: headShaStdOut } = await $`git rev-parse ${head}`.quiet();
	const headSha = headShaStdOut.toString().trim();

	set("gitDetails", {
		baseSha,
		headSha,
	});
}
