import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
	formatLocalPackageInfo,
	formatPackageInfo,
	formatVersionString,
} from "./format";

// Mock chalk. We could compare against the actual escape codes chalk generates, but that would be unreadable.
const mockChalk = {
	greenBright: {
		bold: (str: string) => `<green-bright-bold>${str}</green-bright-bold>`,
	},
	yellowBright: {
		bold: (str: string) => `<yellow-bright-bold>${str}</yellow-bright-bold>`,
	},
	magentaBright: {
		bold: (str: string) => `<magenta-bright-bold>${str}</magenta-bright-bold>`,
	},
	cyanBright: {
		bold: (str: string) => `<cyan-bright-bold>${str}</cyan-bright-bold>`,
	},
	gray: (str: string) => `<gray>${str}</gray>`,
	cyan: (str: string) => `<cyan>${str}</cyan>`,
	dim: (str: string) => `<dim>${str}</dim>`,
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
			"<magenta-bright-bold>✔ </magenta-bright-bold><green-bright-bold>1.2.3</green-bright-bold>",
		);
	});

	it("should format installed and satisfied version with local range", () => {
		const result = formatVersionString("1.2.3", true, true, true);
		expect(result).toBe(
			"<magenta-bright-bold>✔ </magenta-bright-bold><yellow-bright-bold>1.2.3</yellow-bright-bold>",
		);
	});

	it("should format installed but not satisfied version", () => {
		const result = formatVersionString("1.2.3", true, false, false);
		expect(result).toBe(
			"<magenta-bright-bold>✔ </magenta-bright-bold><magenta-bright-bold>1.2.3</magenta-bright-bold>",
		);
	});

	it("should format installed but not satisfied version with local range", () => {
		const result = formatVersionString("1.2.3", true, false, true);
		expect(result).toBe(
			"<magenta-bright-bold>✔ </magenta-bright-bold><magenta-bright-bold>1.2.3</magenta-bright-bold>",
		);
	});

	it("should format not installed but satisfied version with user-provided range", () => {
		const result = formatVersionString("1.2.3", false, true, false);
		expect(result).toBe("<green-bright-bold>  1.2.3</green-bright-bold>");
	});

	it("should format not installed but satisfied version with local range", () => {
		const result = formatVersionString("1.2.3", false, true, true);
		expect(result).toBe("<yellow-bright-bold>  1.2.3</yellow-bright-bold>");
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
		expect(result1).toBe(
			"<green-bright-bold>  1.0.0-beta.1</green-bright-bold>",
		);

		const result2 = formatVersionString("2.1.0-alpha", true, false, false);
		expect(result2).toBe(
			"<magenta-bright-bold>✔ </magenta-bright-bold><magenta-bright-bold>2.1.0-alpha</magenta-bright-bold>",
		);
	});
});

describe("formatLocalPackageInfo", () => {
	it("should format package info with both range and installed version", () => {
		const result = formatLocalPackageInfo("lodash", "^4.17.21", "4.17.21");
		expect(result).toBe(
			"<cyan>./node_modules/lodash | <magenta-bright-bold>✔ 4.17.21</magenta-bright-bold> | <yellow-bright-bold>^4.17.21</yellow-bright-bold></cyan>",
		);
	});

	it("should format package info with only range", () => {
		const result = formatLocalPackageInfo("lodash", "^4.17.21", undefined);
		expect(result).toBe(
			"<cyan>./node_modules/lodash | <yellow-bright-bold>^4.17.21</yellow-bright-bold></cyan>",
		);
	});

	it("should format package info with only installed version", () => {
		const result = formatLocalPackageInfo("lodash", undefined, "4.17.21");
		expect(result).toBe(
			"<cyan>./node_modules/lodash | <magenta-bright-bold>✔ 4.17.21</magenta-bright-bold></cyan>",
		);
	});

	it("should handle scoped package names", () => {
		const result = formatLocalPackageInfo("@types/node", "^18.0.0", "18.15.11");
		expect(result).toBe(
			"<cyan>./node_modules/@types/node | <magenta-bright-bold>✔ 18.15.11</magenta-bright-bold> | <yellow-bright-bold>^18.0.0</yellow-bright-bold></cyan>",
		);
	});

	it("should handle different semver ranges", () => {
		const result1 = formatLocalPackageInfo("express", "~4.18.0", "4.18.2");
		expect(result1).toBe(
			"<cyan>./node_modules/express | <magenta-bright-bold>✔ 4.18.2</magenta-bright-bold> | <yellow-bright-bold>~4.18.0</yellow-bright-bold></cyan>",
		);

		const result2 = formatLocalPackageInfo("react", ">=16.8.0", "18.2.0");
		expect(result2).toBe(
			"<cyan>./node_modules/react | <magenta-bright-bold>✔ 18.2.0</magenta-bright-bold> | <yellow-bright-bold>>=16.8.0</yellow-bright-bold></cyan>",
		);
	});

	it("should handle prerelease versions", () => {
		const result = formatLocalPackageInfo(
			"next",
			"13.0.0-canary.1",
			"13.0.0-canary.1",
		);
		expect(result).toBe(
			"<cyan>./node_modules/next | <magenta-bright-bold>✔ 13.0.0-canary.1</magenta-bright-bold> | <yellow-bright-bold>13.0.0-canary.1</yellow-bright-bold></cyan>",
		);
	});

	it("should handle empty parameters gracefully", () => {
		const result = formatLocalPackageInfo("", undefined, undefined);
		expect(result).toBe("");
	});

	it("should handle packages with special characters in name", () => {
		const result = formatLocalPackageInfo("@babel/core", "^7.20.0", "7.21.4");
		expect(result).toBe(
			"<cyan>./node_modules/@babel/core | <magenta-bright-bold>✔ 7.21.4</magenta-bright-bold> | <yellow-bright-bold>^7.20.0</yellow-bright-bold></cyan>",
		);
	});
});

describe("formatPackageInfo", () => {
	it("should format package info with homepage", () => {
		const packageData = {
			name: "lodash",
			description: "Lodash modular utilities.",
			homepage: "https://lodash.com/",
			repository: {
				type: "git",
				url: "https://github.com/lodash/lodash",
			},
		};

		const result = formatPackageInfo(packageData);
		expect(result).toBe(
			"<cyan-bright-bold>lodash</cyan-bright-bold> | <dim>https://lodash.com/</dim>",
		);
	});

	it("should handle package with minimal metadata", () => {
		const packageData = {
			name: "minimal-package",
		};

		const result = formatPackageInfo(packageData);
		expect(result).toBe("<cyan-bright-bold>minimal-package</cyan-bright-bold>");
	});

	it("should handle scoped packages with homepage", () => {
		const packageData = {
			name: "@types/node",
			description: "TypeScript definitions for Node.js",
			homepage: "https://github.com/DefinitelyTyped/DefinitelyTyped#readme",
		};

		const result = formatPackageInfo(packageData);
		expect(result).toBe(
			"<cyan-bright-bold>@types/node</cyan-bright-bold> | <dim>https://github.com/DefinitelyTyped/DefinitelyTyped#readme</dim>",
		);
	});

	it("should handle package without homepage", () => {
		const packageData = {
			name: "no-homepage-package",
			description: "A package without homepage",
		};

		const result = formatPackageInfo(packageData);
		expect(result).toBe(
			"<cyan-bright-bold>no-homepage-package</cyan-bright-bold>",
		);
	});
});
