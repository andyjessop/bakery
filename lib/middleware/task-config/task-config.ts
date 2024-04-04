import type { CommandContext } from "../../command/types";
import { readBakeryJson } from "./read-bakery-json";

export async function taskConfig(ctx: CommandContext) {
	const { set } = ctx;

	set("taskConfig", await readBakeryJson());
}
