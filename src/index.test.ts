import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	mock,
} from "bun:test";
import type { PackumentVersion } from "@npm/types";
import {
	allPackageVersions,
	fetchPackageInfo,
	fetchPackageVersions,
	localPackageInstalledVersion,
	localPackageSemverRange,
	satisfiedPackageVersions,
} from "./index";

let mockFetch: Mock<() => Promise<Response>>;

describe("allVersions", () => {
	beforeEach(() => {
		// Very simple fetch mock
		mockFetch = mock(() => Promise.resolve(new Response()));
		global.fetch = mockFetch as unknown as typeof fetch;
	});

	afterEach(() => {
		mockFetch.mockClear();
	});

	it("should handle package with versions", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"2.0.0": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await allPackageVersions("test-package", "^1.0.0");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: true },
			{ version: "1.1.0", satisfied: true },
			{ version: "2.0.0", satisfied: false },
		]);
	});

	it("should handle package that does not exist (404)", async () => {
		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify({ error: "Not Found" }), {
					status: 404,
					statusText: "Not Found",
				}),
			),
		);

		expect(allPackageVersions("nonexistent-package")).rejects.toThrow(
			"Failed to fetch package versions: Package 'nonexistent-package' not found in npm registry",
		);
	});

	it("should handle package with no versions", async () => {
		const mockResponse = {
			versions: {},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await allPackageVersions("empty-package", "^1.0.0");

		expect(result).toEqual([]);
	});

	it("should handle invalid response format", async () => {
		const invalidResponse = {
			name: "test-package",
			// Missing versions property
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(invalidResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		await expect(allPackageVersions("invalid-package")).rejects.toThrow(
			"Failed to fetch package versions: Invalid npm registry response format",
		);
	});

	it("should handle network failure", async () => {
		mockFetch.mockImplementation(() =>
			Promise.reject(new Error("Network error")),
		);

		await expect(allPackageVersions("test-package")).rejects.toThrow(
			"Failed to fetch package versions: Network error",
		);
	});

	it("should handle server errors (500)", async () => {
		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response("Internal Server Error", {
					status: 500,
					statusText: "Internal Server Error",
				}),
			),
		);

		expect(allPackageVersions("test-package")).rejects.toThrow(
			"Failed to fetch package versions: Failed to fetch package versions: 500 Internal Server Error",
		);
	});

	it("should handle semver range correctly and exclude prerelease by default", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"2.0.0": {},
				"2.1.0-beta.1": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await allPackageVersions("test-package", "~1.0.0");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: true },
			{ version: "1.1.0", satisfied: false },
			{ version: "2.0.0", satisfied: false },
		]);
	});

	it("should exclude prerelease versions by default", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"2.0.0": {},
				"2.1.0-beta.1": {},
				"2.2.0-alpha.1": {},
				"3.0.0": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await allPackageVersions("test-package", ">=1.0.0");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: true },
			{ version: "1.1.0", satisfied: true },
			{ version: "2.0.0", satisfied: true },
			{ version: "3.0.0", satisfied: true },
		]);
	});

	it("should include prerelease versions when showPrerelease is true", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"2.0.0": {},
				"2.1.0-beta.1": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await allPackageVersions("test-package", undefined, {
			showPrerelease: true,
		});

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: false },
			{ version: "1.1.0", satisfied: false },
			{ version: "2.0.0", satisfied: false },
			{ version: "2.1.0-beta.1", satisfied: false },
		]);
	});

	it("should handle no semver range provided and exclude prerelease by default", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"2.0.0": {},
				"2.1.0-beta.1": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await allPackageVersions("test-package");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: false },
			{ version: "2.0.0", satisfied: false },
		]);
	});

	it("should throw error for invalid semver range", () => {
		expect(allPackageVersions("test-package", "not-a-semver")).rejects.toThrow(
			"Invalid semver range: not-a-semver",
		);

		expect(allPackageVersions("test-package", ">=1.0.0 <=")).rejects.toThrow(
			"Invalid semver range: >=1.0.0 <=",
		);

		expect(allPackageVersions("test-package", "^abc")).rejects.toThrow(
			"Invalid semver range: ^abc",
		);
	});

	it("should sort versions correctly", async () => {
		const mockResponse = {
			versions: {
				"2.0.0": {},
				"1.0.0": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await allPackageVersions("test-package");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: false },
			{ version: "2.0.0", satisfied: false },
		]);
	});
});

