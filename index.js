#! /usr/bin/env node

const { promisify } = require("util");
const { exec } = require("child_process");
const { satisfies } = require("semver");
const columns = require("cli-columns");
const chalk = require("chalk");

const USAGE_TEXT = `
Usage: whatver [package name] [semver range]

Example: whatver lodash ^1.1
`;


const execCommand = promisify(exec);

const fetchPackageVersions = async (pkgName) => {
  const { stdout } = await execCommand(`npm view ${pkgName} versions --json`);
  return JSON.parse(stdout);
}

const parseArguments = (args) => {
  const [,, ...programArgs] = args;
  return programArgs;
}

(async (args) => {
  try {
    const programArgs = parseArguments(args);
    if (!programArgs.length) {
      console.log(USAGE_TEXT);
      process.exit(0);
    }
    const [pkgName, semverRange] = programArgs;
    const versions = await fetchPackageVersions(pkgName);
    const colouredValidVersions = versions.map(version => (
      satisfies(version, semverRange) ? chalk.green(version) : version
    ));
    console.log(columns(colouredValidVersions, { sort: false }));
  } catch (error) {
    console.error(error.message);
  }

})(process.argv);
