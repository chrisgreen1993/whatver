#! usr/bin/env node

const { promisify } = require("util");
const { exec } = require("child_process");
const { satisfies } = require("semver");
const columns = require("cli-columns");
const chalk = require("chalk");

const execCommand = promisify(exec);

const fetchPackageVersions = async (pkgName) => {
  const { stdout } = await execCommand(`npm view ${pkgName} versions --json`);
  return JSON.parse(stdout);
}

const parseArguments = (args) => args.slice(-2);

(async (args) => {
  try {
    const [pkgName, semverRange] = parseArguments(args);
    const versions = await fetchPackageVersions(pkgName);
    const colouredValidVersions = versions.map(version => (
      satisfies(version, semverRange) ? chalk.green(version) : version
    ));
    console.log(columns(colouredValidVersions, { sort: false }));
  } catch (error) {
    console.error(error.message);
  }

})(process.argv);
