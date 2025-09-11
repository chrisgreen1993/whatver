import chalk from "chalk";
import columns from "cli-columns";
import checkVersions from "./lib.js";
import type { VersionInfo } from "./types.js";

const USAGE_TEXT = `
Usage: whatver [package name] [semver range]

Example: whatver lodash "^1.1"
`;

const parseArguments = (args: string[]): string[] => {
	const [, , ...programArgs] = args;
	return programArgs;
};

const colourValidVersions = (versions: VersionInfo[]): string[] =>
	versions.map(({ version, satisfied }) =>
		satisfied ? chalk.green(version) : version,
	);

(async (args: string[]) => {
	try {
		const programArgs = parseArguments(args);
		const [pkgName, semverRange] = programArgs;
		if (!programArgs.length || programArgs[0] === "--help" || !pkgName) {
			console.log(USAGE_TEXT);
			return;
		}
		const versions = await checkVersions(pkgName, semverRange);
		const versionsWithColour = colourValidVersions(versions);
		console.log(columns(versionsWithColour, { sort: false }));
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
	}
})(process.argv);
