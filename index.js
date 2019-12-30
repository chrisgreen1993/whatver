#! usr/bin/env node

const { promisify } = require("util");
const { exec } = require("child_process");
const { satisfies } = require("semver");

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
    const validVersions = versions.filter(version => satisfies(version, semverRange));
    console.log(`Versions of ${pkgName} that satisfy ${semverRange}`)
    validVersions.forEach(version => console.log(version));
  } catch (error) {
    console.error(error.message)
  }

})(process.argv);
