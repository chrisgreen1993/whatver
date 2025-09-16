#!/usr/bin/env node

import chalk from "chalk";
import columns from "cli-columns";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { formatLocalPackageInfo, formatVersionString } from "./format";
import {
	allPackageVersions,
	localPackageInstalledVersion,
	localPackageSemverRange,
	satisfiedPackageVersions,
} from "./index";
import { ignoreErrors } from "./utils";

yargs(hideBin(process.argv))
	.command(
		"$0 <package> [range]",
		"Check npm package versions against semver ranges (shows only matching versions by default)",
		(yargs) => {
			return yargs
				.positional("package", {
					describe: "The npm package name to check",
					type: "string",
					demandOption: true,
				})
				.positional("range", {
					describe: "The semver range to check against (optional)",
					type: "string",
				})
				.option("all", {
					describe: "Show all versions (including non-matching ones)",
					type: "boolean",
					default: false,
				});
		},
		async ({ package: pkg, range, all }) => {
			try {
				// Always check for local package information
				const localRange = ignoreErrors(() => localPackageSemverRange(pkg));
				const installedVersion = ignoreErrors(() =>
					localPackageInstalledVersion(pkg),
				);

				// Display local package info if found
				if (localRange || installedVersion) {
					console.log(
						formatLocalPackageInfo(pkg, localRange, installedVersion),
					);
				}

				// Determine what range to use and whether to show all versions
				const effectiveRange = range || localRange;
				const showAllVersions = all || !effectiveRange;

				if (showAllVersions) {
					// Show all versions (with highlighting if there's a range)
					const versions = await allPackageVersions(pkg, effectiveRange);
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
					const versions = await satisfiedPackageVersions(pkg, effectiveRange);
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
	.example("whatver lodash", "List all versions of lodash")
	.example('whatver lodash "^1.1"', "List versions of lodash satisfying ^1.1")
	.example(
		'whatver lodash "^1.1" --all',
		"List all versions of lodash with the ^1.1 range highlighted",
	)
	.help()
	.version()
	.alias("help", "h")
	.alias("version", "v")
	.alias("all", "a")
	.showHelpOnFail(false)
	.fail((msg, _err, yargs) => {
		// We show the help on fail manually so its coloured correctly
		console.log(yargs.help());
		console.error(chalk.bold(`\nError: ${msg}`));
		process.exit(1);
	})
	.parse();
