import type { PackumentVersion } from "@npm/types";
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
		return "";
	}
	let result = `./node_modules/${pkgName}`;

	if (installedVersion) {
		result += ` | ${chalk.magentaBright.bold(`✔ ${installedVersion}`)}`;
	}
	if (localRange) {
		result += ` | ${chalk.yellowBright.bold(localRange)}`;
	}

	return chalk.cyan(result);
}

type PackageInfo = Pick<
	PackumentVersion,
	"name" | "description" | "homepage" | "repository"
>;

export function formatPackageInfo(packageData: PackageInfo): string {
	let result = chalk.cyanBright.bold(packageData.name);

	// Add homepage URL in brackets if available
	if (packageData.homepage) {
		result += ` | ${chalk.dim(packageData.homepage)}`;
	}

	return result;
}
