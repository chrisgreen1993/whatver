#! /usr/bin/env node
const checkVersions = require("./lib");
const columns = require("cli-columns");
const { default: chalk } = require("chalk");

const USAGE_TEXT = `
Usage: whatver [package name] [semver range]

Example: whatver lodash "^1.1"
`;

const parseArguments = (args) => {
  const [,, ...programArgs] = args;
  return programArgs;
}

const colourValidVersions = (versions) => (
  versions.map(({ version, satisfied }) => (
    satisfied ? chalk.green(version) : version)
  )
);

(async (args) => {
  try {
    const programArgs = parseArguments(args);
    if (!programArgs.length || programArgs[0] === "--help") {
      console.log(USAGE_TEXT);
      return;
    }
    const [pkgName, semverRange] = programArgs;
    const versions = await checkVersions(pkgName, semverRange);
    const versionsWithColour = colourValidVersions(versions);
    console.log(columns(versionsWithColour, { sort: false }));
  } catch (error) {
    console.error(error.message);
  }

})(process.argv);
