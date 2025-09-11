import { promisify } from "util";
import { exec } from "child_process";
import { satisfies } from "semver";
import type { VersionInfo } from "./types.js";

const execCommand = promisify(exec);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

const fetchPackageVersions = async (pkgName: string): Promise<string[]> => {
  const { stdout } = await execCommand(`npm view ${pkgName} versions --json`);
  const parsed = JSON.parse(stdout);
  if (isStringArray(parsed)) {
    return parsed;
  }
  throw new Error('Invalid npm versions response format');
}

export default async (pkgName: string, semverRange?: string): Promise<VersionInfo[]> => {
  const versions = await fetchPackageVersions(pkgName);
  return versions.map(version => ({ version, satisfied: semverRange ? satisfies(version, semverRange) : false }));
}