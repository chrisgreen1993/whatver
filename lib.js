const { promisify } = require("util");
const { exec } = require("child_process");
const { satisfies } = require("semver");

const execCommand = promisify(exec);

const fetchPackageVersions = async (pkgName) => {
  const { stdout } = await execCommand(`npm view ${pkgName} versions --json`);
  return JSON.parse(stdout);
}

module.exports = async (pkgName, semverRange)  => {
  const versions = await fetchPackageVersions(pkgName);
  return versions.map(version => ({ version, satisfies: satisfies(version, semverRange) }));
}