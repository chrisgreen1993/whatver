import chalk from "chalk";

export function formatVersionString(
	version: string,
	isInstalled: boolean,
	isSatisfied: boolean,
	isLocalRange: boolean,
): string {
	const satisfiedColor = isLocalRange ? chalk.yellowBright : chalk.greenBright;
	if (isInstalled && isSatisfied) {
		return chalk.magentaBright.bold("✔ ") + satisfiedColor.bold(version);
	} else if (isInstalled) {
		return chalk.magentaBright.bold("✔ ") + chalk.magentaBright.bold(version);
	} else if (isSatisfied) {
		return satisfiedColor.bold(`  ${version}`);
	} else {
		return chalk.gray(`  ${version}`);
	}
}

export function formatLocalPackageInfo(
	pkgName: string,
	localRange?: string,
	installedVersion?: string,
) {
	if (!localRange && !installedVersion) {
		return chalk.cyan(
			`Found ${chalk.bold(pkgName)} locally with no range or installed version`,
		);
	}
	const parts = [];
	if (localRange) {
		parts.push(`range: ${chalk.yellow.bold(localRange)}`);
	}
	if (installedVersion) {
		parts.push(
			`installed: ${chalk.magentaBright.bold(`✔ ${installedVersion}`)}`,
		);
	}
	return chalk.cyan(
		`Found ${chalk.bold(pkgName)} locally with ${parts.join(", ")}`,
	);
}
