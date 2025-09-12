#!/usr/bin/env node

import chalk from "chalk";
import columns from "cli-columns";
import { allVersions } from "./index";
import type { PackageVersionInfo } from "./types";

const USAGE_TEXT = `
Usage: whatver [package name] [semver range]

Example: whatver lodash "^1.1"
`;

function parseArguments(args: string[]): string[] {
	const [, , ...programArgs] = args;
	return programArgs;
}

function colourValidVersions(versions: PackageVersionInfo[]): string[] {
	return versions.map(({ version, satisfied }) =>
		satisfied ? chalk.green(version) : version,
	);
}

(async (args: string[]) => {
	try {
		const programArgs = parseArguments(args);
		const [pkgName, semverRange] = programArgs;
		if (!programArgs.length || programArgs[0] === "--help" || !pkgName) {
			console.log(USAGE_TEXT);
			return;
		}
		const versions = await allVersions(pkgName, semverRange);
		const versionsWithColour = colourValidVersions(versions);
		console.log(columns(versionsWithColour, { sort: false }));
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
	}
})(process.argv);
