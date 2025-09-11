import type { Manifest } from "@npm/types";
import { satisfies } from "semver";
import type { VersionInfo } from "./types.js";

// Not a comprehensive check, but good enough for our use case
function isNpmManifest(data: unknown): data is Manifest {
	return (
		typeof data === "object" &&
		data !== null &&
		"versions" in data &&
		typeof data.versions === "object"
	);
}

async function fetchPackageVersions(pkgName: string): Promise<string[]> {
	const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(pkgName)}`;

	try {
		const response = await fetch(registryUrl, {
			headers: {
				// This gives us a smaller abbreviated manifest
				// See here: https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md
				Accept: "application/vnd.npm.install-v1+json",
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error(`Package '${pkgName}' not found in npm registry`);
			}
			throw new Error(
				`Failed to fetch package info: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();

		if (!isNpmManifest(data)) {
			throw new Error("Invalid npm registry response format");
		}

		return Object.keys(data.versions);
	} catch (error) {
		throw new Error(
			`Failed to fetch package versions: ${error instanceof Error ? error.message : error}`,
			{ cause: error },
		);
	}
}

export default async function checkVersions(
	pkgName: string,
	semverRange?: string,
): Promise<VersionInfo[]> {
	const versions = await fetchPackageVersions(pkgName);
	return versions.map((version) => ({
		version,
		satisfied: semverRange ? satisfies(version, semverRange) : false,
	}));
}
