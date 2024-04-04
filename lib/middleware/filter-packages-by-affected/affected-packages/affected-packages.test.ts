import { expect, test } from "bun:test";
import type { FileInfo, PackageInfo } from "../../../types";
import { getAffectedPackages } from "./affected-packages";

// Mock data for testing
const sourceFiles = [
	{
		path: "/packages/package1/file1.js",
		imports: [],
	},
	{
		path: "/packages/package2/file2.js",
		imports: [{ path: "package1", kind: "import-statement" }],
	},
	{
		path: "/packages/package3/file1.js",
		imports: [
			{ path: "package1", kind: "import-statement" },
			{ path: "package2", kind: "require-call" },
		],
	},

	// Circular dependencies
	{
		path: "/packages/package4/file4.js",
		imports: [{ path: "package5", kind: "import-statement" }],
	},
	{
		path: "/packages/package5/file5.js",
		imports: [{ path: "package4", kind: "import-statement" }],
	},
] as FileInfo[];

const repoPackagesData: PackageInfo[] = [
	{
		deps: [],
		files: [],
		details: { name: "package1" },
		path: "/packages/package1",
	},
	{
		deps: [],
		files: [],
		details: { name: "package1" },
		path: "/packages/package1",
	},
	{
		deps: ["package3"],
		files: [],
		details: { name: "package2" },
		path: "/packages/package2",
	},
	{
		deps: [],
		files: [],
		details: { name: "package3" },
		path: "/packages/package3",
	},
];

const vendorPackages: string[] = ["vendor1", "vendor2"];

test("getAffectedPackages returns directly affected packages", async () => {
	const affectedPackages = await getAffectedPackages(
		sourceFiles,
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
});

test("getAffectedPackages returns transitively affected packages", async () => {
	const affectedPackages = await getAffectedPackages(
		sourceFiles,
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});

test("getAffectedPackages handles empty source files", async () => {
	const affectedPackages = await getAffectedPackages(
		[],
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toEqual([]);
});

test("getAffectedPackages handles empty repo packages", async () => {
	const affectedPackages = await getAffectedPackages(
		sourceFiles,
		[],
		vendorPackages,
	);

	expect(affectedPackages).toEqual([]);
});

test("getAffectedPackages handles empty vendor packages", async () => {
	const affectedPackages = await getAffectedPackages(
		sourceFiles,
		repoPackagesData,
		[],
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});

test("getAffectedPackages handles imports from vendor packages", async () => {
	const sourceFilesWithVendorImport: FileInfo[] = [
		...sourceFiles,
		{
			path: "/packages/file3.js",
			imports: [{ path: "vendor1", kind: "import-statement" }],
		} as FileInfo,
	];

	const affectedPackages = await getAffectedPackages(
		sourceFilesWithVendorImport,
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});

test("getAffectedPackages handles imports with relative paths", async () => {
	const sourceFilesWithRelativeImport: FileInfo[] = [
		...sourceFiles,
		{
			path: "/packages/package1/file3.js",
			imports: [{ path: "./subdir/file4.js", kind: "import-statement" }],
		} as FileInfo,
	];

	const affectedPackages = await getAffectedPackages(
		sourceFilesWithRelativeImport,
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});

test("getAffectedPackages handles circular dependencies", async () => {
	const repoPackagesWithCircularDeps: PackageInfo[] = [
		{
			deps: ["package2"],
			files: [],
			details: { name: "package1" },
			path: "/packages/package1",
		},
		{
			deps: ["package1"],
			files: [],
			details: { name: "package2" },
			path: "/packages/package2",
		},
	];

	const affectedPackages = await getAffectedPackages(
		sourceFiles,
		repoPackagesWithCircularDeps,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesWithCircularDeps[0]);
	expect(affectedPackages).toContainEqual(repoPackagesWithCircularDeps[1]);
});

test("getAffectedPackages handles imports with nested relative paths", async () => {
	const sourceFilesWithNestedRelativeImport: FileInfo[] = [
		...sourceFiles,
		{
			path: "/packages/package1/subdir/file3.js",
			imports: [{ path: "../subdir2/file4.js", kind: "import-statement" }],
		} as FileInfo,
	];

	const affectedPackages = await getAffectedPackages(
		sourceFilesWithNestedRelativeImport,
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});

test("getAffectedPackages handles imports with absolute paths", async () => {
	const sourceFilesWithAbsoluteImport: FileInfo[] = [
		...sourceFiles,
		{
			path: "/packages/package1/file3.js",
			imports: [
				{ path: "/packages/package2/file4.js", kind: "import-statement" },
			],
		} as FileInfo,
	];

	const affectedPackages = await getAffectedPackages(
		sourceFilesWithAbsoluteImport,
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});

test("getAffectedPackages handles self-referencing packages", async () => {
	const repoPackagesWithSelfReference: PackageInfo[] = [
		{
			deps: ["package1"],
			files: [],
			details: { name: "package1" },
			path: "/packages/package1",
		},
		...repoPackagesData.slice(1),
	];

	const affectedPackages = await getAffectedPackages(
		sourceFiles,
		repoPackagesWithSelfReference,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesWithSelfReference[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});

test("getAffectedPackages handles transitive dependencies with multiple paths", async () => {
	const repoPackagesWithMultiplePaths: PackageInfo[] = [
		{
			deps: ["package2", "package3"],
			files: [],
			details: { name: "package1" },
			path: "/packages/package1",
		},
		{
			deps: ["package3"],
			files: [],
			details: { name: "package2" },
			path: "/packages/package2",
		},
		{
			deps: ["package4"],
			files: [],
			details: { name: "package3" },
			path: "/packages/package3",
		},
		{
			deps: [],
			files: [],
			details: { name: "package4" },
			path: "/packages/package4",
		},
	];

	const affectedPackages = await getAffectedPackages(
		sourceFiles,
		repoPackagesWithMultiplePaths,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesWithMultiplePaths[0]);
	expect(affectedPackages).toContainEqual(repoPackagesWithMultiplePaths[1]);
	expect(affectedPackages).toContainEqual(repoPackagesWithMultiplePaths[2]);
	expect(affectedPackages).toContainEqual(repoPackagesWithMultiplePaths[3]);
});

test("getAffectedPackages handles imports with non-existent packages", async () => {
	const sourceFilesWithNonExistentImport: FileInfo[] = [
		...sourceFiles,
		{
			path: "/packages/file3.js",
			imports: [{ path: "non-existent-package", kind: "import-statement" }],
		} as FileInfo,
	];

	const affectedPackages = await getAffectedPackages(
		sourceFilesWithNonExistentImport,
		repoPackagesData,
		vendorPackages,
	);

	expect(affectedPackages).toContainEqual(repoPackagesData[0]);
	expect(affectedPackages).toContainEqual(repoPackagesData[1]);
	expect(affectedPackages).toContainEqual(repoPackagesData[2]);
});
