import * as vscode from "vscode";
import { readClassesFile } from "./read-classes-file";
import { getConfiguredFilesUri } from "./get-configured-files-uri";
import { readConfig } from "./read-config";
import { CONFIG_NAME } from "../constants";

export const getContentClassesFile = async () => {
  const configContent = await readConfig<{
    classesFilePath?: string[];
  }>(CONFIG_NAME);

  if (!configContent || typeof configContent !== "object") return;

  if (!("classesFilePath" in configContent)) {
    vscode.window.showWarningMessage(
      "CSS IntelliSense: config is missing classesFilePath",
    );
    return;
  }

  if (!Array.isArray(configContent.classesFilePath)) {
    vscode.window.showWarningMessage(
      "CSS IntelliSense: classesFilePath must be an array",
    );
    return;
  }

  const { classesFilePath } = configContent;

  const configuredFileUris = getConfiguredFilesUri(classesFilePath);

  if (configuredFileUris.length > 0) {
    const classesFile = await readClassesFile(configuredFileUris);

    return classesFile;
  }
};