describe("satisfiedPackageVersions", () => {
	beforeEach(() => {
		mockFetch = mock(() => Promise.resolve(new Response()));
		global.fetch = mockFetch as unknown as typeof fetch;
	});

	afterEach(() => {
		mockFetch.mockClear();
	});

	it("should return only satisfied versions", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"1.2.0": {},
				"2.0.0": {},
				"2.1.0": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await satisfiedPackageVersions("test-package", "^1.0.0");

		expect(result).toEqual(["1.0.0", "1.1.0", "1.2.0"]);
	});

	it("should return empty array when no versions satisfy", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"1.2.0": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await satisfiedPackageVersions("test-package", "^2.0.0");

		expect(result).toEqual([]);
	});

	it("should exclude prerelease versions from satisfied versions by default", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"1.2.0": {},
				"1.3.0-beta.1": {},
				"1.4.0-alpha.2": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await satisfiedPackageVersions("test-package", "^1.0.0");

		expect(result).toEqual(["1.0.0", "1.1.0", "1.2.0"]);
	});

	it("should include prerelease versions in satisfied versions when showPrerelease is true", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"1.2.0": {},
				"1.3.0-beta.1": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await satisfiedPackageVersions("test-package", "^1.0.0", {
			showPrerelease: true,
		});

		expect(result).toEqual(["1.0.0", "1.1.0", "1.2.0", "1.3.0-beta.1"]);
	});
});

describe("fetchPackageVersions", () => {
	beforeEach(() => {
		mockFetch = mock(() => Promise.resolve(new Response()));
		global.fetch = mockFetch as unknown as typeof fetch;
	});

	afterEach(() => {
		mockFetch.mockClear();
	});

	it("should return array of version strings", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
				"1.1.0": {},
				"2.0.0": {},
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await fetchPackageVersions("test-package");

		expect(result).toEqual(["1.0.0", "1.1.0", "2.0.0"]);
	});

	it("should handle 404 errors", async () => {
		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify({ error: "Not Found" }), {
					status: 404,
					statusText: "Not Found",
				}),
			),
		);

		expect(fetchPackageVersions("nonexistent-package")).rejects.toThrow(
			"Failed to fetch package versions: Package 'nonexistent-package' not found in npm registry",
		);
	});
});

describe("fetchPackageInfo", () => {
	beforeEach(() => {
		mockFetch = mock(() => Promise.resolve(new Response()));
		global.fetch = mockFetch as unknown as typeof fetch;
	});

	afterEach(() => {
		mockFetch.mockClear();
	});

	it("should return package info with metadata", async () => {
		const mockResponse: PackumentVersion = {
			_id: "test-package@1.2.3",
			name: "test-package",
			version: "1.2.3",
			description: "A test package for unit testing",
			homepage: "https://example.com",
			repository: {
				type: "git",
				url: "https://github.com/test/test-package",
			},
			_npmVersion: "",
			dist: {
				shasum: "",
				signatures: [],
				tarball: "",
			},
		};

		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await fetchPackageInfo("test-package");

		expect(result).toEqual({
			_id: "test-package@1.2.3",
			name: "test-package",
			description: "A test package for unit testing",
			homepage: "https://example.com",
			repository: {
				type: "git",
				url: "https://github.com/test/test-package",
			},
			_npmVersion: "",
			dist: {
				shasum: "",
				signatures: [],
				tarball: "",
			},
			version: "1.2.3",
		});
	});

	it("should handle 404 errors", async () => {
		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify({ error: "Not Found" }), {
					status: 404,
					statusText: "Not Found",
				}),
			),
		);

		expect(fetchPackageInfo("nonexistent-package")).rejects.toThrow(
			"Failed to fetch package info: Package 'nonexistent-package' not found in npm registry",
		);
	});
});

