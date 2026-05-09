import * as fs from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "url";
import { execSync } from "node:child_process";

const PACKAGE_JSON_FILE_NAME = "package.json";

const fileExists = async (path) => {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
};

const readFileJson = async (path) => {
  if (!path) return;

  const hasFile = await fileExists(path);

  if (!hasFile) return;

  const bytes = await fs.readFile(path);

  const text = new TextDecoder("utf-8").decode(bytes);

  return JSON.parse(text);
};

const getLastFileVsix = async () => {
  const files = await fs.readdir(".");
  const vsixFiles = files.filter((file) => file.endsWith(".vsix"));
  const fileName = vsixFiles.at(-1);
  return fileName;
};

const pack = async () => {
  execSync(`npm run pack`, { stdio: "inherit" });
  const fileName = await getLastFileVsix();
  execSync(`git add ${fileName}`);

  const pkg = await readFileJson(`./${PACKAGE_JSON_FILE_NAME}`);
  if (!pkg) {
    console.log(`Do not find the <${PACKAGE_JSON_FILE_NAME}>`);
    return;
  }
  const version = pkg.version;
  execSync(`git commit -m "New version extension ${version}"`, {
    stdio: "inherit",
  });
};

const isCliRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliRun) {
  pack();
}
