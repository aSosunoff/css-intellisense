import { findDefaultClassesFile } from "./find-default-classes-file";
import { getConfig } from "./get-config";
import { getConfiguredFilesUri } from "./get-configured-files-uri";

export const getClassesFileUris = async () => {
  const config = getConfig();
  const classesFilePath = config.get<string[]>("classesFilePath", []);
  const classesFileName = config.get<string>("classesFileName", "classes.json");

  const configuredFileUris = getConfiguredFilesUri(classesFilePath);

  const defaultFileUri = await findDefaultClassesFile(classesFileName);

  return defaultFileUri
    ? [...configuredFileUris, defaultFileUri]
    : configuredFileUris;
};