describe("localPackageSemverRange", () => {
	const originalCwd = process.cwd;
	const mockPackageJson = {
		version: "1.0.0",
		dependencies: {
			"deps-package": "^1.0.0",
		},
		devDependencies: {
			"dev-package": "^1.5.0",
		},
		peerDependencies: {
			"peer-package": ">=1.0.0",
		},
		optionalDependencies: {
			"optional-package": "^2.0.0",
		},
	};

	beforeEach(() => {
		// Mock process.cwd
		process.cwd = mock(() => "/test/dir");

		// Mock the package.json file
		mock.module("/test/dir/package.json", () => mockPackageJson);
	});

	afterEach(() => {
		mock.restore();
		process.cwd = originalCwd;
	});

	it("should return semver range from dependencies", () => {
		const result = localPackageSemverRange("deps-package");
		expect(result).toBe("^1.0.0");
	});

	it("should return semver range from devDependencies", () => {
		const result = localPackageSemverRange("dev-package");
		expect(result).toBe("^1.5.0");
	});

	it("should return semver range from peerDependencies", () => {
		const result = localPackageSemverRange("peer-package");
		expect(result).toBe(">=1.0.0");
	});

	it("should return semver range from optionalDependencies", () => {
		const result = localPackageSemverRange("optional-package");
		expect(result).toBe("^2.0.0");
	});

	it("should throw error when package not found", () => {
		expect(() => localPackageSemverRange("nonexistent-package")).toThrow(
			"Package 'nonexistent-package' not found in package.json",
		);
	});

	it("should throw error when package.json not found", () => {
		// Override the mocked cwd to point to nonexistent directory
		process.cwd = mock(() => "/nonexistent/dir");

		expect(() => localPackageSemverRange("deps-package")).toThrow();
	});

	it("should throw error when package.json is invalid", () => {
		mock.module("/test/dir/package.json", () => ({
			name: "invalid-package",
			version: 10,
		}));

		expect(() => localPackageSemverRange("invalid-package")).toThrow(
			"Invalid package.json",
		);
	});
});

describe("localPackageInstalledVersion", () => {
	const originalCwd = process.cwd;

	beforeEach(() => {
		// Mock process.cwd
		process.cwd = mock(() => "/test/dir");

		// Mock various node_modules package.json files
		mock.module("/test/dir/node_modules/normal-package/package.json", () => ({
			name: "normal-package",
			version: "1.2.3",
		}));

		mock.module(
			"/test/dir/node_modules/@scope/scoped-package/package.json",
			() => ({
				name: "@scope/scoped-package",
				version: "2.1.0",
			}),
		);

		mock.module("/test/dir/node_modules/invalid-package/package.json", () => ({
			name: "invalid-package",
			version: 10,
		}));
	});

	afterEach(() => {
		mock.restore();
		process.cwd = originalCwd;
	});

	it("should return installed version from node_modules", () => {
		const result = localPackageInstalledVersion("normal-package");
		expect(result).toBe("1.2.3");
	});

	it("should handle scoped packages", () => {
		const result = localPackageInstalledVersion("@scope/scoped-package");
		expect(result).toBe("2.1.0");
	});

	it("should throw error when package not installed", () => {
		expect(() => localPackageInstalledVersion("nonexistent-package")).toThrow();
	});

	it("should throw error if package.json is invalid", () => {
		expect(() => localPackageInstalledVersion("invalid-package")).toThrow(
			"Invalid package.json",
		);
	});
});
