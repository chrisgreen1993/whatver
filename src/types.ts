import type { Dist, Manifest, PackageJSON, PackumentVersion } from "@npm/types";

export interface PackageVersionInfo {
	version: string;
	satisfied: boolean;
}

export interface PackageVersionOptions {
	showPrerelease?: boolean;
}

// Not a comprehensive check, but good enough for our use case
export function isNpmManifest(data: unknown): data is Manifest {
	return (
		typeof data === "object" &&
		data !== null &&
		"versions" in data &&
		typeof data.versions === "object"
	);
}

// Not a comprehensive check, but good enough for our use case
export function isPackageJSON(data: unknown): data is PackageJSON {
	return (
		typeof data === "object" &&
		data !== null &&
		"version" in data &&
		typeof data.version === "string"
	);
}

export function isNpmDist(data: unknown): data is Dist {
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

export function isNpmPackumentVersion(data: unknown): data is PackumentVersion {
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
