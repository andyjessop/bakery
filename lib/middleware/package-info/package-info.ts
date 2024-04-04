import type { CommandContext } from "../../command/types";
import { getPackageInfo } from "./get-package-info";

export async function packageInfo(ctx: CommandContext) {
	const { get, set } = ctx;

	const all = get("allPackagesDetails");
	const filtered = get("filteredPackagesDetails");

	const packageInfo = await getPackageInfo(all, filtered);

	set("filteredPackagesInfo", packageInfo);
}
