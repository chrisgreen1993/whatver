import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { formatLocalPackageInfo, formatVersionString } from "./format";

// Mock chalk. We could compare against the actual escape codes chalk generates, but that would be unreadable.
const mockChalk = {
	greenBright: { bold: (str: string) => `<green-bold>${str}</green-bold>` },
	yellowBright: { bold: (str: string) => `<yellow-bold>${str}</yellow-bold>` },
	magentaBright: {
		bold: (str: string) => `<magenta-bold>${str}</magenta-bold>`,
	},
	gray: (str: string) => `<gray>${str}</gray>`,
	yellow: { bold: (str: string) => `<yellow-bold>${str}</yellow-bold>` },
	cyan: (str: string) => `<cyan>${str}</cyan>`,
	bold: (str: string) => `<bold>${str}</bold>`,
};

beforeEach(() => {
	// Mock the chalk module
	mock.module("chalk", () => ({ default: mockChalk }));
});

afterEach(() => {
	mock.restore();
});

describe("formatVersionString", () => {
	it("should format installed and satisfied version with user-provided range", () => {
		const result = formatVersionString("1.2.3", true, true, false);
		expect(result).toBe(
			"<magenta-bold>✔ </magenta-bold><green-bold>1.2.3</green-bold>",
		);
	});

	it("should format installed and satisfied version with local range", () => {
		const result = formatVersionString("1.2.3", true, true, true);
		expect(result).toBe(
			"<magenta-bold>✔ </magenta-bold><yellow-bold>1.2.3</yellow-bold>",
		);
	});

	it("should format installed but not satisfied version", () => {
		const result = formatVersionString("1.2.3", true, false, false);
		expect(result).toBe(
			"<magenta-bold>✔ </magenta-bold><magenta-bold>1.2.3</magenta-bold>",
		);
	});

	it("should format installed but not satisfied version with local range", () => {
		const result = formatVersionString("1.2.3", true, false, true);
		expect(result).toBe(
			"<magenta-bold>✔ </magenta-bold><magenta-bold>1.2.3</magenta-bold>",
		);
	});

	it("should format not installed but satisfied version with user-provided range", () => {
		const result = formatVersionString("1.2.3", false, true, false);
		expect(result).toBe("<green-bold>  1.2.3</green-bold>");
	});

	it("should format not installed but satisfied version with local range", () => {
		const result = formatVersionString("1.2.3", false, true, true);
		expect(result).toBe("<yellow-bold>  1.2.3</yellow-bold>");
	});

	it("should format not installed and not satisfied version", () => {
		const result = formatVersionString("1.2.3", false, false, false);
		expect(result).toBe("<gray>  1.2.3</gray>");
	});

	it("should format not installed and not satisfied version with local range", () => {
		const result = formatVersionString("1.2.3", false, false, true);
		expect(result).toBe("<gray>  1.2.3</gray>");
	});

	it("should handle different version formats", () => {
		const result1 = formatVersionString("1.0.0-beta.1", false, true, false);
		expect(result1).toBe("<green-bold>  1.0.0-beta.1</green-bold>");

		const result2 = formatVersionString("2.1.0-alpha", true, false, false);
		expect(result2).toBe(
			"<magenta-bold>✔ </magenta-bold><magenta-bold>2.1.0-alpha</magenta-bold>",
		);
	});
});

describe("formatLocalPackageInfo", () => {
	it("should format package info with both range and installed version", () => {
		const result = formatLocalPackageInfo("lodash", "^4.17.21", "4.17.21");
		expect(result).toBe(
			"<cyan>Found <bold>lodash</bold> locally with range: <yellow-bold>^4.17.21</yellow-bold>, installed: <magenta-bold>✔ 4.17.21</magenta-bold></cyan>",
		);
	});

	it("should format package info with only range", () => {
		const result = formatLocalPackageInfo("lodash", "^4.17.21", undefined);
		expect(result).toBe(
			"<cyan>Found <bold>lodash</bold> locally with range: <yellow-bold>^4.17.21</yellow-bold></cyan>",
		);
	});

	it("should format package info with only installed version", () => {
		const result = formatLocalPackageInfo("lodash", undefined, "4.17.21");
		expect(result).toBe(
			"<cyan>Found <bold>lodash</bold> locally with installed: <magenta-bold>✔ 4.17.21</magenta-bold></cyan>",
		);
	});

	it("should handle scoped package names", () => {
		const result = formatLocalPackageInfo("@types/node", "^18.0.0", "18.15.11");
		expect(result).toBe(
			"<cyan>Found <bold>@types/node</bold> locally with range: <yellow-bold>^18.0.0</yellow-bold>, installed: <magenta-bold>✔ 18.15.11</magenta-bold></cyan>",
		);
	});

	it("should handle different semver ranges", () => {
		const result1 = formatLocalPackageInfo("express", "~4.18.0", "4.18.2");
		expect(result1).toBe(
			"<cyan>Found <bold>express</bold> locally with range: <yellow-bold>~4.18.0</yellow-bold>, installed: <magenta-bold>✔ 4.18.2</magenta-bold></cyan>",
		);

		const result2 = formatLocalPackageInfo("react", ">=16.8.0", "18.2.0");
		expect(result2).toBe(
			"<cyan>Found <bold>react</bold> locally with range: <yellow-bold>>=16.8.0</yellow-bold>, installed: <magenta-bold>✔ 18.2.0</magenta-bold></cyan>",
		);
	});

	it("should handle prerelease versions", () => {
		const result = formatLocalPackageInfo(
			"next",
			"13.0.0-canary.1",
			"13.0.0-canary.1",
		);
		expect(result).toBe(
			"<cyan>Found <bold>next</bold> locally with range: <yellow-bold>13.0.0-canary.1</yellow-bold>, installed: <magenta-bold>✔ 13.0.0-canary.1</magenta-bold></cyan>",
		);
	});

	it("should handle empty parameters gracefully", () => {
		const result = formatLocalPackageInfo("", undefined, undefined);
		expect(result).toBe(
			"<cyan>Found <bold></bold> locally with no range or installed version</cyan>",
		);
	});

	it("should handle packages with special characters in name", () => {
		const result = formatLocalPackageInfo("@babel/core", "^7.20.0", "7.21.4");
		expect(result).toBe(
			"<cyan>Found <bold>@babel/core</bold> locally with range: <yellow-bold>^7.20.0</yellow-bold>, installed: <magenta-bold>✔ 7.21.4</magenta-bold></cyan>",
		);
	});
});
