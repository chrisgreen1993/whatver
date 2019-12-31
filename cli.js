#! /usr/bin/env node
const allVersions = require("./lib");
const columns = require("cli-columns");
const chalk = require("chalk");

const USAGE_TEXT = `
Usage: whatver [package name] [semver range]

Example: whatver lodash "^1.1"
`;

const parseArguments = (args) => {
  const [,, ...programArgs] = args;
  return programArgs;
}

(async (args) => {
  try {
    const programArgs = parseArguments(args);
    if (!programArgs.length || programArgs[0] === "--help") {
      console.log(USAGE_TEXT);
      return;
    }
    const [pkgName, semverRange] = programArgs;
    const versions = await allVersions(pkgName, semverRange);
    const colouredValidVersions = versions.map(version => (
      version.satisfies ? chalk.green(version.version) : version.version
    ));
    console.log(columns(colouredValidVersions, { sort: false }));
  } catch (error) {
    console.error(error.message);
  }

})(process.argv);
