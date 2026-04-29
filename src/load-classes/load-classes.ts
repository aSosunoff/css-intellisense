import * as vscode from "vscode";
import { findDefaultClassesFile } from "./find-default-classes-file";
import { getConfig } from "./get-config";
import { getConfiguredFileUri } from "./get-configured-file-uri";
import { readClassMap } from "./read-class-map";

export const loadClasses = async () => {
  const config = getConfig();
  const classesFilePath = config.get<string>("classesFilePath", "");
  const classesFileName = config.get<string>("classesFileName", "classes.json");
  console.log({ classesFilePath, classesFileName });

  const configuredFileUri = getConfiguredFileUri(classesFilePath);
  const defaultFileUri = await findDefaultClassesFile(classesFileName);

  const classesFileUri = configuredFileUri || defaultFileUri;

  if (classesFileUri) {
    try {
      const classMap = await readClassMap(classesFileUri);
      return {
        sourceLabel: classesFilePath || classesFileName,
        classMap,
      };
    } catch (error) {
      vscode.window.showWarningMessage(
        `CSS IntelliSense: failed to read ${classesFileUri.fsPath}. Using bundled classes.`,
      );
    }
  }

  return {
    sourceLabel: "",
    classMap: null,
  };
};
