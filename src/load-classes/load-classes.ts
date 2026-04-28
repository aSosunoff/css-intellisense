import * as vscode from "vscode";
import { findDefaultClassesFile } from "./find-default-classes-file";
import { getConfig } from "./get-config";
import { getConfiguredFileUri } from "./get-configured-file-uri";
import { readClassMap } from "./read-class-map";
import { classRegistry } from "../class-registry";
import bundledClasses from "../classes.json";

export const loadClasses = async (context: vscode.ExtensionContext) => {
  const config = getConfig();
  const classesFilePath = config.get<string>("classesFilePath", "");
  const classesFileName = config.get<string>("classesFileName", "classes.json");

  const configuredFileUri = getConfiguredFileUri(classesFilePath);
  const defaultFileUri = await findDefaultClassesFile(classesFileName);

  const classesFileUri = configuredFileUri ?? defaultFileUri;

  if (classesFileUri) {
    try {
      classRegistry.setSourceLabel(classesFilePath ?? classesFileName);
      const classMap = await readClassMap(classesFileUri);
      classRegistry.setClassMap(classMap);
      return;
    } catch (error) {
      vscode.window.showWarningMessage(
        `CSS IntelliSense: failed to read ${classesFileUri.fsPath}. Using bundled classes.`,
      );
    }
  }

  classRegistry.setSourceLabel("");

  if (context.extensionMode === vscode.ExtensionMode.Development) {
    classRegistry.setClassMap(bundledClasses);
  } else {
    classRegistry.setClassMap({});
  }
};
