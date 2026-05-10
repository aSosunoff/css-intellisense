import * as vscode from "vscode";
import { readFileJson } from "./read-class-map";
import { ClassInfo } from "./ClassInfo";

export const readClassesFile = async (classesFileUris: vscode.Uri[]) => {
  const results = await Promise.allSettled(
    classesFileUris.map((uri) => readFileJson<Record<string, ClassInfo>>(uri)),
  );

  const loadedClassMaps = results.flatMap((result, index) =>
    result.status === "fulfilled"
      ? [{ classesFileUris: classesFileUris[index], classMap: result.value }]
      : [],
  );

  const failedUris = results.flatMap((result, index) =>
    result.status === "rejected" ? [classesFileUris[index]] : [],
  );

  return {
    loadedClassMaps,
    failedUris,
  };
};
