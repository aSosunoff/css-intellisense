import * as vscode from "vscode";
import { findDefaultClassesFile } from "./find-default-classes-file";
import { getConfig } from "./get-config";
import { getConfiguredFileUri } from "./get-configured-file-uri";
import { readClassMap } from "./read-class-map";
import { getUriFileName } from "./get-uri-file-name";

export const loadClasses = async () => {
  const config = getConfig();
  const classesFilePath = config.get<string[]>("classesFilePath", []);
  const classesFileName = config.get<string>("classesFileName", "classes.json");

  const configuredFileUris = classesFilePath.flatMap((path) => {
    const uri = getConfiguredFileUri(path);

    return uri ? [uri] : [];
  });

  const defaultFileUri = await findDefaultClassesFile(classesFileName);

  const classesFileUris = defaultFileUri
    ? [...configuredFileUris, defaultFileUri]
    : configuredFileUris;

  if (classesFileUris.length > 0) {
    const results = await Promise.allSettled(classesFileUris.map(readClassMap));

    const loadedClassMaps = results.flatMap((result, index) =>
      result.status === "fulfilled"
        ? [{ uri: classesFileUris[index], classMap: result.value }]
        : [],
    );
    const failedUris = results.flatMap((result, index) =>
      result.status === "rejected" ? [classesFileUris[index]] : [],
    );

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
          .map(({ uri }) => getUriFileName(uri))
          .join(", "),
        classMap: Object.assign(
          {},
          ...loadedClassMaps.map(({ classMap }) => classMap),
        ),
      };
    }
  }

  return {
    sourceLabel: "",
    classMap: null,
  };
};
