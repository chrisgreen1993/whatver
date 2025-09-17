#!/usr/bin/env node

import chalk from "chalk";
import columns from "cli-columns";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
	formatLocalPackageInfo,
	formatPackageInfo,
	formatVersionString,
} from "./format";
import {
	allPackageVersions,
	fetchPackageInfo,
	localPackageInstalledVersion,
	localPackageSemverRange,
	satisfiedPackageVersions,
} from "./lib";
import { ignoreErrors } from "./utils";

yargs(hideBin(process.argv))
	.command(
		"$0 <package> [range]",
		"Check npm package versions against semver ranges. Automatically detects local packages from package.json and shows their installed versions if available.",
		(yargs) => {
			return yargs
				.positional("package", {
					describe: "The npm package name to check",
					type: "string",
					demandOption: true,
				})
				.positional("range", {
					describe:
						"The semver range to check against (uses local package.json range if not provided)",
					type: "string",
				})
				.option("all", {
					describe: "Show all versions (including non-matching ones)",
					type: "boolean",
					default: false,
				})
				.option("show-prerelease", {
					describe: "Include prerelease versions (e.g., 1.0.0-alpha.1)",
					type: "boolean",
					default: false,
				});
		},
		async ({ package: pkg, range, all, "show-prerelease": showPrerelease }) => {
			try {
				const packageInfo = await fetchPackageInfo(pkg);
				// Always check for local package information
				const localRange = ignoreErrors(() => localPackageSemverRange(pkg));
				const installedVersion = ignoreErrors(() =>
					localPackageInstalledVersion(pkg),
				);

				// Fetch and display package information
				console.log(formatPackageInfo(packageInfo));
				if (localRange || installedVersion) {
					console.log(
						formatLocalPackageInfo(pkg, localRange, installedVersion),
					);
				}

				// Determine what range to use and whether to show all versions
				const effectiveRange = range || localRange;
				const showAllVersions = all || !effectiveRange;

				const options = { showPrerelease };

				if (showAllVersions) {
					// Show all versions (with highlighting if there's a range)
					const versions = await allPackageVersions(
						pkg,
						effectiveRange,
						options,
					);
					if (!versions.length) {
						console.log(chalk.redBright("No versions found"));
						return;
					}
					const versionsWithColour = versions.map(({ version, satisfied }) => {
						return formatVersionString(
							version,
							version === installedVersion,
							satisfied,
							!range,
						);
					});
					console.log(columns(versionsWithColour, { sort: false }));
				} else {
					// Show only satisfied versions
					const versions = await satisfiedPackageVersions(
						pkg,
						effectiveRange,
						options,
					);
					if (!versions.length) {
						console.log(
							chalk.redBright(`No versions found for range: ${effectiveRange}`),
						);
						return;
					}
					const versionsWithColour = versions.map((version) => {
						return formatVersionString(
							version,
							version === installedVersion,
							true,
							!range,
						);
					});
					console.log(columns(versionsWithColour, { sort: false }));
				}
			} catch (error) {
				console.error(error instanceof Error ? error.message : error);
			}
		},
	)
	.example(
		"whatver lodash",
		"List versions of lodash (uses local semver range if found in package.json)",
	)
	.example('whatver lodash "^4.17"', "List versions of lodash satisfying ^4.17")
	.example(
		"whatver react --all",
		"Show all react versions with local range from package.json highlighted (if installed)",
	)
	.example(
		"whatver typescript --show-prerelease",
		"Include prerelease versions of typescript in results",
	)
	.help()
	.version()
	.alias("help", "h")
	.alias("version", "v")
	.alias("all", "a")
	.alias("show-prerelease", "p")
	.showHelpOnFail(false)
	.fail((msg, _err, yargs) => {
		// We show the help on fail manually so its coloured correctly
		console.log(yargs.help());
		console.error(chalk.redBright(`\nError: ${msg}`));
		process.exit(1);
	})
	.parse();
