#!/usr/bin/env node

import chalk from "chalk";
import columns from "cli-columns";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { allVersions, satisfiedVersions } from "./index";

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
				if (!range || all) {
					const versions = await allVersions(pkg, range);
					const versionsWithColour = versions.map(({ version, satisfied }) =>
						satisfied ? chalk.green.bold(version) : version,
					);
					console.log(columns(versionsWithColour, { sort: false }));
				} else {
					const versions = await satisfiedVersions(pkg, range);
					const versionsWithColour = versions.map((version) =>
						chalk.green.bold(version),
					);
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
	.alias("help", "h")
	.version()
	.alias("version", "v")
	.showHelpOnFail(false)
	.fail((msg, _err, yargs) => {
		// We show the help on fail manually so its coloured correctly
		console.log(yargs.help());
		console.error(chalk.bold(`\nError: ${msg}`));
		process.exit(1);
	})
	.parse();
