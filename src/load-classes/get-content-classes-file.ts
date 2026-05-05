import { readClassesFile } from "./read-classes-file";
import { getConfiguredFilesUri } from "./get-configured-files-uri";
import { readConfig } from "./read-config";
import { CONFIG_NAME } from "../constants";

export const getContentClassesFile = async () => {
  const configContent = await readConfig<{
    classesFilePath: [];
  }>(CONFIG_NAME);

  if (!configContent) return;

  const { classesFilePath } = configContent;

  const configuredFileUris = getConfiguredFilesUri(classesFilePath);

  if (configuredFileUris.length > 0) {
    const classesFile = await readClassesFile(configuredFileUris);

    return classesFile;
  }
};
