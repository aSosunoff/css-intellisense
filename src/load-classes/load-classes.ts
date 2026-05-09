import * as vscode from "vscode";
import { getFileName } from "./get-file-name";
import { getContentClassesFile } from "./get-content-classes-file";
import { ClassInfo } from "./ClassInfo";
import { WithSourceFileName } from "./with-source-file-name.types";

export const loadClasses = async (): Promise<
  Record<string, WithSourceFileName<ClassInfo>> | undefined
> => {
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
    return Object.assign(
      {},
      ...loadedClassMaps.map(({ classMap, uri }) =>
        Object.fromEntries(
          Object.entries(classMap).map(([className, data]) => [
            className,
            {
              ...data,
              sourceFileName: getFileName(uri.fsPath),
            } satisfies ClassInfo & { sourceFileName: string },
          ]),
        ),
      ),
    );
  }
};
