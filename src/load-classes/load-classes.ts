import * as vscode from "vscode";
import { getFileName } from "./get-file-name";
import { getContentClassesFile } from "./get-content-classes-file";

export const loadClasses = async () => {
  const classesFile = await getContentClassesFile();

  if (!classesFile) return;

  const { loadedClassMaps, failedUris } = classesFile;

  if (failedUris.length > 0) {
    vscode.window.showWarningMessage(
      `CSS IntelliSense: failed to read ${failedUris
        .map((uri) => uri.fsPath)
        .join(", ")}.`,
    );
  }

  if (loadedClassMaps.length > 0) {
    return {
      sourceLabel: loadedClassMaps
        .map(({ uri }) => getFileName(uri.fsPath))
        .join(", "),
      classMap: Object.assign(
        {},
        ...loadedClassMaps.map(({ classMap }) => classMap),
      ),
    };
  }
};
