import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	mock,
} from "bun:test";
import checkVersions from "./index";

let mockFetch: Mock<() => Promise<Response>>;

describe("checkVersions", () => {
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

		const result = await checkVersions("test-package", "^1.0.0");

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

		expect(checkVersions("nonexistent-package")).rejects.toThrow(
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

		const result = await checkVersions("empty-package", "^1.0.0");

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

		await expect(checkVersions("invalid-package")).rejects.toThrow(
			"Failed to fetch package versions: Invalid npm registry response format",
		);
	});

	it("should handle network failure", async () => {
		mockFetch.mockImplementation(() =>
			Promise.reject(new Error("Network error")),
		);

		await expect(checkVersions("test-package")).rejects.toThrow(
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

		expect(checkVersions("test-package")).rejects.toThrow(
			"Failed to fetch package versions: Failed to fetch package info: 500 Internal Server Error",
		);
	});

	it("should handle semver range correctly", async () => {
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

		const result = await checkVersions("test-package", "~1.0.0");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: true },
			{ version: "1.1.0", satisfied: false },
			{ version: "2.0.0", satisfied: false },
			{ version: "2.1.0-beta.1", satisfied: false },
		]);
	});

	it("should handle no semver range provided", async () => {
		const mockResponse = {
			versions: {
				"1.0.0": {},
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

		const result = await checkVersions("test-package");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: false },
			{ version: "2.0.0", satisfied: false },
		]);
	});

	it("should throw error for invalid semver range", () => {
		expect(checkVersions("test-package", "not-a-semver")).rejects.toThrow(
			"Invalid semver range: not-a-semver",
		);

		expect(checkVersions("test-package", ">=1.0.0 <=")).rejects.toThrow(
			"Invalid semver range: >=1.0.0 <=",
		);

		expect(checkVersions("test-package", "^abc")).rejects.toThrow(
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

		const result = await checkVersions("test-package");

		expect(result).toEqual([
			{ version: "1.0.0", satisfied: false },
			{ version: "2.0.0", satisfied: false },
		]);
	});
});
