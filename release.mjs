import { fileURLToPath, pathToFileURL } from "url";
import { execSync } from "node:child_process";
import * as fs from "node:fs/promises";

const RELEASE_TYPES = new Set(["major", "minor", "patch"]);

const parseVersion = (version) => {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)$/);

  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

const compareVersions = (a, b) => {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
};

const formatVersion = ({ major, minor, patch }) => `${major}.${minor}.${patch}`;

const bumpVersion = (version, releaseType) => {
  if (releaseType === "major") {
    return { major: version.major + 1, minor: 0, patch: 0 };
  }

  if (releaseType === "minor") {
    return { major: version.major, minor: version.minor + 1, patch: 0 };
  }

  return {
    major: version.major,
    minor: version.minor,
    patch: version.patch + 1,
  };
};

const getLatestTagVersion = () => {
  const tags = execSync("git tag -l")
    .toString()
    .split("\n")
    .map((tag) => parseVersion(tag.trim()))
    .filter(Boolean);

  if (tags.length === 0) return { major: 0, minor: 0, patch: 0 };

  const sortedVersion = tags.sort(compareVersions);
  const lastVersion = sortedVersion.at(-1);

  return lastVersion;
};

const getLastFileVsix = async () => {
  const files = await fs.readdir(".");
  const vsixFiles = files.filter((file) => file.endsWith(".vsix"));
  const fileName = vsixFiles.at(-1);
  return fileName;
};

export const release = async (releaseType) => {
  if (!RELEASE_TYPES.has(releaseType)) {
    throw new Error(
      `Unknown release type "${releaseType}". Use major, minor or patch.`,
    );
  }

  const latestVersion = getLatestTagVersion();
  const version = formatVersion(bumpVersion(latestVersion, releaseType));
  const tag = `v${version}`;

  execSync(`npm version ${version} --no-git-tag-version --ignore-scripts`, {
    stdio: "inherit",
  });
  execSync("git add package.json package-lock.json");

  execSync(`npm run pack`, { stdio: "inherit" });
  const fileName = await getLastFileVsix();
  execSync(`git add ${fileName}`);

  execSync(`git commit -m "Release ${version}"`, { stdio: "inherit" });

  execSync(`git tag ${tag}`);
};

const isCliRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliRun) {
  const releaseType = process.argv[2] ?? "minor";

  release(releaseType);
}
