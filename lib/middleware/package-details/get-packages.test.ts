import { describe, expect, it } from "bun:test";
import { populatePackageFiles } from "./get-packages";
import type { PackageInfo } from "../../types";

describe("populatePackageFiles", () => {
	it("should populate files and dependencies for packages", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/package-a",
			},
			{
				deps: [],
				files: [],
				details: {
					name: "package-b",
					version: "1.0.0",
				},
				path: "./packages/package-b",
			},
		];

		const allPackages: PackageInfo[] = [
			...packages,
			{
				deps: [],
				files: [],
				details: {
					name: "package-c",
					version: "1.0.0",
				},
				path: "./packages/package-c",
			},
		];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(3);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files.length).toBeGreaterThan(0);
		expect(packageA!.deps).toContain("package-b");
		expect(packageA!.deps).toContain("package-c");

		const packageB = result.find((pkg) => pkg.details.name === "package-b");
		expect(packageB).toBeDefined();
		expect(packageB!.files.length).toBeGreaterThan(0);
		expect(packageB!.deps).toContain("package-c");

		const packageC = result.find((pkg) => pkg.details.name === "package-c");
		expect(packageC).toBeDefined();
		expect(packageC!.files.length).toBeGreaterThan(0);
	});

	it("should handle vendor dependencies", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/package-a",
			},
		];

		const allPackages: PackageInfo[] = [...packages];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(1);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files.length).toBeGreaterThan(0);
		expect(packageA!.deps).toContain("vendor-package");
	});

	it("should handle circular dependencies", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/package-a",
			},
			{
				deps: [],
				files: [],
				details: {
					name: "package-b",
					version: "1.0.0",
				},
				path: "./packages/package-b",
			},
		];

		const allPackages: PackageInfo[] = [...packages];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(2);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files.length).toBeGreaterThan(0);
		expect(packageA!.deps).toContain("package-b");

		const packageB = result.find((pkg) => pkg.details.name === "package-b");
		expect(packageB).toBeDefined();
		expect(packageB!.files.length).toBeGreaterThan(0);
		expect(packageB!.deps).toContain("package-a");
	});

	it("should handle deep dependencies", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/package-a",
			},
		];

		const allPackages: PackageInfo[] = [
			...packages,
			{
				deps: [],
				files: [],
				details: {
					name: "package-b",
					version: "1.0.0",
				},
				path: "./packages/package-b",
			},
			{
				deps: [],
				files: [],
				details: {
					name: "package-c",
					version: "1.0.0",
				},
				path: "./packages/package-c",
			},
			{
				deps: [],
				files: [],
				details: {
					name: "package-d",
					version: "1.0.0",
				},
				path: "./packages/package-d",
			},
		];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(4);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files.length).toBeGreaterThan(0);
		expect(packageA!.deps).toContain("package-b");

		const packageB = result.find((pkg) => pkg.details.name === "package-b");
		expect(packageB).toBeDefined();
		expect(packageB!.files.length).toBeGreaterThan(0);
		expect(packageB!.deps).toContain("package-c");

		const packageC = result.find((pkg) => pkg.details.name === "package-c");
		expect(packageC).toBeDefined();
		expect(packageC!.files.length).toBeGreaterThan(0);
		expect(packageC!.deps).toContain("package-d");

		const packageD = result.find((pkg) => pkg.details.name === "package-d");
		expect(packageD).toBeDefined();
		expect(packageD!.files.length).toBeGreaterThan(0);
	});

	it("should handle packages with no dependencies", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/package-a",
			},
		];

		const allPackages: PackageInfo[] = [...packages];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(1);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files.length).toBeGreaterThan(0);
		expect(packageA!.deps).toHaveLength(0);
	});

	it("should handle packages with no files", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/empty-package",
			},
		];

		const allPackages: PackageInfo[] = [...packages];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(1);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files).toHaveLength(0);
		expect(packageA!.deps).toHaveLength(0);
	});

	it("should handle missing dependencies in allPackages", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/package-a",
			},
		];

		const allPackages: PackageInfo[] = [...packages];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(1);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files.length).toBeGreaterThan(0);
		expect(packageA!.deps).toContain("missing-package");
	});

	it("should handle multiple packages with shared dependencies", async () => {
		const packages: PackageInfo[] = [
			{
				deps: [],
				files: [],
				details: {
					name: "package-a",
					version: "1.0.0",
				},
				path: "./packages/package-a",
			},
			{
				deps: [],
				files: [],
				details: {
					name: "package-b",
					version: "1.0.0",
				},
				path: "./packages/package-b",
			},
		];

		const allPackages: PackageInfo[] = [
			...packages,
			{
				deps: [],
				files: [],
				details: {
					name: "package-c",
					version: "1.0.0",
				},
				path: "./packages/package-c",
			},
		];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result.length).toBe(3);

		const packageA = result.find((pkg) => pkg.details.name === "package-a");
		expect(packageA).toBeDefined();
		expect(packageA!.files.length).toBeGreaterThan(0);
		expect(packageA!.deps).toContain("package-c");

		const packageB = result.find((pkg) => pkg.details.name === "package-b");
		expect(packageB).toBeDefined();
		expect(packageB!.files.length).toBeGreaterThan(0);
		expect(packageB!.deps).toContain("package-c");

		const packageC = result.find((pkg) => pkg.details.name === "package-c");
		expect(packageC).toBeDefined();
		expect(packageC!.files.length).toBeGreaterThan(0);
	});

	it("should handle an empty packages array", async () => {
		const packages: PackageInfo[] = [];
		const allPackages: PackageInfo[] = [];

		const result = await populatePackageFiles(packages, allPackages);

		expect(result).toHaveLength(0);
	});
});
