#!/usr/bin/env node

import chalk from "chalk";
import columns from "cli-columns";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { allVersions } from "./index";
import type { PackageVersionInfo } from "./types";

function colourValidVersions(versions: PackageVersionInfo[]): string[] {
	return versions.map(({ version, satisfied }) =>
		satisfied ? chalk.green.bold(version) : version,
	);
}

yargs(hideBin(process.argv))
	.command(
		"$0 <package> [range]",
		"Check npm package versions against semver ranges",
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
				});
		},
		async (argv) => {
			try {
				const versions = await allVersions(argv.package, argv.range);
				const versionsWithColour = colourValidVersions(versions);
				console.log(columns(versionsWithColour, { sort: false }));
			} catch (error) {
				console.error(error instanceof Error ? error.message : error);
			}
		},
	)
	.example("whatver lodash", "List all versions of lodash")
	.example('whatver lodash "^1.1"', "List versions of lodash matching ^1.1")
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
