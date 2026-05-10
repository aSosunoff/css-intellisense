import * as vscode from "vscode";
import { readClassesFile } from "./read-classes-file";
import { getConfiguredFilesUri } from "./get-configured-files-uri";
import { readConfig } from "./read-config";
import { CONFIG_NAME } from "../constants";

type ContentFromConfigFile = {
  classesFilePath?: string[];
};

export const getContentClassesFile = async (
  workspaceFoldersUri: vscode.Uri,
) => {
  const configRelativeUri = vscode.Uri.joinPath(
    workspaceFoldersUri,
    CONFIG_NAME,
  );

  try {
    const config = await readConfig<ContentFromConfigFile>(configRelativeUri);

    if (!config) return;

    if (!config || typeof config !== "object") return;

    if (!("classesFilePath" in config)) {
      vscode.window.showWarningMessage(
        "CSS IntelliSense: config is missing classesFilePath",
      );
      return;
    }

    if (!Array.isArray(config.classesFilePath)) {
      vscode.window.showWarningMessage(
        "CSS IntelliSense: classesFilePath must be an array",
      );
      return;
    }

    const { classesFilePath } = config;

    const configuredFileUris = getConfiguredFilesUri(
      workspaceFoldersUri,
      classesFilePath,
    );

    if (configuredFileUris.length > 0) {
      const classesFile = await readClassesFile(configuredFileUris);

      const { loadedClassMaps, failedUris } = classesFile;

      if (failedUris.length > 0) {
        vscode.window.showWarningMessage(
          `CSS IntelliSense: failed to read ${failedUris
            .map((uri) => uri.fsPath)
            .join(", ")}.`,
        );
      }

      return loadedClassMaps;
    }
  } finally {
  }
};
