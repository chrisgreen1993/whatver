import type { Dist, Manifest, PackageJSON, PackumentVersion } from "@npm/types";
import { prerelease, satisfies, sort, validRange } from "semver";
import type { PackageVersionInfo, PackageVersionOptions } from "./types";

// Not a comprehensive check, but good enough for our use case
function isNpmManifest(data: unknown): data is Manifest {
	return (
		typeof data === "object" &&
		data !== null &&
		"versions" in data &&
		typeof data.versions === "object"
	);
}

// Not a comprehensive check, but good enough for our use case
function isPackageJSON(data: unknown): data is PackageJSON {
	return (
		typeof data === "object" &&
		data !== null &&
		"version" in data &&
		typeof data.version === "string"
	);
}

function isNpmDist(data: unknown): data is Dist {
	return (
		typeof data === "object" &&
		data !== null &&
		"shasum" in data &&
		typeof data.shasum === "string" &&
		"signatures" in data &&
		Array.isArray(data.signatures) &&
		"tarball" in data &&
		typeof data.tarball === "string"
	);
}

function isNpmPackumentVersion(data: unknown): data is PackumentVersion {
	return (
		typeof data === "object" &&
		data !== null &&
		"name" in data &&
		typeof data.name === "string" &&
		"_id" in data &&
		typeof data._id === "string" &&
		"dist" in data &&
		typeof data.dist === "object" &&
		data.dist !== null &&
		isNpmDist(data.dist)
	);
}

export async function fetchPackageVersions(pkgName: string): Promise<string[]> {
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
				`Failed to fetch package versions: ${response.status} ${response.statusText}`,
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

export async function fetchPackageInfo(
	pkgName: string,
): Promise<PackumentVersion> {
	const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(pkgName)}/latest`;

	try {
		const response = await fetch(registryUrl);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error(`Package '${pkgName}' not found in npm registry`);
			}
			throw new Error(
				`Failed to fetch package info: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();

		if (!isNpmPackumentVersion(data)) {
			throw new Error("Invalid npm registry response format");
		}

		return data;
	} catch (error) {
		throw new Error(
			`Failed to fetch package info: ${error instanceof Error ? error.message : error}`,
			{ cause: error },
		);
	}
}

// list all versions and whether they satisfy the semver range
export async function allPackageVersions(
	pkgName: string,
	semverRange?: string,
	options: PackageVersionOptions = {},
): Promise<PackageVersionInfo[]> {
	const { showPrerelease = false } = options;

	if (semverRange && !validRange(semverRange)) {
		throw new Error(`Invalid semver range: ${semverRange}`);
	}

	const versions = await fetchPackageVersions(pkgName);
	// The response from the npm registry is not sorted, so we need to sort it by version
	const sortedVersions = sort(versions);

	// Filter out prerelease versions by default
	const filteredVersions = showPrerelease
		? sortedVersions
		: sortedVersions.filter((version) => !prerelease(version));

	return filteredVersions.map((version) => ({
		version,
		satisfied: semverRange
			? satisfies(version, semverRange, { includePrerelease: showPrerelease })
			: false,
	}));
}

// List only the versions that satisfy the semver range
export async function satisfiedPackageVersions(
	pkgName: string,
	semverRange: string,
	options: PackageVersionOptions = {},
): Promise<string[]> {
	const versions = await allPackageVersions(pkgName, semverRange, options);
	return versions
		.filter((version) => version.satisfied)
		.map((version) => version.version);
}

// Find semver range for a package in local package.json
export function localPackageSemverRange(pkgName: string): string {
	// Try to import package.json from current working directory
	const packageJson = require(`${process.cwd()}/package.json`);

	if (!isPackageJSON(packageJson)) {
		throw new Error("Invalid package.json");
	}

	// Check dependencies, devDependencies, peerDependencies, and optionalDependencies
	const depTypes = [
		"dependencies",
		"devDependencies",
		"peerDependencies",
		"optionalDependencies",
	] as const;

	for (const depType of depTypes) {
		if (packageJson[depType]?.[pkgName]) {
			return packageJson[depType][pkgName];
		}
	}

	throw new Error(`Package '${pkgName}' not found in package.json`);
}

export function localPackageInstalledVersion(pkgName: string): string {
	const nodeModulesPackageJson = require(
		`${process.cwd()}/node_modules/${pkgName}/package.json`,
	);

	if (!isPackageJSON(nodeModulesPackageJson)) {
		throw new Error("Invalid package.json");
	}

	return nodeModulesPackageJson.version;
}
